# 🚀 Azure Deployment Guide for GitHub Student Pack

## Prerequisites ✅

1. **Azure Account**: Signed up with your student email
2. **GitHub Student Pack**: Activated ($100 Azure credits)
3. **Azure CLI**: Installed on your computer

## Quick Deployment (Recommended) 🏃‍♂️

### Option 1: Automated Script
```powershell
# Run the automated deployment script
.\deploy-to-azure.ps1
```

### Option 2: Manual Azure Portal
1. Go to [portal.azure.com](https://portal.azure.com)
2. Create Resource → App Service
3. Configure:
   - **Resource Group**: Create new "agentic-xai-rg"
   - **Name**: Choose unique name (e.g., "agentic-xai-yourname")
   - **Runtime**: Python 3.11
   - **Region**: East US
   - **Pricing**: F1 (Free) - Perfect for students!

## Detailed Steps 📋

### Step 1: Install Azure CLI
Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

### Step 2: Login to Azure
```bash
az login
# Use your student email when prompted
```

### Step 3: Deploy Using CLI
```bash
# Create resource group
az group create --name "agentic-xai-rg" --location "East US"

# Create app service plan (Free tier)
az appservice plan create --name "agentic-xai-plan" --resource-group "agentic-xai-rg" --sku F1 --is-linux

# Create web app
az webapp create --resource-group "agentic-xai-rg" --plan "agentic-xai-plan" --name "your-unique-app-name" --runtime "PYTHON|3.11"

# Set environment variables
az webapp config appsettings set --resource-group "agentic-xai-rg" --name "your-unique-app-name" --settings GOOGLE_API_KEY="AIzaSyA2TmD3yc-yJrCafcVCcLUHVkvKreKrCU8"

# Deploy the code
az webapp up --name "your-unique-app-name" --resource-group "agentic-xai-rg"
```

### Step 4: Configure Startup
```bash
# Set startup command
az webapp config set --resource-group "agentic-xai-rg" --name "your-unique-app-name" --startup-file "python app.py"
```

## Testing Your Deployment 🧪

1. **Health Check**: Visit `https://your-app-name.azurewebsites.net/health`
2. **API Test**: Visit `https://your-app-name.azurewebsites.net/test`
3. **Full API**: Test with Postman or curl

## Connect to Frontend 🔗

1. **Update Vercel Environment**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `REACT_APP_API_BASE=https://your-app-name.azurewebsites.net`
   - Redeploy frontend

2. **Test Full Stack**:
   - Visit your Vercel frontend
   - Submit a task and verify it works!

## Student Benefits 🎓

- **$100 Azure Credits**: 12 months free
- **F1 Free Tier**: Perfect for student projects
- **Professional Domain**: .azurewebsites.net
- **SSL Certificate**: HTTPS by default
- **Scaling**: Can upgrade as your project grows

## Troubleshooting 🔧

### Common Issues:
1. **Import Errors**: The `app.py` file handles path issues automatically
2. **Environment Variables**: Check they're set in Azure Portal → Configuration
3. **Startup Issues**: Verify startup command is set to "python app.py"

### Logs:
```bash
# View deployment logs
az webapp log tail --name "your-app-name" --resource-group "agentic-xai-rg"
```

## Cost Management 💰

- **F1 Free Tier**: 60 CPU minutes/day, 1GB RAM
- **Perfect for**: Development, testing, small projects
- **Monitor Usage**: Azure Portal → Cost Management

## Next Steps 🎯

1. **Custom Domain**: Add your own domain (optional)
2. **Database**: Add Azure PostgreSQL if needed
3. **Monitoring**: Set up Application Insights
4. **CI/CD**: Configure GitHub Actions for auto-deployment

---

**🎉 Congratulations!** Your AI-powered decision making app is now live on Microsoft Azure! 