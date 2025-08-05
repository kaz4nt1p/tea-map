const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, createSpotSchema } = require('../middleware/validation');
const { asyncHandler, successResponse, NotFoundError, AuthorizationError } = require('../utils/errors');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get all spots with optional authentication
 * GET /api/spots
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { search } = req.query;
  
  // Build search conditions
  const searchConditions = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ]
  } : {};
  
  const spots = await prisma.spot.findMany({
    where: searchConditions,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      media: {
        select: {
          id: true,
          file_path: true,
          file_type: true,
          alt_text: true,
          created_at: true
        }
      },
      activities: {
        select: {
          id: true,
          title: true,
          tea_type: true,
          created_at: true,
          privacy_level: true,
          user: {
            select: {
              username: true,
              display_name: true
            }
          }
        },
        where: {
          // Filter activities based on privacy and user authentication
          OR: [
            { privacy_level: 'public' },
            ...(req.user ? [
              { user_id: req.user.id }, // User's own activities
              { 
                AND: [
                  { privacy_level: 'friends' },
                  { 
                    user: {
                      followers: {
                        some: { follower_id: req.user.id }
                      }
                    }
                  }
                ]
              }
            ] : [])
          ]
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10 // Limit to recent activities
      },
      _count: {
        select: {
          activities: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });
  
  successResponse(res, { spots }, 'Spots retrieved successfully');
}));

/**
 * Get single spot by ID
 * GET /api/spots/:id
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const spot = await prisma.spot.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
          created_at: true
        }
      },
      activities: {
        select: {
          id: true,
          title: true,
          description: true,
          tea_type: true,
          mood_before: true,
          mood_after: true,
          taste_notes: true,
          duration_minutes: true,
          weather_conditions: true,
          created_at: true,
          privacy_level: true,
          user: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        where: {
          OR: [
            { privacy_level: 'public' },
            ...(req.user ? [
              { user_id: req.user.id },
              { 
                AND: [
                  { privacy_level: 'friends' },
                  { 
                    user: {
                      followers: {
                        some: { follower_id: req.user.id }
                      }
                    }
                  }
                ]
              }
            ] : [])
          ]
        },
        orderBy: {
          created_at: 'desc'
        }
      },
      media: {
        select: {
          id: true,
          file_path: true,
          file_type: true,
          alt_text: true,
          created_at: true
        }
      },
      _count: {
        select: {
          activities: true
        }
      }
    }
  });
  
  if (!spot) {
    throw new NotFoundError('Spot not found');
  }
  
  successResponse(res, { spot }, 'Spot retrieved successfully');
}));

/**
 * Create new spot (requires authentication)
 * POST /api/spots
 */
router.post('/', authenticateToken, validate(createSpotSchema), asyncHandler(async (req, res) => {
  const { name, description, long_description, latitude, longitude, address, amenities, accessibility_info, image_url } = req.body;
  
  const spot = await prisma.spot.create({
    data: {
      creator_id: req.user.id,
      name,
      description: description || '',
      long_description: long_description || '',
      latitude,
      longitude,
      address: address || '',
      amenities: amenities || [],
      accessibility_info: accessibility_info || '',
      image_url: image_url || ''
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      _count: {
        select: {
          activities: true
        }
      }
    }
  });
  
  successResponse(res, { spot }, 'Spot created successfully', 201);
}));

/**
 * Update spot (requires authentication and ownership)
 * PUT /api/spots/:id
 */
router.put('/:id', authenticateToken, validate(createSpotSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, long_description, latitude, longitude, address, amenities, accessibility_info, image_url, media_urls } = req.body;
  
  console.log('Updating spot with data:', {
    id,
    name,
    description,
    long_description,
    media_urls: media_urls ? media_urls : 'none',
    media_urls_count: media_urls ? media_urls.length : 0,
    media_urls_type: typeof media_urls
  });
  
  // Check if spot exists and user owns it
  const existingSpot = await prisma.spot.findUnique({
    where: { id },
    select: { creator_id: true }
  });
  
  if (!existingSpot) {
    throw new NotFoundError('Spot not found');
  }
  
  if (existingSpot.creator_id !== req.user.id) {
    throw new AuthorizationError('You can only update your own spots');
  }
  
  // Update spot and handle media in a transaction
  const spot = await prisma.$transaction(async (tx) => {
    // Update the spot
    const updatedSpot = await tx.spot.update({
      where: { id },
      data: {
        name,
        description: description || '',
        long_description: long_description || '',
        latitude,
        longitude,
        address: address || '',
        amenities: amenities || [],
        accessibility_info: accessibility_info || '',
        image_url: image_url || ''
      }
    });

    // Handle media updates if provided
    if (media_urls && Array.isArray(media_urls)) {
      console.log('Processing media_urls:', media_urls);
      
      // Delete existing media for this spot
      const deletedMedia = await tx.media.deleteMany({
        where: { spot_id: id }
      });
      console.log('Deleted existing media records:', deletedMedia.count);

      // Create new media records
      if (media_urls.length > 0) {
        const mediaData = media_urls.map((url, index) => ({
          user_id: req.user.id,
          spot_id: id,
          file_path: url,
          file_type: 'image',
          file_size: 0,
          alt_text: `${name} photo ${index + 1}`
        }));

        console.log('Creating media records:', mediaData);
        const createdMedia = await tx.media.createMany({
          data: mediaData
        });
        console.log('Created media records:', createdMedia.count);
      }
    } else {
      console.log('No media_urls provided or not an array:', { media_urls, type: typeof media_urls });
    }

    // Return updated spot with media
    return await tx.spot.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatar_url: true
          }
        },
        media: {
          select: {
            id: true,
            file_path: true,
            file_type: true,
            alt_text: true,
            created_at: true
          }
        },
        _count: {
          select: {
            activities: true
          }
        }
      }
    });
  });
  
  console.log('Spot updated successfully:', { 
    id: spot.id, 
    mediaCount: spot.media ? spot.media.length : 0 
  });
  
  successResponse(res, { spot }, 'Spot updated successfully');
}));

/**
 * Delete spot (requires authentication and ownership)
 * DELETE /api/spots/:id
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if spot exists and user owns it
  const existingSpot = await prisma.spot.findUnique({
    where: { id },
    select: { creator_id: true }
  });
  
  if (!existingSpot) {
    throw new NotFoundError('Spot not found');
  }
  
  if (existingSpot.creator_id !== req.user.id) {
    throw new AuthorizationError('You can only delete your own spots');
  }
  
  await prisma.spot.delete({
    where: { id }
  });
  
  successResponse(res, null, 'Spot deleted successfully');
}));

/**
 * Get user's spots
 * GET /api/spots/user/:username
 */
router.get('/user/:username', optionalAuth, asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, display_name: true, privacy_level: true }
  });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Check privacy permissions
  const canViewPrivate = req.user && req.user.id === user.id;
  const canViewFriends = req.user && (
    req.user.id === user.id ||
    await prisma.follow.findFirst({
      where: {
        follower_id: req.user.id,
        following_id: user.id
      }
    })
  );
  
  // Get spots with privacy filtering
  const spots = await prisma.spot.findMany({
    where: {
      creator_id: user.id
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      media: {
        select: {
          id: true,
          file_path: true,
          file_type: true,
          alt_text: true,
          created_at: true
        }
      },
      activities: {
        select: {
          id: true,
          title: true,
          tea_type: true,
          created_at: true,
          privacy_level: true
        },
        where: {
          OR: [
            { privacy_level: 'public' },
            ...(canViewPrivate ? [{ privacy_level: 'private' }] : []),
            ...(canViewFriends ? [{ privacy_level: 'friends' }] : [])
          ]
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      },
      _count: {
        select: {
          activities: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });
  
  successResponse(res, { spots, user }, 'User spots retrieved successfully');
}));

module.exports = router;