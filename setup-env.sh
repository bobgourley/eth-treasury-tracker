#!/bin/bash

# Ethereum Treasury Tracker - Environment Setup Script
echo "🚀 Setting up environment variables for Google OAuth..."

# Copy example file if .env doesn't exist
if [ ! -f .env ]; then
    echo "📋 Copying env.example to .env..."
    cp env.example .env
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔐 Generated NextAuth Secret: w9SoqpP9lsy5xewN8Y9TT94YmpmB1tkmFEVmOrKc7I8="
echo ""
echo "📝 Please update your .env file with the following values:"
echo ""
echo "# NextAuth.js Configuration"
echo "NEXTAUTH_SECRET=\"w9SoqpP9lsy5xewN8Y9TT94YmpmB1tkmFEVmOrKc7I8=\""
echo "NEXTAUTH_URL=\"http://localhost:3000\""
echo ""
echo "# Google OAuth Configuration (get from Google Cloud Console)"
echo "GOOGLE_CLIENT_ID=\"your-client-id.apps.googleusercontent.com\""
echo "GOOGLE_CLIENT_SECRET=\"your-client-secret\""
echo ""
echo "# Admin Email (your Google account email)"
echo "ADMIN_EMAIL=\"your-email@gmail.com\""
echo ""
echo "🔗 Next steps:"
echo "1. Follow the Google OAuth setup guide: GOOGLE_OAUTH_SETUP.md"
echo "2. Get your Google OAuth credentials from Google Cloud Console"
echo "3. Update the .env file with your credentials"
echo "4. Start the development server: npm run dev"
echo ""
echo "✨ Your admin interface will be secured with Google OAuth!"
