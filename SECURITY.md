# 🔐 S(ai)m Jr Security & Deployment Guide

## ⚠️ CRITICAL SECURITY NOTICE
**NEVER commit `.env` files or API keys to version control!**

## 🛡️ Environment Variable Security

### Development (.env file)
```bash
# Local development only - NEVER commit this file
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_MODEL=model-router
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=1000
```

### Production Deployment (Render/Railway/Azure)

#### For Render.com:
1. Go to your service settings
2. Add Environment Variables:
   - `AI_PROVIDER=azure`
   - `AZURE_OPENAI_API_KEY=your_actual_key`
   - `AZURE_OPENAI_ENDPOINT=your_actual_endpoint`
   - `AZURE_OPENAI_MODEL=model-router`
   - `AZURE_OPENAI_API_VERSION=2024-02-15-preview`

#### For Railway:
1. Go to your project settings
2. Add Environment Variables in the Variables tab
3. Same variables as above

#### For Azure App Service:
1. Go to Configuration > Application Settings
2. Add each environment variable
3. Restart the app service

## 🚀 Deployment Checklist

### Before Deploying:
- [ ] Remove `.env` from repository
- [ ] Verify `.gitignore` includes `.env*`
- [ ] Set environment variables in platform dashboard
- [ ] Test with production Azure OpenAI endpoint
- [ ] Update CORS origins for production domain

### Security Best Practices:
1. **Never log API keys** - Keys are automatically masked in logs
2. **Use different keys** for dev/staging/production
3. **Rotate keys regularly** - Azure allows key rotation
4. **Monitor usage** - Track API usage in Azure portal
5. **Set rate limits** - Configure appropriate rate limiting

## 🔧 Local Development Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Azure credentials:
   ```bash
   # Get these from Azure Portal > Azure OpenAI Service
   AZURE_OPENAI_API_KEY=your_key_from_azure_portal
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   ```

3. Never commit the `.env` file:
   ```bash
   # This should show .env is ignored
   git status
   ```

## 🌐 Production Environment Variables

For production deployment, set these environment variables in your hosting platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `AI_PROVIDER` | AI provider type | `azure` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `abc123...` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | `https://myservice.openai.azure.com/` |
| `AZURE_OPENAI_MODEL` | Deployed model name | `gpt-4` or `model-router` |
| `AZURE_OPENAI_API_VERSION` | Azure API version | `2024-02-15-preview` |
| `AI_TEMPERATURE` | AI creativity level | `0.3` |
| `AI_MAX_TOKENS` | Max tokens per response | `1000` |

## 🔍 Testing Security

Run this command to verify no secrets are in your repo:
```bash
git log --all --full-history -- '*.env'
# Should return empty if .env was never committed
```

## 🆘 If You Accidentally Commit Secrets

1. **Immediately rotate the API key** in Azure Portal
2. Remove the commit from history:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push: `git push origin --force --all`
4. Update all deployment environments with new key

## 📞 Support

For security issues or questions about Azure OpenAI integration, refer to:
- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Azure Security Best Practices](https://docs.microsoft.com/en-us/azure/security/)