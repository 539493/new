#!/bin/bash

# Check if 502 error is fixed
echo "🔍 Checking if 502 error is fixed..."

# Get the service URL from render.yaml
SERVICE_NAME=$(grep "name:" render.yaml | awk '{print $2}')
echo "📡 Service: $SERVICE_NAME"

# Check if service is responding
echo "🌐 Testing service endpoints..."

# Test root endpoint
echo "📍 Root endpoint (/):"
curl -s -w "HTTP Status: %{http_code}\n" "https://$SERVICE_NAME.onrender.com/" | head -5

echo ""

# Test health check endpoint
echo "💚 Health check (/api/health):"
curl -s -w "HTTP Status: %{http_code}\n" "https://$SERVICE_NAME.onrender.com/api/health"

echo ""
echo ""

# Check if we got a 502 error
if curl -s "https://$SERVICE_NAME.onrender.com/" | grep -q "502 Bad Gateway"; then
    echo "❌ 502 error still present"
    echo "🔧 Check Render dashboard for build/deploy logs"
    exit 1
else
    echo "✅ 502 error resolved!"
    echo "🎉 Service is now responding correctly"
fi
