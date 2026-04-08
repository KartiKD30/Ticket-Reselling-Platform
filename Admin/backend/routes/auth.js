const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { login, register, loadUser } = require('../controllers/authController');

// Public
router.post('/login', login);
router.post('/register', register); // Only for setup

// Protected
router.get('/me', auth, loadUser);

module.exports = router;
