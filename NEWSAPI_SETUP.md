# NewsAPI Setup Guide

## Quick Setup (5 minutes)

### 1. Get Your Free NewsAPI Key

1. **Visit**: https://newsapi.org/register
2. **Sign up** with your email address
3. **Verify** your email
4. **Copy** your API key from the dashboard

### 2. Add to Environment Variables

**For Local Development:**
```bash
# Add to your .env file
NEWS_API_KEY="your-newsapi-key-here"
```

**For Production (Vercel):**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `NEWS_API_KEY` = `your-newsapi-key-here`
5. Redeploy your application

### 3. Test the Integration

Visit any company page (e.g., `/companies/BTCS`) and you should see:
- **Latest News** section with recent articles
- **Company-specific** news filtering
- **Direct links** to full articles

## NewsAPI Free Tier Limits

- **1,000 requests/month**
- **100 requests/day**
- **No credit card required**

## How It Works

The news integration:
1. **Searches** for articles mentioning the company name or ticker
2. **Filters** results to ensure relevance
3. **Caches** responses for 1 hour to minimize API usage
4. **Falls back** gracefully when API is unavailable

## Troubleshooting

**No news showing?**
- Check that `NEWS_API_KEY` is set in environment variables
- Verify the API key is valid at https://newsapi.org/account
- Check browser console for any error messages

**API limit reached?**
- NewsAPI free tier resets daily
- Consider upgrading to paid tier for higher limits
- News section will show "API not configured" message

## Alternative: Without NewsAPI

If you prefer not to use NewsAPI, the site will work perfectly without it:
- SEC filings will still work (free government API)
- News section will show "News integration not configured"
- All other features remain fully functional
