const mongoose = require('mongoose');

const ResaleListingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  originalBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  originalPrice: { type: Number, required: true },
  resalePrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'sold', 'flagged'], default: 'pending' },
  sellerId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ResaleListing', ResaleListingSchema);
