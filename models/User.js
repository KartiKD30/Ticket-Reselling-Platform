const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'organizer'],
      default: 'user',
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      transactions: [
        {
          type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
          description: String,
          bookingId: mongoose.Schema.Types.ObjectId,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      favoriteCategories: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Virtual for full name
userSchema.virtual('name').get(function() {
  const firstName = this.profile?.firstName || '';
  const lastName = this.profile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || this.username || 'Unknown User';
});

// Virtual for display role (capitalize first letter)
userSchema.virtual('displayRole').get(function() {
  if (!this.role) {
    return 'User';
  }
  return this.role.charAt(0).toUpperCase() + this.role.slice(1);
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
