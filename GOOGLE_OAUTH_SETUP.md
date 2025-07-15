# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Tea Map application.

## Prerequisites

- Google Cloud Console account
- Access to Google Cloud Console project

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

## Step 2: Configure OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Select **Web application**
4. Configure the following:
   - **Name**: Tea Map OAuth Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3001` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3002/api/auth/google/callback` (for development)
     - `https://yourapi.com/api/auth/google/callback` (for production)

## Step 3: Get Client Credentials

1. After creating the OAuth client, copy the **Client ID** and **Client Secret**
2. These will be used in your environment variables

## Step 4: Configure Environment Variables

### Backend (.env)
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3002/api/auth/google/callback"
```

### Frontend (.env.local)
```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL="http://localhost:3002"

# Google OAuth Configuration (for frontend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-actual-google-client-id"
```

## Step 5: Test the Setup

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend server: `npm run dev`
3. Navigate to `http://localhost:3001/auth`
4. Click on "Войти через Google" or "Зарегистрироваться через Google"
5. Complete the OAuth flow

## OAuth Flow

1. User clicks Google sign-in button
2. User is redirected to Google's OAuth consent screen
3. User approves the application
4. Google redirects back to `/api/auth/google/callback`
5. Backend exchanges code for user info and creates/updates user
6. Backend generates JWT tokens and redirects to frontend with access token
7. Frontend stores tokens and updates authentication state

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**
   - Ensure the redirect URI in Google Console matches exactly with your callback URL
   - Check that the protocol (http/https) matches

2. **"invalid_client"**
   - Verify your Client ID and Client Secret are correct
   - Ensure the OAuth client is enabled

3. **"access_denied"**
   - User denied permission during OAuth flow
   - This is normal user behavior, not an error

### Testing OAuth Flow

- Use different Google accounts to test user creation and login
- Test with accounts that have different permission levels
- Verify that user data is properly stored in the database

## Security Considerations

1. **Environment Variables**: Never commit actual credentials to version control
2. **HTTPS**: Use HTTPS in production for OAuth callbacks
3. **Scopes**: Only request necessary scopes (`profile` and `email`)
4. **Token Storage**: Access tokens are stored in memory, refresh tokens in HTTP-only cookies

## Production Deployment

1. Update redirect URIs in Google Console to match production URLs
2. Update environment variables with production values
3. Ensure HTTPS is enabled for OAuth callbacks
4. Test the complete flow in production environment