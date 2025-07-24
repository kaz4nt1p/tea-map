const { verifyAccessToken, extractToken } = require('../auth/jwt');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Authentication middleware - verifies JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first (for API calls)
    const authHeader = req.headers.authorization;
    let token = extractToken(authHeader);
    
    // If no token in header, try HTTP-only cookie (for web requests)
    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Authorization header with Bearer token or HTTP-only cookie is required'
      });
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        display_name: true,
        is_verified: true,
        privacy_level: true,
        created_at: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'User associated with this token no longer exists'
      });
    }
    
    // Add user to request object for use in routes
    req.user = user;
    next();
    
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Access token has expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'The provided token is invalid or malformed'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first (for API calls)
    const authHeader = req.headers.authorization;
    let token = extractToken(authHeader);
    
    // If no token in header, try HTTP-only cookie (for web requests)
    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        display_name: true,
        is_verified: true,
        privacy_level: true,
        created_at: true
      }
    });
    
    req.user = user || null;
    next();
    
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    next();
  }
};

/**
 * Check if user is verified
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'This endpoint requires authentication'
    });
  }
  
  if (!req.user.is_verified) {
    return res.status(403).json({ 
      error: 'Email verification required',
      message: 'Please verify your email address to access this feature'
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireVerified
};