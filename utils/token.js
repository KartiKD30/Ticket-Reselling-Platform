const jwt = require('jsonwebtoken');

const generateToken = (userId, username, role) => {
  return jwt.sign(
    { 
      id: userId, 
      username, 
      role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

module.exports = {
  generateToken
};
