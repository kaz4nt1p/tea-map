const express = require('express');
const passport = require('../auth/google');
const { generateTokens } = require('../auth/jwt');
const { successResponse } = require('../utils/errors');

const router = express.Router();

/**
 * Initiate Google OAuth login
 * GET /api/auth/google
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth?error=google_oauth_failed` 
  }),
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        console.error('Google OAuth: No user returned from authentication');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}/auth?error=no_user`);
      }
      
      // Generate JWT tokens
      const tokens = generateTokens(user);
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Redirect to frontend with access token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/map?token=${tokens.accessToken}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/auth?error=authentication_failed`);
    }
  }
);

/**
 * Link Google account to existing user
 * POST /api/auth/google/link
 */
router.post('/google/link', async (req, res) => {
  try {
    // This would be implemented if we want to allow linking Google accounts
    // to existing users who are already logged in
    res.status(501).json({
      error: 'Not implemented',
      message: 'Account linking not yet implemented'
    });
  } catch (error) {
    console.error('Google account linking error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to link Google account'
    });
  }
});

module.exports = router;