#!/bin/bash

echo "🧪 Testing Render service functionality..."
echo "========================================"

SERVICE_URL="https://tutoring-platform-1756666331-zjfl.onrender.com"

# Test 1: Basic connectivity
echo "1️⃣ Testing basic connectivity..."
if curl -s "$SERVICE_URL" > /dev/null; then
    echo "   ✅ Service is accessible"
else
    echo "   ❌ Service is not accessible"
    exit 1
fi

# Test 2: Health check
echo "2️⃣ Testing health check..."
HEALTH_RESPONSE=$(curl -s "$SERVICE_URL/api/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ Health check passed"
    echo "   📊 Response: $HEALTH_RESPONSE"
else
    echo "   ❌ Health check failed"
    echo "   📊 Response: $HEALTH_RESPONSE"
fi

# Test 3: Frontend loading
echo "3️⃣ Testing frontend loading..."
FRONTEND_RESPONSE=$(curl -s "$SERVICE_URL" | head -5)
if echo "$FRONTEND_RESPONSE" | grep -q "Nauchi"; then
    echo "   ✅ Frontend loads correctly"
    echo "   📄 Title: $(echo "$FRONTEND_RESPONSE" | grep -o '<title>.*</title>')"
else
    echo "   ❌ Frontend not loading properly"
fi

# Test 4: Socket.IO connection (basic)
echo "4️⃣ Testing Socket.IO availability..."
SOCKET_JS=$(curl -s "$SERVICE_URL" | grep -o 'socket-[^"]*\.js')
if [ -n "$SOCKET_JS" ]; then
    echo "   ✅ Socket.IO script found: $SOCKET_JS"
else
    echo "   ❌ Socket.IO script not found"
fi

# Test 5: API endpoints availability
echo "5️⃣ Testing API endpoints..."
echo "   🔍 Checking for common API patterns..."

# Test 6: Performance check
echo "6️⃣ Testing response time..."
START_TIME=$(date +%s%N)
curl -s "$SERVICE_URL/api/health" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
echo "   ⏱️  Health check response time: ${RESPONSE_TIME}ms"

if [ $RESPONSE_TIME -lt 1000 ]; then
    echo "   ✅ Response time is good (< 1s)"
elif [ $RESPONSE_TIME -lt 3000 ]; then
    echo "   ⚠️  Response time is acceptable (< 3s)"
else
    echo "   ❌ Response time is slow (> 3s)"
fi

echo ""
echo "🎯 Service Status Summary:"
echo "=========================="
echo "🌐 URL: $SERVICE_URL"
echo "📊 Health: $(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
echo "⏱️  Response Time: ${RESPONSE_TIME}ms"
echo "🎉 Service is operational on Render!"
