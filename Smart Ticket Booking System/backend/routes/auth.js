const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getWallet,
} = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/signup/', validateSignup, signup);
router.post('/verify-otp/', verifyOTP);
router.post('/login/', validateLogin, login);
router.post('/forgot-password/', forgotPassword);
router.post('/reset-password/', resetPassword);

// Protected routes
router.get('/wallet/', verifyToken, getWallet);

module.exports = router;
