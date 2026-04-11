const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ticket_resale_unified')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const checkUsers = async () => {
  try {
    const users = await User.find({});
    console.log('All users in database:');
    users.forEach(user => {
      console.log(`Username: ${user.username}, Email: ${user.email}, Verified: ${user.isVerified}, Role: ${user.role}`);
    });
    
    const testUser = await User.findOne({ username: 'testuser' });
    if (testUser) {
      console.log('\nTest user details:');
      console.log(`Username: ${testUser.username}`);
      console.log(`Email: ${testUser.email}`);
      console.log(`Verified: ${testUser.isVerified}`);
      console.log(`Role: ${testUser.role}`);
      console.log(`Password exists: ${!!testUser.password}`);
    } else {
      console.log('Test user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
};

checkUsers();
