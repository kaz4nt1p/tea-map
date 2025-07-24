const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, createActivitySchema, createCommentSchema } = require('../middleware/validation');
const { asyncHandler, successResponse, NotFoundError, AuthorizationError } = require('../utils/errors');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get activity feed (public activities + followed users)
 * GET /api/activities
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const whereClause = {
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
  };
  
  const activities = await prisma.activity.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      spot: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true
        }
      },
      media: {
        select: {
          id: true,
          file_path: true,
          file_type: true,
          alt_text: true
        }
      },
      comments: {
        select: {
          id: true,
          content: true,
          created_at: true,
          user: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 2
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    skip: parseInt(skip),
    take: parseInt(limit)
  });
  
  const totalActivities = await prisma.activity.count({ where: whereClause });
  
  // Add like information for each activity
  const activitiesWithLikes = await Promise.all(activities.map(async (activity) => {
    const userLike = req.user ? await prisma.activityLike.findFirst({
      where: {
        activity_id: activity.id,
        user_id: req.user.id
      }
    }) : null;
    
    const { _count, likes, ...activityData } = activity;
    
    const result = {
      ...activityData,
      is_liked: !!userLike,
      like_count: _count?.likes || 0,
      comment_count: _count?.comments || 0,
      comments: activity.comments || []
    };
    
    return result;
  }));
  
  successResponse(res, {
    data: activitiesWithLikes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalActivities,
      pages: Math.ceil(totalActivities / limit)
    }
  }, 'Activities retrieved successfully');
}));

/**
 * Get single activity by ID
 * GET /api/activities/:id
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
          bio: true
        }
      },
      spot: {
        select: {
          id: true,
          name: true,
          description: true,
          latitude: true,
          longitude: true,
          address: true,
          amenities: true
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
      comments: {
        select: {
          id: true,
          content: true,
          created_at: true,
          user: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      },
      likes: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
              display_name: true
            }
          }
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });
  
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  
  // Check privacy permissions
  const canView = activity.privacy_level === 'public' ||
    (req.user && req.user.id === activity.user_id) ||
    (req.user && activity.privacy_level === 'friends' && 
     await prisma.follow.findFirst({
       where: {
         follower_id: req.user.id,
         following_id: activity.user_id
       }
     }));
  
  if (!canView) {
    throw new AuthorizationError('You do not have permission to view this activity');
  }
  
  // Check if current user has liked this activity
  const userLike = req.user ? await prisma.activityLike.findFirst({
    where: {
      activity_id: id,
      user_id: req.user.id
    }
  }) : null;
  
  // Build clean activity object with like information
  const activityWithLikes = {
    id: activity.id,
    user_id: activity.user_id,
    spot_id: activity.spot_id,
    title: activity.title,
    description: activity.description,
    tea_type: activity.tea_type,
    tea_details: activity.tea_details,
    mood_before: activity.mood_before,
    mood_after: activity.mood_after,
    taste_notes: activity.taste_notes,
    insights: activity.insights,
    duration_minutes: activity.duration_minutes,
    weather_conditions: activity.weather_conditions,
    companions: activity.companions,
    privacy_level: activity.privacy_level,
    created_at: activity.created_at,
    updated_at: activity.updated_at,
    user: activity.user,
    spot: activity.spot,
    media: activity.media,
    is_liked: !!userLike,
    like_count: activity._count?.likes || 0,
    comment_count: activity._count?.comments || 0
  };
  
  successResponse(res, { 
    activity: activityWithLikes
  }, 'Activity retrieved successfully');
}));

/**
 * Create new activity (requires authentication)
 * POST /api/activities
 */
router.post('/', authenticateToken, validate(createActivitySchema), asyncHandler(async (req, res) => {
  const {
    spot_id,
    title,
    description,
    tea_type,
    tea_name,
    tea_details,
    mood_before,
    mood_after,
    taste_notes,
    insights,
    duration_minutes,
    weather_conditions,
    companions,
    photos,
    privacy_level
  } = req.body;
  
  // Validate spot exists if provided
  if (spot_id) {
    const spot = await prisma.spot.findUnique({
      where: { id: spot_id },
      select: { id: true }
    });
    
    if (!spot) {
      throw new NotFoundError('Spot not found');
    }
  }
  
  const activity = await prisma.activity.create({
    data: {
      user_id: req.user.id,
      spot_id: spot_id || null,
      title,
      description: description || '',
      tea_type: tea_type || '',
      tea_name: tea_name || '',
      tea_details: tea_details || {},
      mood_before: mood_before || '',
      mood_after: mood_after || '',
      taste_notes: taste_notes || '',
      insights: insights || '',
      duration_minutes: duration_minutes || null,
      weather_conditions: weather_conditions || '',
      companions: companions || [],
      privacy_level: privacy_level || 'public'
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      spot: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });

  // Create media records for photos if provided
  if (photos && photos.length > 0) {
    const mediaRecords = photos.map(photoUrl => ({
      user_id: req.user.id,
      activity_id: activity.id,
      file_path: photoUrl,
      file_type: 'image',
      file_size: 0, // We don't have file size from URL
      alt_text: `Activity photo for ${title}`
    }));

    await prisma.media.createMany({
      data: mediaRecords
    });
  }

  // Fetch the activity with media included
  const activityWithMedia = await prisma.activity.findUnique({
    where: { id: activity.id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      spot: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true
        }
      },
      media: {
        select: {
          id: true,
          file_path: true,
          file_type: true,
          alt_text: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });
  
  successResponse(res, { activity: activityWithMedia }, 'Activity created successfully', 201);
}));

/**
 * Update activity (requires authentication and ownership)
 * PUT /api/activities/:id
 */
router.put('/:id', authenticateToken, validate(createActivitySchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    spot_id,
    title,
    description,
    tea_type,
    tea_name,
    tea_details,
    mood_before,
    mood_after,
    taste_notes,
    insights,
    duration_minutes,
    weather_conditions,
    companions,
    photos,
    privacy_level
  } = req.body;
  
  // Check if activity exists and user owns it
  const existingActivity = await prisma.activity.findUnique({
    where: { id },
    select: { user_id: true }
  });
  
  if (!existingActivity) {
    throw new NotFoundError('Activity not found');
  }
  
  if (existingActivity.user_id !== req.user.id) {
    throw new AuthorizationError('You can only update your own activities');
  }
  
  // Validate spot exists if provided
  if (spot_id) {
    const spot = await prisma.spot.findUnique({
      where: { id: spot_id },
      select: { id: true }
    });
    
    if (!spot) {
      throw new NotFoundError('Spot not found');
    }
  }
  
  const activity = await prisma.activity.update({
    where: { id },
    data: {
      spot_id: spot_id || null,
      title,
      description: description || '',
      tea_type: tea_type || '',
      tea_name: tea_name || '',
      tea_details: tea_details || {},
      mood_before: mood_before || '',
      mood_after: mood_after || '',
      taste_notes: taste_notes || '',
      insights: insights || '',
      duration_minutes: duration_minutes || null,
      weather_conditions: weather_conditions || '',
      companions: companions || [],
      privacy_level: privacy_level || 'public'
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      spot: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });

  // Update media records for photos if provided
  if (photos !== undefined) {
    // Delete existing media for this activity
    await prisma.media.deleteMany({
      where: {
        activity_id: id,
        file_type: 'image'
      }
    });

    // Create new media records if photos provided
    if (photos && photos.length > 0) {
      const mediaRecords = photos.map(photoUrl => ({
        user_id: req.user.id,
        activity_id: id,
        file_path: photoUrl,
        file_type: 'image',
        file_size: 0, // We don't have file size from URL
        alt_text: `Activity photo for ${title}`
      }));

      await prisma.media.createMany({
        data: mediaRecords
      });
    }
  }

  // Fetch the activity with media included
  const activityWithMedia = await prisma.activity.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      spot: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true
        }
      },
      media: {
        select: {
          id: true,
          file_path: true,
          file_type: true,
          alt_text: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });
  
  successResponse(res, { activity: activityWithMedia }, 'Activity updated successfully');
}));

/**
 * Delete activity (requires authentication and ownership)
 * DELETE /api/activities/:id
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if activity exists and user owns it
  const existingActivity = await prisma.activity.findUnique({
    where: { id },
    select: { user_id: true }
  });
  
  if (!existingActivity) {
    throw new NotFoundError('Activity not found');
  }
  
  if (existingActivity.user_id !== req.user.id) {
    throw new AuthorizationError('You can only delete your own activities');
  }
  
  await prisma.activity.delete({
    where: { id }
  });
  
  successResponse(res, null, 'Activity deleted successfully');
}));

/**
 * Like/Unlike activity (requires authentication)
 * POST /api/activities/:id/like
 */
router.post('/:id/like', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if activity exists
  const activity = await prisma.activity.findUnique({
    where: { id },
    select: { id: true, user_id: true, privacy_level: true }
  });
  
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  
  // Check if user can view this activity
  const canView = activity.privacy_level === 'public' ||
    activity.user_id === req.user.id ||
    (activity.privacy_level === 'friends' && 
     await prisma.follow.findFirst({
       where: {
         follower_id: req.user.id,
         following_id: activity.user_id
       }
     }));
  
  if (!canView) {
    throw new AuthorizationError('You do not have permission to like this activity');
  }
  
  // Check if user already liked this activity
  const existingLike = await prisma.activityLike.findFirst({
    where: {
      activity_id: id,
      user_id: req.user.id
    }
  });
  
  if (existingLike) {
    // Unlike
    await prisma.activityLike.delete({
      where: { id: existingLike.id }
    });
    
    successResponse(res, { liked: false }, 'Activity unliked successfully');
  } else {
    // Like
    await prisma.activityLike.create({
      data: {
        activity_id: id,
        user_id: req.user.id
      }
    });
    
    successResponse(res, { liked: true }, 'Activity liked successfully');
  }
}));

/**
 * Get activities by spot ID
 * GET /api/activities/spot/:spotId
 */
router.get('/spot/:spotId', optionalAuth, asyncHandler(async (req, res) => {
  const { spotId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  // Check if spot exists
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
    select: { id: true, name: true, latitude: true, longitude: true, address: true }
  });
  
  if (!spot) {
    throw new NotFoundError('Spot not found');
  }
  
  const whereClause = {
    spot_id: spotId,
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
  };
  
  const activities = await prisma.activity.findMany({
    where: whereClause,
    include: {
      user: {
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
      comments: {
        select: {
          id: true,
          content: true,
          created_at: true,
          user: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 2
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    skip: parseInt(skip),
    take: parseInt(limit)
  });
  
  const totalActivities = await prisma.activity.count({ where: whereClause });
  
  // Add like information for each activity
  const activitiesWithLikes = await Promise.all(activities.map(async (activity) => {
    const userLike = req.user ? await prisma.activityLike.findFirst({
      where: {
        activity_id: activity.id,
        user_id: req.user.id
      }
    }) : null;
    
    const { _count, likes, ...activityData } = activity;
    
    const result = {
      ...activityData,
      is_liked: !!userLike,
      like_count: _count?.likes || 0,
      comment_count: _count?.comments || 0,
      comments: activity.comments || []
    };
    
    return result;
  }));
  
  successResponse(res, {
    data: activitiesWithLikes,
    spot,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalActivities,
      pages: Math.ceil(totalActivities / limit)
    }
  }, 'Spot activities retrieved successfully');
}));

/**
 * Get user's activities
 * GET /api/activities/user/:username
 */
router.get('/user/:username', optionalAuth, asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
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
  
  const whereClause = {
    user_id: user.id,
    OR: [
      { privacy_level: 'public' },
      ...(canViewPrivate ? [{ privacy_level: 'private' }] : []),
      ...(canViewFriends ? [{ privacy_level: 'friends' }] : [])
    ]
  };
  
  const activities = await prisma.activity.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      spot: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true
        }
      },
      media: {
        select: {
          id: true,
          file_path: true,
          file_type: true,
          alt_text: true
        }
      },
      comments: {
        select: {
          id: true,
          content: true,
          created_at: true,
          user: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 2
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    skip: parseInt(skip),
    take: parseInt(limit)
  });
  
  const totalActivities = await prisma.activity.count({ where: whereClause });
  
  // Add like information for each activity
  const activitiesWithLikes = await Promise.all(activities.map(async (activity) => {
    const userLike = req.user ? await prisma.activityLike.findFirst({
      where: {
        activity_id: activity.id,
        user_id: req.user.id
      }
    }) : null;
    
    const { _count, likes, ...activityData } = activity;
    
    const result = {
      ...activityData,
      is_liked: !!userLike,
      like_count: _count?.likes || 0,
      comment_count: _count?.comments || 0,
      comments: activity.comments || []
    };
    
    return result;
  }));
  
  successResponse(res, {
    data: activitiesWithLikes,
    user,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalActivities,
      pages: Math.ceil(totalActivities / limit)
    }
  }, 'User activities retrieved successfully');
}));

/**
 * Get comments for activity
 * GET /api/activities/:id/comments
 */
router.get('/:id/comments', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  // Check if activity exists
  const activity = await prisma.activity.findUnique({
    where: { id },
    select: { id: true, user_id: true, privacy_level: true }
  });
  
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  
  // Check if user can view this activity
  const canView = activity.privacy_level === 'public' ||
    (req.user && req.user.id === activity.user_id) ||
    (req.user && activity.privacy_level === 'friends' && 
     await prisma.follow.findFirst({
       where: {
         follower_id: req.user.id,
         following_id: activity.user_id
       }
     }));
  
  if (!canView) {
    throw new AuthorizationError('You do not have permission to view comments for this activity');
  }
  
  const comments = await prisma.activityComment.findMany({
    where: { activity_id: id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      }
    },
    orderBy: {
      created_at: 'asc'
    },
    skip: parseInt(skip),
    take: parseInt(limit)
  });
  
  const totalComments = await prisma.activityComment.count({
    where: { activity_id: id }
  });
  
  successResponse(res, {
    data: comments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalComments,
      pages: Math.ceil(totalComments / limit)
    }
  }, 'Comments retrieved successfully');
}));

/**
 * Create comment for activity
 * POST /api/activities/:id/comments
 */
router.post('/:id/comments', authenticateToken, validate(createCommentSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  // Check if activity exists
  const activity = await prisma.activity.findUnique({
    where: { id },
    select: { id: true, user_id: true, privacy_level: true }
  });
  
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  
  // Check if user can view this activity
  const canView = activity.privacy_level === 'public' ||
    activity.user_id === req.user.id ||
    (activity.privacy_level === 'friends' && 
     await prisma.follow.findFirst({
       where: {
         follower_id: req.user.id,
         following_id: activity.user_id
       }
     }));
  
  if (!canView) {
    throw new AuthorizationError('You do not have permission to comment on this activity');
  }
  
  const comment = await prisma.activityComment.create({
    data: {
      activity_id: id,
      user_id: req.user.id,
      content
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      }
    }
  });
  
  successResponse(res, { comment }, 'Comment created successfully', 201);
}));

/**
 * Update comment
 * PUT /api/activities/:id/comments/:commentId
 */
router.put('/:id/comments/:commentId', authenticateToken, validate(createCommentSchema), asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { content } = req.body;
  
  // Check if comment exists and user owns it
  const comment = await prisma.activityComment.findUnique({
    where: { id: commentId },
    include: {
      activity: {
        select: { id: true, user_id: true, privacy_level: true }
      }
    }
  });
  
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  
  if (comment.activity_id !== id) {
    throw new NotFoundError('Comment not found for this activity');
  }
  
  if (comment.user_id !== req.user.id) {
    throw new AuthorizationError('You can only edit your own comments');
  }
  
  const updatedComment = await prisma.activityComment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      }
    }
  });
  
  successResponse(res, { comment: updatedComment }, 'Comment updated successfully');
}));

/**
 * Delete comment
 * DELETE /api/activities/:id/comments/:commentId
 */
router.delete('/:id/comments/:commentId', authenticateToken, asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  
  // Check if comment exists and user owns it
  const comment = await prisma.activityComment.findUnique({
    where: { id: commentId },
    include: {
      activity: {
        select: { id: true, user_id: true, privacy_level: true }
      }
    }
  });
  
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }
  
  if (comment.activity_id !== id) {
    throw new NotFoundError('Comment not found for this activity');
  }
  
  if (comment.user_id !== req.user.id) {
    throw new AuthorizationError('You can only delete your own comments');
  }
  
  await prisma.activityComment.delete({
    where: { id: commentId }
  });
  
  successResponse(res, null, 'Comment deleted successfully');
}));

module.exports = router;