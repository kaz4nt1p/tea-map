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
  const { name, description, long_description, latitude, longitude, address, amenities, accessibility_info, image_url } = req.body;
  
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
  
  const spot = await prisma.spot.update({
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