const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const { asyncHandler, successResponse } = require('../utils/errors');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get dashboard statistics (user-specific weekly stats + global community stats)
 * GET /api/stats/dashboard
 */
router.get('/dashboard', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get authenticated user ID
  
  // Calculate start of the week (Monday)
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Handle Sunday case
  startOfWeek.setDate(now.getDate() - daysFromMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate start of last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  // Get USER'S weekly activities (sessions and duration)
  const userWeeklyActivities = await prisma.activity.findMany({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfWeek
      }
    },
    select: {
      duration_minutes: true,
      created_at: true
    }
  });
  
  const weeklyActivitiesCount = userWeeklyActivities.length;
  const totalDuration = userWeeklyActivities.reduce((sum, activity) => {
    return sum + (activity.duration_minutes || 0);
  }, 0);
  
  // Debug logging for dashboard weekly stats
  console.log(`Dashboard stats for user ${userId}:`, {
    startOfWeek: startOfWeek.toISOString(),
    weeklyActivitiesCount,
    totalDuration,
    activities: userWeeklyActivities.map(a => ({
      date: a.created_at.toISOString(),
      duration: a.duration_minutes
    }))
  });
  
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
  
  // Get USER'S new spots created this week
  const newSpotsCount = await prisma.spot.count({
    where: {
      creator_id: userId,
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
router.get('/user/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const { userId: paramUserId } = req.params;
  const userId = req.user.id; // Use authenticated user's ID for security
  
  // Calculate start of the week (Monday)
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Handle Sunday case
  startOfWeek.setDate(now.getDate() - daysFromMonday);
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
  
  // Get all user activities for various calculations
  const userActivities = await prisma.activity.findMany({
    where: {
      user_id: userId
    },
    select: {
      duration_minutes: true,
      created_at: true
    }
  });
  
  // Calculate total duration
  const totalDuration = userActivities.reduce((sum, activity) => {
    return sum + (activity.duration_minutes || 0);
  }, 0);
  
  // Filter activities for this week and this month
  const weeklyActivities = userActivities.filter(activity => 
    activity.created_at >= startOfWeek
  );
  
  const monthlyActivities = userActivities.filter(activity => 
    activity.created_at >= startOfMonth
  );
  
  // Calculate weekly stats
  const activitiesThisWeek = weeklyActivities.length;
  const weeklyDuration = weeklyActivities.reduce((sum, activity) => {
    return sum + (activity.duration_minutes || 0);
  }, 0);
  
  // Calculate monthly count
  const activitiesThisMonth = monthlyActivities.length;
  
  // Debug logging to verify consistency
  console.log(`User ${userId} weekly stats:`, {
    startOfWeek: startOfWeek.toISOString(),
    now: now.toISOString(),
    activitiesThisWeek,
    weeklyDuration,
    weeklyActivities: weeklyActivities.map(a => ({
      date: a.created_at.toISOString(),
      duration: a.duration_minutes
    }))
  });
  
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
    activitiesThisMonth,
    weeklyDuration
  };
  
  successResponse(res, userStats, 'User statistics retrieved successfully');
}));

module.exports = router;