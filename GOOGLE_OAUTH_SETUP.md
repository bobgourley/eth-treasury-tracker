# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for secure admin access to the Ethereum Treasury Tracker.

## 🔐 Why Google OAuth?

- **Enhanced Security**: No passwords to manage or store
- **Easy Access Control**: Restrict access to specific Google accounts
- **Professional Authentication**: Industry-standard OAuth 2.0 flow
- **User-Friendly**: One-click login with Google account

## 📋 Prerequisites

- A Google account (Gmail, Google Workspace, etc.)
- Access to Google Cloud Console
- Your deployed application URL (or localhost for development)

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `eth-treasury-tracker`
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: `Ethereum Treasury Tracker`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click "Save and Continue"
5. Skip "Scopes" (click "Save and Continue")
6. Add test users (your admin email addresses)
7. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Set name: `Ethereum Treasury Tracker Admin`
5. Add Authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
6. Add Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

119603907835-l2qri2fib8m3vli1dokl7g40bb49pjom.apps.googleusercontent.com


### Step 5: Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update your `.env` file with the OAuth credentials:
   ```bash
   # NextAuth.js Configuration
   NEXTAUTH_SECRET="your-random-secret-here"  # Generate with: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"       # Change to your domain in production
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   
   # Admin Access Control
   ADMIN_EMAIL="your-email@gmail.com"         # Your Google account email
   ```

3. Generate a secure NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```

### Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/admin`
3. You should be redirected to the Google OAuth login page
4. Sign in with your Google account
5. If your email is in the `ADMIN_EMAIL` list, you'll be granted admin access

## 🔒 Security Features

### Email Allowlist
Only Google accounts listed in the `ADMIN_EMAIL` environment variable can access the admin interface.

### Adding More Admins
To add additional admin users, update your `.env` file:
```bash
# For multiple admins, you can modify the auth.ts file to accept an array
ADMIN_EMAIL="admin1@gmail.com,admin2@company.com"
```

### Session Management
- Sessions expire after 4 hours
- Secure HTTP-only cookies
- Database-backed session storage

## 🚨 Production Deployment

### Vercel Deployment
1. Add environment variables in Vercel dashboard
2. Update `NEXTAUTH_URL` to your production domain
3. Update Google OAuth redirect URIs to include your production domain

### Security Checklist
- [ ] `NEXTAUTH_SECRET` is a strong, random string
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Google OAuth redirect URIs include your production domain
- [ ] Only authorized emails are listed in `ADMIN_EMAIL`
- [ ] OAuth consent screen is properly configured

## 🔧 Troubleshooting

### Common Issues

**"Access denied" error**
- Check that your email is listed in `ADMIN_EMAIL`
- Verify the email matches exactly (case-sensitive)

**"Redirect URI mismatch" error**
- Ensure redirect URIs in Google Console match your domain
- Check that `NEXTAUTH_URL` is correct

**"Invalid client" error**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure Google+ API is enabled

### Debug Mode
Add this to your `.env` for debugging:
```bash
NEXTAUTH_DEBUG=true
```

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Review server logs for authentication errors
3. Verify all environment variables are set correctly
4. Ensure Google Cloud project is properly configured

---

**🎉 Congratulations!** Your admin interface is now secured with Google OAuth authentication!
