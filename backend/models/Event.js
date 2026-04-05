const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  organizerId: { type: String, default: 'mock_organizer_1' } // For mocked auth
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
