# Railway Deployment Guide

## Quick Setup (5 minutes)

### Step 1: Sign Up for Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. You get $5/month free credit (perfect for your project!)

### Step 2: Deploy Your Backend
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your repository: `Harthik777/Agentic-XAI`
4. Railway will automatically detect it's a Python app

### Step 3: Set Environment Variables
1. Go to your project dashboard
2. Click "Variables" tab
3. Add: `GOOGLE_API_KEY` = your Google API key
4. Railway will automatically redeploy

### Step 4: Get Your Backend URL
1. Go to "Settings" tab
2. Copy the "Domain" URL (something like `https://your-app-name.railway.app`)
3. This is your new backend URL!

### Step 5: Update Frontend
1. Go to your Vercel dashboard
2. Update environment variable: `REACT_APP_API_BASE` = your Railway URL
3. Redeploy frontend

## Why Railway is Better

✅ **Free tier**: $5/month credit (enough for your app)
✅ **Python support**: Perfect for FastAPI
✅ **Automatic deployment**: Just push to GitHub
✅ **Global CDN**: Fast worldwide
✅ **No quota issues**: Unlike Azure free tier
✅ **Simple setup**: 5 minutes vs 30+ minutes

## Troubleshooting

### If deployment fails:
1. Check the logs in Railway dashboard
2. Make sure `GOOGLE_API_KEY` is set
3. Verify requirements.txt is complete

### If frontend can't connect:
1. Check the Railway URL is correct
2. Make sure CORS is enabled (already done in code)
3. Test the backend URL directly

## Cost
- **Free tier**: $5/month credit
- **Your app**: Will use ~$1-2/month
- **Student friendly**: Much cheaper than Azure paid tier

## Next Steps
1. Deploy to Railway
2. Update frontend URL
3. Test the full application
4. Enjoy your working AI app! 🎉 