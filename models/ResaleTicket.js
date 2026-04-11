const mongoose = require('mongoose');

const resaleTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    event: {
      name: String,
      city: String,
      venue: String,
      date: String,
      time: String,
    },
    seats: {
      type: [String],
      default: [],
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    receiptId: {
      type: String,
      default: '',
    },
    resalePrice: {
      type: Number,
      required: true,
    },
    resaleBuyer: {
      name: {
        type: String,
        default: '',
        trim: true,
      },
      contactNumber: {
        type: String,
        default: '',
        trim: true,
      },
      email: {
        type: String,
        default: '',
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Sold'],
      default: 'Pending',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    listedAt: {
      type: Date,
      default: null,
    },
    soldAt: {
      type: Date,
      default: null,
    },
    buyerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResaleTicket', resaleTicketSchema);
