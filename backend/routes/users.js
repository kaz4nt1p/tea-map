const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: {
        username: username
      },
      select: {
        id: true,
        username: true,
        display_name: true,
        email: true,
        bio: true,
        avatar_url: true,
        created_at: true,
        _count: {
          select: {
            spots: true,
            activities: true,
            followers: true,
            following: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: `User with username "${username}" does not exist` 
      });
    }
    
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch user data' 
    });
  }
});

// Get all users (for testing/admin)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        display_name: true,
        email: true,
        bio: true,
        avatar_url: true,
        created_at: true,
        _count: {
          select: {
            spots: true,
            activities: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    res.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch users' 
    });
  }
});

module.exports = router;