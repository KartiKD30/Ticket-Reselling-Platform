const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/organizerdb';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB local instance'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic Routes Mock
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Import and use routes (will add these shortly)
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/resale', require('./routes/resale'));
app.use('/api/promos', require('./routes/promos'));
app.use('/api/payouts', require('./routes/payouts'));
app.use('/api/waitlist', require('./routes/waitlist'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
