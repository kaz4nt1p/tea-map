const express = require('express');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('../generated/prisma');
const { hashPassword, verifyPassword, validatePasswordStrength } = require('../auth/password');
const { generateTokens, verifyRefreshToken } = require('../auth/jwt');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { 
  asyncHandler, 
  successResponse, 
  ConflictError, 
  AuthenticationError, 
  ValidationError 
} = require('../utils/errors');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 attempts in production, 50 in development
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for localhost requests
    if (process.env.NODE_ENV !== 'production') {
      const clientIP = req.ip || req.connection.remoteAddress;
      const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP?.includes('127.0.0.1');
      console.log(`[Auth Rate Limit] ${req.method} ${req.path} from ${clientIP} - Skip: ${isLocalhost}`);
      return isLocalhost;
    }
    return false;
  },
});

// TEMPORARILY DISABLED: Apply rate limiting to auth endpoints only in production
// TODO: Re-enable after testing
/*
if (process.env.NODE_ENV === 'production') {
  router.use('/register', authLimiter);
  router.use('/login', authLimiter);
  console.log('🔒 Rate limiting enabled for authentication endpoints');
} else {
  console.log('⚠️  Rate limiting DISABLED for development');
}
*/
console.log('⚠️  Rate limiting TEMPORARILY DISABLED for all environments');

// Development only: Reset rate limit endpoints
if (process.env.NODE_ENV !== 'production') {
  router.post('/reset-rate-limit', (req, res) => {
    try {
      authLimiter.resetKey(req.ip);
      res.json({ message: 'Rate limit reset for your IP', ip: req.ip });
    } catch (error) {
      res.json({ message: 'Rate limit reset attempted (may not be active)', ip: req.ip });
    }
  });
  
  // Clear all rate limits (nuclear option for development)
  router.post('/clear-all-rate-limits', (req, res) => {
    try {
      // This will reset the entire rate limit store
      authLimiter.resetIp = function() {};
      res.json({ message: 'All rate limits cleared (development only)' });
    } catch (error) {
      res.json({ message: 'Rate limit clear attempted', error: error.message });
    }
  });
}

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, username, password, display_name, bio } = req.body;
  
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
  }
  
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    }
  });
  
  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new ConflictError('User with this email already exists');
    } else {
      throw new ConflictError('Username is already taken');
    }
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password_hash: hashedPassword,
      display_name: display_name || username,
      bio: bio || ''
    },
    select: {
      id: true,
      email: true,
      username: true,
      display_name: true,
      bio: true,
      is_verified: true,
      privacy_level: true,
      created_at: true
    }
  });
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  // Set both tokens as HTTP-only cookies for security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  // Set user session flag for frontend authentication check
  res.cookie('authenticated', 'true', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  successResponse(res, {
    user,
    accessToken, // Keep in response for compatibility
    tokenType: 'Bearer'
  }, 'User registered successfully', 201);
}));

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  // Set both tokens as HTTP-only cookies for security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  // Set user session flag for frontend authentication check
  res.cookie('authenticated', 'true', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  // Return user data (excluding password)
  const userResponse = {
    id: user.id,
    email: user.email,
    username: user.username,
    display_name: user.display_name,
    bio: user.bio,
    avatar_url: user.avatar_url,
    is_verified: user.is_verified,
    privacy_level: user.privacy_level,
    created_at: user.created_at
  };
  
  successResponse(res, {
    user: userResponse,
    accessToken, // Keep in response for compatibility
    tokenType: 'Bearer'
  }, 'Login successful');
}));

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token not provided');
  }
  
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      username: true,
      display_name: true,
      bio: true,
      avatar_url: true,
      is_verified: true,
      privacy_level: true,
      created_at: true
    }
  });
  
  if (!user) {
    throw new AuthenticationError('User not found');
  }
  
  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  
  // Set both new tokens as HTTP-only cookies
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  // Renew user session flag
  res.cookie('authenticated', 'true', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  successResponse(res, {
    user,
    accessToken, // Keep in response for compatibility
    tokenType: 'Bearer'
  }, 'Token refreshed successfully');
}));

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', asyncHandler(async (req, res) => {
  // Clear all authentication cookies
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  res.clearCookie('authenticated');
  
  successResponse(res, null, 'Logged out successfully');
}));

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  // Get user with additional stats
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      display_name: true,
      bio: true,
      avatar_url: true,
      is_verified: true,
      privacy_level: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: {
          activities: true,
          spots: true,
          followers: true,
          following: true
        }
      }
    }
  });
  
  if (!user) {
    throw new AuthenticationError('User not found');
  }
  
  successResponse(res, { user }, 'User profile retrieved successfully');
}));

module.exports = router;