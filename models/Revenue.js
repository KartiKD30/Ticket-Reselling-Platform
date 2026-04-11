const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for resale commissions
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  transactionType: { type: String, enum: ['TicketSale', 'ResaleCommission', 'Refund'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Revenue', revenueSchema);
