const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  category: { type: String, required: true }, // e.g. VIP, Gold, Regular
  price: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  soldQuantity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
