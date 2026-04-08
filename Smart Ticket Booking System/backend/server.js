require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const supportRoutes = require('./routes/support');
const { autoCompletePassedBookings } = require('./controllers/bookingController');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/support', supportRoutes);

// Automatically mark past confirmed bookings as completed.
setInterval(async () => {
  const updatedCount = await autoCompletePassedBookings();
  if (updatedCount > 0) {
    console.log(`Auto-completed ${updatedCount} booking(s).`);
  }
}, 60 * 1000);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
});
