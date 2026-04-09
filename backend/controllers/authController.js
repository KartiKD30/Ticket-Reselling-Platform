const User = require('../models/User');
const nodemailer = require('nodemailer');
const { generateToken } = require('../utils/token');
const { generateOTP, getOTPExpiries } = require('../utils/otp');

const env = (key, fallback = '') => (process.env[key] || fallback).trim();

const smtpHost = env('SMTP_HOST');
const smtpUser = env('SMTP_USER');
const smtpPass = env('SMTP_PASS');
const smtpPort = Number(env('SMTP_PORT', '587'));
const smtpSecure = env('SMTP_SECURE', 'false') === 'true';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass
    ? {
        user: smtpUser,
        pass: smtpPass,
      }
    : undefined,
});

// Sends OTP email via SMTP. Falls back to console in development when SMTP isn't configured.
const sendOTPEmail = async (email, otp) => {
  const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

  if (!isSmtpConfigured) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('SMTP is not configured. Using console OTP fallback for development.');
      console.log(`📧 OTP sent to ${email}: ${otp}`);
      return true;
    }
    throw new Error('SMTP credentials are missing. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  const mailFrom = env('MAIL_FROM') || smtpUser;

  await transporter.sendMail({
    from: mailFrom,
    to: email,
    subject: 'Smart Ticket OTP Verification',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2 style="margin-bottom: 8px;">Smart Ticket Verification</h2>
        <p>Your one-time password (OTP) is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${otp}</p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  console.log(`📧 OTP email delivered to ${email}`);
  return true;
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
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
      otp: {
        code: otp,
        expiresAt: otpExpiry,
      },
    });

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: 'Signup successful. OTP sent to your email.',
      username,
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({ error: 'Username and OTP are required' });
    }

    const user = await User.findOne({ username });

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
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
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
    await sendOTPEmail(email, otp);

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

module.exports = {
  signup,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getWallet,
  addWalletTransaction,
};
