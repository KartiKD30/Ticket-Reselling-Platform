const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  email: { type: String, required: true },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', WaitlistSchema);
