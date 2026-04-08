const jwt = require('jsonwebtoken');

const generateToken = (userId, username, role = 'user') => {
  return jwt.sign(
    { userId, username, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken };
