# Google OAuth Setup Guide for Prestigio Motors

## Overview
This guide will help you set up Google OAuth 2.0 authentication for your Prestigio Motors application, allowing users to sign in with their Google accounts while preserving existing authentication functionality.

## Prerequisites
- Google Cloud Console account
- Your Prestigio application running locally or deployed
- Access to your backend environment variables

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "NEW PROJECT"
3. Enter project name: "Prestigio Motors Auth"
4. Click "CREATE"

### 1.2 Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "ENABLE"
4. Also enable "Google OAuth2 API" if available

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Prestigio Motors
   - **User support email**: Your email
   - **App logo**: Upload your Prestigio logo (optional)
   - **App domain**: Your domain (e.g., mycarapp.com)
   - **Authorized domains**: Add your domain
   - **Developer contact information**: Your email
4. Click "SAVE AND CONTINUE"
5. Add scopes: `../auth/userinfo.email`, `../auth/userinfo.profile`
6. Continue through the remaining steps

### 1.4 Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Choose "Web application"
4. Enter name: "Prestigio Motors Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:5000` (for development)
   - `https://yourdomain.com` (for production)
6. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Click "CREATE"
8. **Important**: Copy the Client ID and Client Secret

## Step 2: Environment Configuration

### 2.1 Update Environment Variables
Add these variables to your `.env` file in the backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Configuration (if not already set)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
SESSION_SECRET=your_session_secret_key_here

# For production, update the callback URL:
# GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

### 2.2 Install Dependencies
Make sure all required packages are installed:

```bash
cd backend
npm install passport passport-google-oauth20 google-auth-library
```

## Step 3: Testing the Integration

### 3.1 Local Testing
1. Start your backend server: `npm run dev` or `npm start`
2. Navigate to your login page: `http://localhost:5000/login.html`
3. Click "Continue with Google"
4. You should be redirected to Google's login page
5. After successful authentication, you should be redirected back to your app

### 3.2 Testing Flow
1. **New User Flow**:
   - Click "Sign up with Google"
   - Complete Google authentication
   - Get redirected to complete-profile.html
   - Fill in required information
   - Get redirected to homepage

2. **Existing User Flow**:
   - Click "Sign in with Google"
   - Complete Google authentication
   - Get redirected directly to homepage

3. **Account Linking**:
   - If email already exists with local account
   - Google account gets linked automatically
   - User can login with either method

## Step 4: Production Deployment

### 4.1 Update OAuth Configuration
1. In Google Cloud Console, update your OAuth credentials:
   - Add production domain to Authorized JavaScript origins
   - Add production callback URL to Authorized redirect URIs
2. Update environment variables with production URLs

### 4.2 Domain Verification
1. In Google Cloud Console, verify your domain ownership
2. Add your domain to the OAuth consent screen
3. Submit for verification if needed (for external user type)

## Step 5: Security Best Practices

### 5.1 Environment Security
- Never commit `.env` files to version control
- Use secure, randomly generated secrets
- Rotate secrets regularly
- Use different credentials for different environments

### 5.2 OAuth Security
- Regularly review OAuth scopes
- Monitor authentication logs
- Implement rate limiting
- Use HTTPS in production

## Step 6: User Experience Enhancements

### 6.1 Error Handling
The integration includes error handling for:
- Authentication failures
- Network issues
- Invalid credentials
- Profile completion errors

### 6.2 Profile Management
- Users can complete missing profile information
- Existing accounts can be linked with Google
- Profile pictures from Google are automatically imported

## Troubleshooting Common Issues

### Error: "redirect_uri_mismatch"
- **Cause**: Callback URL doesn't match OAuth configuration
- **Solution**: Ensure callback URLs in Google Console match your environment

### Error: "access_denied"
- **Cause**: User denied permission or OAuth app not approved
- **Solution**: Check OAuth consent screen configuration

### Error: "invalid_client"
- **Cause**: Wrong client ID or client secret
- **Solution**: Verify credentials in .env file

### Error: "unauthorized_client"
- **Cause**: OAuth client not properly configured
- **Solution**: Check OAuth client type and authorized domains

## Step 7: Monitoring and Analytics

### 7.1 Google Cloud Monitoring
- Monitor OAuth usage in Google Cloud Console
- Track authentication success/failure rates
- Set up alerts for unusual activity

### 7.2 Application Monitoring
- Log OAuth authentication attempts
- Monitor user conversion rates
- Track profile completion rates

## Benefits of This Implementation

### 7.1 User Experience
- ✅ Faster registration and login
- ✅ No password management required
- ✅ Trusted Google authentication
- ✅ Automatic profile picture import

### 7.2 Security
- ✅ OAuth 2.0 security standards
- ✅ No password storage for Google users
- ✅ Regular security updates from Google
- ✅ Two-factor authentication support

### 7.3 Business
- ✅ Higher conversion rates
- ✅ Reduced support tickets
- ✅ Better user onboarding
- ✅ Access to Google profile data

## Support Resources
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Note**: This implementation maintains full backward compatibility with your existing authentication system. Users can continue to use email/password login, and the new Google OAuth option is added as an alternative. 