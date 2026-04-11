const express = require('express');
const router = express.Router();
const {
  signup,
  organizerSignup,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getWallet,
  adminLogin,
  register,
  loadUser
} = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { verifyToken, auth } = require('../middleware/auth');

// User authentication routes
router.post('/signup/', validateSignup, signup);
router.post('/organizer/signup/', validateSignup, organizerSignup);
router.post('/verify-otp/', verifyOTP);
router.post('/login/', validateLogin, login);
router.post('/forgot-password/', forgotPassword);
router.post('/reset-password/', resetPassword);

// Admin authentication routes
router.post('/admin/login', adminLogin);
router.post('/admin/register', register); // Only for setup

// Protected routes
router.get('/wallet/', verifyToken, getWallet);
router.get('/admin/me', auth, loadUser);

module.exports = router;
