# 🚨 502 Bad Gateway Error - Fix Guide

## 🔍 Problem Analysis

Your tutoring platform is experiencing a **502 Bad Gateway** error on Render. This typically means:
- The service is not starting properly
- Health checks are failing
- Port configuration issues
- Missing endpoints

## ✅ Fixes Applied

### 1. Added Missing Health Check Endpoint
- **Problem**: `render.yaml` specified `/api/health` but server only had `/health`
- **Solution**: Added `/api/health` endpoint that returns proper JSON response
- **Location**: `backend/production-server.cjs` lines 390-397

### 2. Enhanced Root Endpoint
- **Problem**: Root endpoint was conditional and could fail
- **Solution**: Added dedicated root endpoint for service verification
- **Location**: `backend/production-server.cjs` lines 400-412

### 3. Improved Server Logging
- **Problem**: Limited debugging information
- **Solution**: Added detailed startup logging with health check URLs
- **Location**: `backend/production-server.cjs` lines 650-655

### 4. Added Test Script
- **Problem**: No way to test server locally before deploy
- **Solution**: Created `scripts/test-server-start.js` for local testing
- **Command**: `npm run test:server`

## 🧪 Testing Steps

### 1. Test Server Locally
```bash
# Test if server can start
npm run test:server

# Or manually test
npm start
# Then visit http://localhost:10000/api/health
```

### 2. Verify Health Check
```bash
# Test health endpoint
curl http://localhost:10000/api/health
curl http://localhost:10000/health
curl http://localhost:10000/
```

### 3. Check Build Process
```bash
# Verify build works
npm run build

# Check if dist folder exists
ls -la dist/
```

## 🚀 Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "Fix 502 error: add health check endpoints and improve logging"
git push origin main
```

### 2. Monitor Render Dashboard
- Go to [Render Dashboard](https://dashboard.render.com)
- Find your service: `tutoring-platform-new`
- Watch the build and deploy logs

### 3. Verify Health Check
After deployment, test:
```bash
curl https://your-service-name.onrender.com/api/health
curl https://your-service-name.onrender.com/
```

## 🔧 Configuration Verification

### render.yaml
```yaml
services:
  - type: web
    name: tutoring-platform-new
    env: node
    buildCommand: npm install --legacy-peer-deps && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health  # ✅ Now matches server endpoint
```

### Server Endpoints
- ✅ `/` - Root status endpoint
- ✅ `/health` - Basic health check
- ✅ `/api/health` - Render health check (matches render.yaml)

## 🚨 Common Issues & Solutions

### Issue: Build Fails
**Solution**: Check Node.js version compatibility
```bash
node --version  # Should be >=20.0.0
npm --version   # Should be >=8.0.0
```

### Issue: Port Already in Use
**Solution**: Verify port 10000 is available
```bash
lsof -i :10000
```

### Issue: Missing Dependencies
**Solution**: Use legacy peer deps flag
```bash
npm install --legacy-peer-deps
```

### Issue: Health Check Timeout
**Solution**: Verify endpoint responds quickly
```bash
time curl http://localhost:10000/api/health
```

## 📊 Monitoring

### Render Dashboard
- **Build Logs**: Check for build errors
- **Runtime Logs**: Monitor server startup
- **Health Check**: Verify `/api/health` responds

### Local Testing
```bash
# Test all endpoints
npm run test:server

# Check server logs
npm start 2>&1 | tee server.log
```

## 🎯 Expected Results

After applying these fixes:
1. ✅ Server starts successfully
2. ✅ Health check passes (`/api/health` returns 200)
3. ✅ Root endpoint responds (`/` returns service status)
4. ✅ Render service becomes healthy
5. ✅ 502 error disappears

## 🔄 If Issues Persist

### 1. Check Render Logs
- Look for specific error messages
- Verify environment variables
- Check resource limits

### 2. Verify Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 3. Test Minimal Server
Create a minimal test server to isolate issues:
```javascript
const express = require('express');
const app = express();
app.get('/api/health', (req, res) => res.json({status: 'ok'}));
app.listen(10000, () => console.log('Test server running'));
```

---

**🎯 Ready to deploy!** The fixes should resolve your 502 error.
