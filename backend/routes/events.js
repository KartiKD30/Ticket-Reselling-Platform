const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await Ticket.deleteMany({ eventId: req.params.id });
    await Booking.deleteMany({ eventId: req.params.id });
    res.json({ message: 'Event and related data deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicate event
router.post('/:id/duplicate', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const newEventData = event.toObject();
    delete newEventData._id;
    delete newEventData.createdAt;
    delete newEventData.updatedAt;
    newEventData.name = newEventData.name + ' (Copy)';
    
    const newEvent = new Event(newEventData);
    await newEvent.save();
    
    // optionally duplicate tickets too?
    const tickets = await Ticket.find({ eventId: req.params.id });
    for(let t of tickets) {
      const newTicketData = t.toObject();
      delete newTicketData._id;
      newTicketData.eventId = newEvent._id;
      newTicketData.soldQuantity = 0; // reset sales
      await Ticket.create(newTicketData);
    }

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
