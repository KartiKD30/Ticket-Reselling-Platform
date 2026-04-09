const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      id: Number,
      name: String,
      city: String,
      venue: String,
      date: String,
      category: String,
      price: Number,
    },
    seats: {
      type: [String],
      default: [],
    },
    total: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Completed', 'Canceled'],
      default: 'Confirmed',
    },
    transactionId: String,
    receiptId: String,
    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountDescription: String,
    walletDeducted: {
      type: Number,
      default: 0,
      min: 0,
    },
    wasResaleListed: {
      type: Boolean,
      default: false,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
