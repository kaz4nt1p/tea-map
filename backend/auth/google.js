const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3002/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with Google ID
    let user = await prisma.user.findUnique({
      where: { google_id: profile.id }
    });

    if (user) {
      // User exists, return user
      return done(null, user);
    }

    // Check if user exists with same email
    user = await prisma.user.findUnique({
      where: { email: profile.emails[0].value }
    });

    if (user) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          google_id: profile.id,
          auth_provider: 'google',
          avatar_url: profile.photos[0]?.value || user.avatar_url,
          is_verified: true
        }
      });
      return done(null, user);
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: profile.emails[0].value,
        google_id: profile.id,
        username: profile.emails[0].value.split('@')[0] + '_' + profile.id.slice(-4),
        display_name: profile.displayName,
        avatar_url: profile.photos[0]?.value,
        auth_provider: 'google',
        is_verified: true
      }
    });

    return done(null, newUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
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
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;