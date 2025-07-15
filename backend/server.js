const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const passport = require('./auth/google');
const { PrismaClient } = require('./generated/prisma');
const { globalErrorHandler } = require('./utils/errors');
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/google-auth');
const spotRoutes = require('./routes/spots');
const activityRoutes = require('./routes/activities');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/activities', activityRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tea Map Backend API',
    status: 'running',
    database: 'PostgreSQL',
    version: '1.0.0',
    authentication: 'JWT with refresh tokens',
    endpoints: {
      auth: '/api/auth',
      spots: '/api/spots',
      activities: '/api/activities',
      users: '/api/users'
    }
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const spotCount = await prisma.spot.count();
    const activityCount = await prisma.activity.count();
    
    res.json({
      message: 'Database connection successful',
      counts: {
        users: userCount,
        spots: spotCount,
        activities: activityCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Legacy test endpoint - use /api/spots instead
app.get('/legacy/spots', async (req, res) => {
  try {
    const spots = await prisma.spot.findMany({
      include: {
        creator: {
          select: {
            username: true,
            display_name: true
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            created_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    res.json(spots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spots', details: error.message });
  }
});

// Get all users (test endpoint)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        display_name: true,
        email: true,
        created_at: true,
        _count: {
          select: {
            spots: true,
            activities: true
          }
        }
      }
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Test creating a new activity
app.post('/api/test-activity', async (req, res) => {
  try {
    // Get the first user and spot for testing
    const user = await prisma.user.findFirst();
    const spot = await prisma.spot.findFirst();
    
    if (!user || !spot) {
      return res.status(400).json({ error: 'Need at least one user and one spot for testing' });
    }
    
    const activity = await prisma.activity.create({
      data: {
        user_id: user.id,
        spot_id: spot.id,
        title: 'Test Tea Session',
        description: 'Testing the new PostgreSQL schema',
        tea_type: 'Oolong',
        tea_details: {
          temperature: '90°C',
          steeping_time: '3 minutes',
          water_quality: 'Filtered'
        },
        mood_before: 'Stressed',
        mood_after: 'Calm',
        taste_notes: 'Floral, smooth, slightly sweet',
        insights: 'Perfect spot for afternoon tea meditation',
        duration_minutes: 45,
        weather_conditions: 'Sunny, light breeze'
      },
      include: {
        user: {
          select: {
            username: true,
            display_name: true
          }
        },
        spot: {
          select: {
            name: true,
            latitude: true,
            longitude: true
          }
        }
      }
    });
    
    res.json({ message: 'Test activity created successfully', activity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test activity', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tea Map Backend running on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🧪 Test endpoints available:`);
  console.log(`   - GET /test-db (database connection test)`);
  console.log(`   - GET /api/spots (view migrated spots)`);
  console.log(`   - GET /api/users (view users)`);
  console.log(`   - POST /api/test-activity (create test activity)`);
  console.log(`🔐 Authentication endpoints:`);
  console.log(`   - POST /api/auth/register (user registration)`);
  console.log(`   - POST /api/auth/login (user login)`);
  console.log(`   - POST /api/auth/refresh (refresh token)`);
  console.log(`   - POST /api/auth/logout (logout)`);
  console.log(`   - GET /api/auth/me (get user profile)`);
  console.log(`📍 Spot endpoints:`);
  console.log(`   - GET /api/spots (get all spots)`);
  console.log(`   - POST /api/spots (create spot - auth required)`);
  console.log(`   - GET /api/spots/:id (get spot by ID)`);
  console.log(`🍵 Activity endpoints:`);
  console.log(`   - GET /api/activities (get activity feed)`);
  console.log(`   - POST /api/activities (create activity - auth required)`);
  console.log(`   - GET /api/activities/:id (get activity by ID)`);
  console.log(`   - POST /api/activities/:id/like (like/unlike activity - auth required)`);
});

// Error handling middleware (must be last)
app.use(globalErrorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});