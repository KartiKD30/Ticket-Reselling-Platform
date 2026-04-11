require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { verifyToken } = require('./middleware/auth');
const { getWallet } = require('./controllers/authController');

const app = express();

// Database connection - Single source of truth for all modules
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket_resale_unified';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✓ Connected to unified MongoDB database');
    return true;
  } catch (err) {
    console.error('✗ Database connection error:', err);
    return false;
  }
};

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Unified Ticket Platform is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Unified Ticket Platform API is running',
    database: 'unified',
    modules: ['admin', 'organizer', 'user']
  });
});

app.get('/api/wallet/', verifyToken, getWallet);
app.get('/api/wallet', verifyToken, getWallet);

// Import routes from all modules
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/resale', require('./routes/resale'));
app.use('/api/promos', require('./routes/promos'));
app.use('/api/payouts', require('./routes/payouts'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/support', require('./routes/support'));

// Module-specific route aliases for clarity
app.use('/api/organizer/events', require('./routes/events'));
app.use('/api/organizer/analytics', require('./routes/analytics'));
app.use('/api/organizer/tickets', require('./routes/tickets'));
app.use('/api/organizer/resale', require('./routes/resale'));
app.use('/api/organizer/promos', require('./routes/promos'));
app.use('/api/organizer/payouts', require('./routes/payouts'));
app.use('/api/organizer/waitlist', require('./routes/waitlist'));

app.use('/api/user/bookings', require('./routes/bookings'));
app.use('/api/user/support', require('./routes/support'));
app.use('/api/user/events', require('./routes/events'));
app.use('/api/user/resale', require('./routes/resale'));
app.use('/api/user/waitlist', require('./routes/waitlist'));

app.use('/api/admin/stats', require('./routes/admin'));
app.use('/api/admin/events', require('./routes/events'));
app.use('/api/admin/users', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    hint: 'Check the API documentation for available endpoints'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database first
  const dbConnected = await connectDB();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`\n📦 ======================================`);
      console.log(`🚀 Unified Ticket Platform running on http://localhost:${PORT}`);
      console.log(`📚 Database: Unified MongoDB`);
      console.log(`📡 Available Modules:`);
      console.log(`   - Admin Dashboard`);
      console.log(`   - Organizer Panel`);
      console.log(`   - User Client`);
      console.log(`📋 API Base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📦 ======================================\n`);
    });
  } else {
    console.error('Failed to start server: Database connection failed');
    process.exit(1);
  }
};

startServer();


