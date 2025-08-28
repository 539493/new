const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Load server data
let serverData = {
  teacherProfiles: {},
  studentProfiles: {},
  timeSlots: [],
  lessons: [],
  chats: [],
  posts: [],
  notifications: [],
  overbookingRequests: []
};

const dataFilePath = path.join(__dirname, 'server_data.json');
const initialDataPath = path.join(__dirname, 'initial-data.json');

function loadServerData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      serverData = JSON.parse(data);
      console.log('Loaded server data from file');
    } else if (fs.existsSync(initialDataPath)) {
      const data = fs.readFileSync(initialDataPath, 'utf8');
      serverData = JSON.parse(data);
      console.log('Loaded initial data from file');
    } else {
      console.log('No data files found, using default empty data');
    }
  } catch (error) {
    console.error('Error loading server data:', error);
  }
}

function saveServerData() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(serverData, null, 2));
    console.log('Server data saved to file');
  } catch (error) {
    console.error('Error saving server data:', error);
  }
}

// Load data on startup
loadServerData();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
    dataStats: {
      teachers: Object.keys(serverData.teacherProfiles).length,
      students: Object.keys(serverData.studentProfiles).length,
      posts: serverData.posts.length,
      slots: serverData.timeSlots.length
    }
  });
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Nauchi Platform Server'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Test event
  socket.on('test', (data) => {
    console.log('Test event received:', data);
    socket.emit('test-response', { message: 'Server received your test message!' });
  });

  // Request all posts
  socket.on('requestAllPosts', () => {
    socket.emit('allPosts', serverData.posts);
  });

  // Request user notifications
  socket.on('requestUserNotifications', (userId) => {
    const userNotifications = serverData.notifications.filter(n => n.userId === userId);
    socket.emit('userNotifications', userNotifications);
  });
});

const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Production server running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check available at http://${HOST}:${PORT}/health`);
  console.log(`🔌 Socket.IO server ready for connections`);
  console.log(`📁 Data loaded: ${Object.keys(serverData.teacherProfiles).length} teachers, ${serverData.posts.length} posts`);
}); 