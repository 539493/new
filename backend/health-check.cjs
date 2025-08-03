const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    message: 'Tutoring Platform Server is running'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Tutoring Platform Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Health check server running on port ${PORT}`);
  console.log(`📡 Server accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://${HOST}:${PORT}`);
  console.log(`  - Environment: ${process.env.NODE_ENV || 'production'}`);
}); 