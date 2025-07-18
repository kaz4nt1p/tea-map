const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { optionalAuth } = require('../middleware/auth');
const { asyncHandler, successResponse } = require('../utils/errors');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get dashboard statistics
 * GET /api/stats/dashboard
 */
router.get('/dashboard', optionalAuth, asyncHandler(async (req, res) => {
  // Calculate start of the week (Monday)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate start of last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  // Get this week's activities count
  const weeklyActivitiesCount = await prisma.activity.count({
    where: {
      created_at: {
        gte: startOfWeek
      }
    }
  });
  
  // Get this week's total duration
  const weeklyActivities = await prisma.activity.findMany({
    where: {
      created_at: {
        gte: startOfWeek
      }
    },
    select: {
      duration_minutes: true
    }
  });
  
  const totalDuration = weeklyActivities.reduce((sum, activity) => {
    return sum + (activity.duration_minutes || 0);
  }, 0);
  
  // Get popular spots from last 7 days
  const popularSpotsData = await prisma.spot.findMany({
    include: {
      activities: {
        where: {
          created_at: {
            gte: sevenDaysAgo
          }
        },
        select: {
          id: true
        }
      }
    }
  });
  
  // Process and sort popular spots
  const popularSpots = popularSpotsData
    .map(spot => ({
      id: spot.id,
      name: spot.name,
      activityCount: spot.activities.length
    }))
    .filter(spot => spot.activityCount > 0) // Only include spots with activities
    .sort((a, b) => b.activityCount - a.activityCount) // Sort by activity count descending
    .slice(0, 5); // Get top 5 popular spots
  
  // Get new spots created this week
  const newSpotsCount = await prisma.spot.count({
    where: {
      created_at: {
        gte: startOfWeek
      }
    }
  });
  
  // Get start of today for sessions today count
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  // Get sessions (activities) created today
  const sessionsToday = await prisma.activity.count({
    where: {
      created_at: {
        gte: startOfToday
      }
    }
  });
  
  // Get active users (users who created activities in the last 7 days)
  const activeUsers = await prisma.user.count({
    where: {
      activities: {
        some: {
          created_at: {
            gte: sevenDaysAgo
          }
        }
      }
    }
  });
  
  const stats = {
    weeklyStats: {
      activitiesCount: weeklyActivitiesCount,
      totalDuration: totalDuration, // in minutes
      newSpots: newSpotsCount
    },
    popularSpots: popularSpots,
    communityStats: {
      activeUsers: activeUsers,
      sessionsToday: sessionsToday,
      newSpotsThisWeek: newSpotsCount
    }
  };
  
  successResponse(res, stats, 'Dashboard statistics retrieved successfully');
}));

/**
 * Get user-specific statistics
 * GET /api/stats/user/:userId
 */
router.get('/user/:userId', optionalAuth, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Calculate start of the week (Monday)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate start of the month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get user's total activities
  const totalActivities = await prisma.activity.count({
    where: {
      user_id: userId
    }
  });
  
  // Get user's total spots
  const totalSpots = await prisma.spot.count({
    where: {
      creator_id: userId
    }
  });
  
  // Get user's activities this week
  const activitiesThisWeek = await prisma.activity.count({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfWeek
      }
    }
  });
  
  // Get user's activities this month
  const activitiesThisMonth = await prisma.activity.count({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfMonth
      }
    }
  });
  
  // Get user's total duration
  const userActivities = await prisma.activity.findMany({
    where: {
      user_id: userId
    },
    select: {
      duration_minutes: true
    }
  });
  
  const totalDuration = userActivities.reduce((sum, activity) => {
    return sum + (activity.duration_minutes || 0);
  }, 0);
  
  // Get user's favorite tea type
  const teaTypeStats = await prisma.activity.groupBy({
    by: ['tea_type'],
    where: {
      user_id: userId,
      tea_type: {
        not: null
      }
    },
    _count: {
      tea_type: true
    },
    orderBy: {
      _count: {
        tea_type: 'desc'
      }
    }
  });
  
  const favoriteTeaType = teaTypeStats.length > 0 ? teaTypeStats[0].tea_type : '';
  
  const userStats = {
    totalActivities,
    totalSpots,
    totalDuration,
    favoriteTeaType,
    activitiesThisWeek,
    activitiesThisMonth
  };
  
  successResponse(res, userStats, 'User statistics retrieved successfully');
}));

module.exports = router;