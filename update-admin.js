const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ticket_resale_unified')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const updateAdminUser = async () => {
  try {
    // Find and update admin user
    const admin = await User.findOne({ username: 'admin' });
    if (admin) {
      admin.email = 'admin@gmail.com';
      admin.password = 'admin123';
      admin.isVerified = true;
      await admin.save();
      console.log('Admin user updated successfully!');
      console.log('New credentials: admin / admin123');
      console.log('Email: admin@gmail.com');
    } else {
      // Create admin user if doesn't exist
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      await newAdmin.save();
      console.log('Admin user created successfully!');
      console.log('Credentials: admin / admin123');
      console.log('Email: admin@gmail.com');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin user:', error);
    process.exit(1);
  }
};

updateAdminUser();
