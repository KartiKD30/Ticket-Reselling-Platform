const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  usageLimit: { type: Number, default: null },
  timesUsed: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  organizerId: { type: String, default: 'mock_organizer_1' }
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', PromoCodeSchema);
