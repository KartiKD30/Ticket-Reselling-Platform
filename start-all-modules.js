const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Unified Ticket Platform - All Modules');
console.log('==================================================');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if node_modules exists in all directories
const requiredDirs = [
  './',
  './client',
  './admin-app', 
  './organizer-app'
];

for (const dir of requiredDirs) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log(`⚠️  Warning: node_modules not found in ${dir}`, 'yellow');
    log(`   Run: npm run install-all`, 'yellow');
  }
}

// Start backend server
log('📡 Starting Backend Server on port 5000...', 'cyan');
const backend = spawn('node', ['server.js'], {
  stdio: 'pipe',
  cwd: __dirname
});

backend.stdout.on('data', (data) => {
  log(`[Backend] ${data.toString().trim()}`, 'green');
});

backend.stderr.on('data', (data) => {
  log(`[Backend Error] ${data.toString().trim()}`, 'red');
});

// Wait for backend to start
setTimeout(() => {
  // Start User Dashboard
  log('👤 Starting User Dashboard on port 5173...', 'cyan');
  const userClient = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    cwd: path.join(__dirname, 'client'),
    shell: true
  });

  userClient.stdout.on('data', (data) => {
    log(`[User] ${data.toString().trim()}`, 'blue');
  });

  userClient.stderr.on('data', (data) => {
    log(`[User Error] ${data.toString().trim()}`, 'red');
  });
}, 3000);

// Wait for user dashboard to start
setTimeout(() => {
  // Start Admin Dashboard
  log('🔧 Starting Admin Dashboard on port 3001...', 'cyan');
  const adminClient = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    cwd: path.join(__dirname, 'admin-app'),
    shell: true
  });

  adminClient.stdout.on('data', (data) => {
    log(`[Admin] ${data.toString().trim()}`, 'magenta');
  });

  adminClient.stderr.on('data', (data) => {
    log(`[Admin Error] ${data.toString().trim()}`, 'red');
  });
}, 5000);

// Wait for admin dashboard to start
setTimeout(() => {
  // Start Organizer Dashboard
  log('🎪 Starting Organizer Dashboard on port 3002...', 'cyan');
  const organizerClient = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    cwd: path.join(__dirname, 'organizer-app'),
    shell: true
  });

  organizerClient.stdout.on('data', (data) => {
    log(`[Organizer] ${data.toString().trim()}`, 'yellow');
  });

  organizerClient.stderr.on('data', (data) => {
    log(`[Organizer Error] ${data.toString().trim()}`, 'red');
  });
}, 7000);

// Show access URLs after all services start
setTimeout(() => {
  log('\n🎉 All services started successfully!', 'green');
  log('==================================================', 'bright');
  log('📡 Backend API:     http://localhost:5000', 'bright');
  log('👤 User Dashboard:  http://localhost:5173', 'bright');
  log('🔧 Admin Dashboard: http://localhost:3001', 'bright');
  log('🎪 Organizer Dashboard: http://localhost:3002', 'bright');
  log('==================================================', 'bright');
  log('\n📝 Default Credentials:', 'yellow');
  log('   Admin: admin@example.com / admin123', 'yellow');
  log('   User: user@example.com / user123', 'yellow');
  log('   Organizer: organizer@example.com / organizer123', 'yellow');
  log('\n💡 Press Ctrl+C to stop all services', 'cyan');
}, 10000);

// Handle cleanup on exit
process.on('SIGINT', () => {
  log('\n🛑 Stopping all services...', 'yellow');
  process.exit(0);
});
