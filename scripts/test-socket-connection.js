#!/usr/bin/env node

import { io } from 'socket.io-client';

const SERVICE_URL = 'https://tutoring-platform-1756666331-zjfl.onrender.com';

console.log('🔌 Testing Socket.IO connection to Render service...');
console.log('==================================================');

// Test 1: Check if service is accessible
console.log('1️⃣ Testing service accessibility...');
try {
  const response = await fetch(`${SERVICE_URL}/api/health`);
  if (response.ok) {
    const health = await response.json();
    console.log('   ✅ Service is accessible');
    console.log(`   📊 Status: ${health.status}`);
    console.log(`   🔌 Socket connections: ${health.socketConnections || 0}`);
  } else {
    console.log('   ❌ Service health check failed');
    process.exit(1);
  }
} catch (error) {
  console.log('   ❌ Cannot reach service:', error.message);
  process.exit(1);
}

// Test 2: Test Socket.IO connection
console.log('\n2️⃣ Testing Socket.IO connection...');
try {
  const socket = io(SERVICE_URL, {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    forceNew: true
  });

  let connected = false;
  let connectionError = null;

  socket.on('connect', () => {
    console.log('   ✅ Socket.IO connected successfully!');
    console.log(`   🔌 Socket ID: ${socket.id}`);
    console.log(`   🌐 Transport: ${socket.io.engine.transport.name}`);
    connected = true;
    
    // Test ping/pong
    socket.emit('ping');
  });

  socket.on('pong', (data) => {
    console.log('   ✅ Ping/pong test passed');
    console.log(`   📊 Server time: ${data.timestamp}`);
  });

  socket.on('connectionStatus', (data) => {
    console.log('   ✅ Connection status received');
    console.log(`   📊 Status: ${data.status}`);
  });

  socket.on('serverStatus', (data) => {
    console.log('   ✅ Server status received');
    console.log(`   📊 Connections: ${data.connections}`);
    console.log(`   📈 Data stats: ${data.dataStats.teachers} teachers, ${data.dataStats.students} students`);
  });

  socket.on('connect_error', (error) => {
    console.log('   ❌ Socket.IO connection error:', error.message);
    connectionError = error;
  });

  socket.on('disconnect', (reason) => {
    console.log(`   🔌 Socket.IO disconnected: ${reason}`);
  });

  // Wait for connection or timeout
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (!connected) {
        console.log('   ⏰ Connection timeout');
        resolve();
      }
    }, 10000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve();
    });

    socket.on('connect_error', () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  if (connected) {
    // Test server status request
    socket.emit('getServerStatus');
    
    // Wait a bit for response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Disconnect
    socket.disconnect();
    console.log('   🔌 Socket.IO connection test completed');
  } else {
    console.log('   ❌ Socket.IO connection failed');
    if (connectionError) {
      console.log(`   📊 Error details: ${connectionError.message}`);
    }
  }

} catch (error) {
  console.log('   ❌ Socket.IO test error:', error.message);
}

console.log('\n🎯 Socket.IO Connection Test Summary:');
console.log('=====================================');
console.log(`🌐 Service URL: ${SERVICE_URL}`);
console.log('🔌 Socket.IO: Test completed');
console.log('📊 Check the results above for connection status');

if (connected) {
  console.log('✅ Your service is now ONLINE and ready for real-time communication!');
} else {
  console.log('❌ Socket.IO connection issues detected. Check CORS and network settings.');
}
