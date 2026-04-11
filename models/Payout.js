const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  organizerId: { type: String, default: 'mock_organizer_1' },
  transferredAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payout', PayoutSchema);
