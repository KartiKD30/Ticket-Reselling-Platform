const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ticket_resale_unified')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create test users
const createTestUsers = async () => {
  try {
    // Create admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('Admin user created: admin/admin123');
    }

    // Update test user (create if doesn't exist)
    const testUser = await User.findOne({ username: 'testuser' });
    if (testUser) {
      // Update existing user
      testUser.password = 'test123';
      testUser.isVerified = true;
      await testUser.save();
      console.log('Test user updated: testuser/test123');
    } else {
      // Create new user
      const newUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123',
        role: 'user',
        isVerified: true
      });
      await newUser.save();
      console.log('Test user created: testuser/test123');
    }

    // Update organizer user (create if doesn't exist)
    const organizer = await User.findOne({ username: 'organizer' });
    if (organizer) {
      // Update existing user
      organizer.password = 'organizer123';
      organizer.isVerified = true;
      await organizer.save();
      console.log('Organizer user updated: organizer/organizer123');
    } else {
      // Create new user
      const newOrganizer = new User({
        username: 'organizer',
        email: 'organizer@example.com',
        password: 'organizer123',
        role: 'organizer',
        isVerified: true
      });
      await newOrganizer.save();
      console.log('Organizer user created: organizer/organizer123');
    }

    console.log('Test users created/updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
