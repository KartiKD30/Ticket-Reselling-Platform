const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String }, // Keep for compatibility with old schema
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  venue: { type: String, required: true },
  price: { type: Number, default: 0 },
  category: { type: String },
  images: [{ type: String }],
  createdBy: { type: String, default: 'mock_organizer_1' },
  totalTickets: { type: Number, default: 0 },
  availableTickets: { type: Number, default: 0 },
  source: { type: String, enum: ['organizer', 'system'], default: 'organizer' },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' }
}, { timestamps: true });

/**
 * Pre-save hook: auto-compute status from date & normalize legacy name → title
 */
EventSchema.pre('save', function () {
  // Normalize: if title is missing but name exists (legacy), copy name → title
  if (!this.title && this.name) {
    this.title = this.name;
  }
  // Auto-calculate status based on event date (unless manually set to 'cancelled')
  if (this.status !== 'cancelled' && this.date) {
    const now = new Date();
    const eventDate = new Date(this.date);
    const diffHours = (eventDate - now) / (1000 * 60 * 60);
    if (diffHours > 3) {
      this.status = 'upcoming';
    } else if (diffHours >= -6) {
      this.status = 'ongoing';
    } else {
      this.status = 'completed';
    }
  }
});

/**
 * Pre-findOneAndUpdate hook: auto-compute status on updates too
 */
EventSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  const body = update.$set || update;
  if (body.status !== 'cancelled' && body.date) {
    const now = new Date();
    const eventDate = new Date(body.date);
    const diffHours = (eventDate - now) / (1000 * 60 * 60);
    if (diffHours > 3) {
      body.status = 'upcoming';
    } else if (diffHours >= -6) {
      body.status = 'ongoing';
    } else {
      body.status = 'completed';
    }
    if (update.$set) update.$set.status = body.status;
  }
});

module.exports = mongoose.model('Event', EventSchema);
