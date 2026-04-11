const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Information
  title: { 
    type: String, 
    required: [true, 'Event title is required'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Event description is required']
  },
  category: { 
    type: String, 
    required: [true, 'Event category is required'],
    enum: ['Sports', 'Music', 'Entertainment', 'Conference', 'Workshop', 'Other'],
    default: 'Other'
  },

  // Event Details
  date: { 
    type: Date, 
    required: [true, 'Event date is required']
  },
  time: { 
    type: String,
    default: '10:00'
  },
  venue: { 
    type: String, 
    required: [true, 'Event venue is required'],
    trim: true
  },
  city: String,
  country: String,

  // Ticketing
  price: { 
    type: Number, 
    required: [true, 'Ticket price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalTickets: { 
    type: Number, 
    required: [true, 'Total tickets is required'],
    min: [1, 'Must have at least 1 ticket']
  },
  availableTickets: { 
    type: Number, 
    required: [true, 'Available tickets is required'],
    min: [0, 'Cannot be negative']
  },

  // Organizer Information
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Organizer is required']
  },
  organizerName: String,
  organizerEmail: String,

  // Images
  imageUrl: { 
    type: String, 
    default: '',
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  },
  images: [String],

  // Status & Approval Workflow
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Live', 'Completed', 'Cancelled'],
    default: 'Pending',
    description: 'Pending=awaiting admin approval, Approved=approved by admin, Live=active, Completed=event finished'
  },
  isApproved: { 
    type: Boolean, 
    default: false,
    description: 'Quick flag for approved events'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: 'Admin who approved the event'
  },
  approvedAt: Date,
  rejectionReason: String,

  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  publishedAt: Date,

  // Data for analytics
  totalBookings: { 
    type: Number, 
    default: 0 
  },
  totalRevenue: { 
    type: Number, 
    default: 0 
  },
  ticketsSold: {
    type: Number,
    default: 0,
    get: function() {
      return this.totalTickets - this.availableTickets;
    }
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes for better query performance
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ isApproved: 1, date: 1 });
eventSchema.index({ createdAt: -1 });

// Pre-save hook to update derived event fields
eventSchema.pre('save', function() {
  this.isApproved = this.status === 'Approved';
  this.updatedAt = new Date();
  
  // Calculate tickets sold
  const soldTickets = this.totalTickets - this.availableTickets;
  if (soldTickets !== this.ticketsSold && !this.isNew) {
    this.totalRevenue = soldTickets * this.price;
  }
});

// Virtual for display status
eventSchema.virtual('displayStatus').get(function() {
  const now = new Date();
  if (this.status === 'Cancelled') return 'Cancelled';
  if (this.status === 'Rejected') return 'Rejected';
  if (this.date < now) return 'Completed';
  if (this.status === 'Pending') return 'Pending Approval';
  if (this.status === 'Approved') return 'Live';
  return this.status;
});

// Method to approve event
eventSchema.methods.approve = function(adminId) {
  this.status = 'Approved';
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject event
eventSchema.methods.reject = function(adminId, reason) {
  this.status = 'Rejected';
  this.isApproved = false;
  this.approvedBy = adminId;
  this.rejectionReason = reason;
  return this.save();
};

// Method to check if organizer owns this event
eventSchema.methods.isOwnedBy = function(userId) {
  return this.organizer.toString() === userId.toString();
};

module.exports = mongoose.model('Event', eventSchema);
