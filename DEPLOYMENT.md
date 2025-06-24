# 🚀 Vercel Deployment Guide for Agentic-XAI

## ✅ Prerequisites Checklist

Before deploying, ensure:
- [ ] Code is pushed to GitHub
- [ ] Both local servers work (frontend + backend)
- [ ] No pending commits

## 🔧 Deployment Steps

### 1. **Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository: `Agentic-XAI`

### 2. **Configure Build Settings**
Vercel should auto-detect the configuration from `vercel.json`, but verify:

- **Framework Preset**: Other
- **Build Command**: (Auto-detected from package.json)
- **Output Directory**: (Auto-detected)
- **Install Command**: (Auto-detected)

### 3. **Set Environment Variables**
In Vercel Dashboard → Project → Settings → Environment Variables:

```
HUGGING_FACE_TOKEN=your_token_here (Optional - for AI features)
NODE_ENV=production
```

### 4. **Deploy**
Click "Deploy" - Vercel will:
1. Build the React frontend
2. Deploy the Python backend
3. Configure routes automatically

## 🚨 Common 404 Issues & Fixes

### **Issue 1: Frontend 404s**
**Symptoms**: Main page doesn't load
**Fix**: Ensure `vercel.json` routes are correct:
```json
{
  "src": "/(.*)",
  "dest": "frontend/index.html"
}
```

### **Issue 2: API 404s**
**Symptoms**: `/api/task` returns 404
**Fix**: Check API route configuration:
```json
{
  "src": "/api/(.*)",
  "dest": "api/main.py"
}
```

### **Issue 3: Static Assets 404s**
**Symptoms**: CSS/JS files don't load
**Fix**: Verify static file routing:
```json
{
  "src": "/(.*\\.(js|css|map|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))$",
  "dest": "frontend/$1"
}
```

### **Issue 4: Build Failures**
**Symptoms**: Deployment fails during build
**Fix**: Check build logs for:
- Missing dependencies
- TypeScript errors
- Environment variable issues

## 🔍 Debugging Steps

### 1. **Check Deployment Logs**
In Vercel Dashboard → Deployments → View Function Logs

### 2. **Test API Endpoints**
```bash
# Test root endpoint
curl https://your-vercel-url.vercel.app/

# Test API endpoint
curl -X POST https://your-vercel-url.vercel.app/api/task \
  -H "Content-Type: application/json" \
  -d '{"task_description": "test", "context": {}}'
```

### 3. **Check Network Tab**
Open browser DevTools → Network tab → Look for:
- Failed requests (red)
- 404 errors
- CORS issues

## 📝 Current Configuration

Your `vercel.json` is configured for:
- ✅ Python FastAPI backend at `/api/*`
- ✅ React frontend for all other routes
- ✅ Proper static asset handling
- ✅ SPA routing support

## 🆘 Still Getting 404s?

1. **Check the exact URL** causing 404
2. **Verify file paths** in vercel.json match your structure
3. **Check build output** in Vercel dashboard
4. **Test locally** with `vercel dev` (if you have Vercel CLI)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI on Vercel](https://vercel.com/docs/concepts/deployments/serverless-functions/runtimes/python)
- [React SPA Routing](https://vercel.com/guides/deploying-react-with-vercel) 