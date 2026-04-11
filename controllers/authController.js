const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { generateOTP, getOTPExpiries } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createAccount = async (req, res, role = 'user') => {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const { password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username: new RegExp(`^${escapeRegex(username)}$`, 'i') },
      ],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiries();

    // Create user
    const user = new User({
      username,
      email,
      password,
      role,
      profile: {
        phone,
      },
      otp: {
        code: otp,
        expiresAt: otpExpiry,
      },
    });

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, username);

    res.status(201).json({
      message: `${role === 'organizer' ? 'Organizer registration' : 'Signup'} successful. OTP sent to your email.`,
      username,
      role,
    });
  } catch (error) {
    console.error(`${role} signup error:`, error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
};

const signup = async (req, res) => createAccount(req, res, 'user');

const organizerSignup = async (req, res) => createAccount(req, res, 'organizer');

const verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({ error: 'Username and OTP are required' });
    }

    const user = await User.findOne({
      username: new RegExp(`^${escapeRegex(username)}$`, 'i'),
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check OTP
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.username, user.role || 'user');

    res.json({
      message: 'Email verified successfully',
      access: token,
      username: user.username,
      role: user.role || 'user',
    });
  } catch (error) {
    console.error('OTP verification error:', error.message);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const identifier = (username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    // Allow login by username or email
    const user = await User.findOne({
      $or: [
        { username: new RegExp(`^${escapeRegex(identifier)}$`, 'i') },
        { email: identifier.toLowerCase() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.username, user.role || 'user');

    res.json({
      message: 'Login successful',
      access: token,
      username: user.username,
      role: user.role || 'user',
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Email not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiries();

    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.username);

    res.json({
      message: 'OTP sent to your email',
      email,
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check OTP
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Update password
    user.password = new_password;
    user.otp = undefined;
    await user.save();

    res.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      wallet: {
        balance: user.wallet?.balance || 0,
        transactions: user.wallet?.transactions || [],
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error.message);
    res.status(500).json({ error: 'Failed to fetch wallet details' });
  }
};

const addWalletTransaction = async (userId, amount, type, description, bookingId = null) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.wallet) {
      user.wallet = { balance: 0, transactions: [] };
    }

    const transaction = {
      type,
      amount,
      description,
      bookingId,
      createdAt: new Date(),
    };

    user.wallet.transactions.push(transaction);

    if (type === 'credit') {
      user.wallet.balance += amount;
    } else if (type === 'debit') {
      user.wallet.balance -= amount;
      if (user.wallet.balance < 0) {
        user.wallet.balance = 0;
      }
    }

    await user.save();
    return user.wallet;
  } catch (error) {
    console.error('Add wallet transaction error:', error.message);
    throw error;
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const identifier = String(username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { username: new RegExp(`^${escapeRegex(identifier)}$`, 'i') },
        { email: identifier.toLowerCase() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(401).json({ error: 'Access denied. Admin only.' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.username, user.role);

    res.json({
      message: 'Admin login successful',
      access: token,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ error: 'Admin login failed' });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      role: 'admin',
      isVerified: true,
    });

    await user.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      username: user.username,
    });
  } catch (error) {
    console.error('Admin registration error:', error.message);
    res.status(500).json({ error: 'Admin registration failed' });
  }
};

const loadUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Load user error:', error.message);
    res.status(500).json({ error: 'Failed to load user' });
  }
};

module.exports = {
  signup,
  organizerSignup,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getWallet,
  addWalletTransaction,
  adminLogin,
  register,
  loadUser,
};

