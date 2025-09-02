#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing production server startup...');

// Change to project root directory
process.chdir(path.join(__dirname, '..'));

// Test the start command
const startProcess = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

// Set a timeout to stop the test
setTimeout(() => {
  console.log('\n⏰ Test timeout reached, stopping server...');
  startProcess.kill('SIGTERM');
  process.exit(0);
}, 10000); // 10 seconds

startProcess.on('close', (code) => {
  console.log(`\n✅ Server test completed with code: ${code}`);
  process.exit(code === 0 ? 0 : 1);
});

startProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});
