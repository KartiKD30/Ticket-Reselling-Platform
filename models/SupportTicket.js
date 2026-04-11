const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: ['Booking', 'Payment', 'Refund', 'Resale', 'Account', 'Other'],
      default: 'Other',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    bookingId: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
