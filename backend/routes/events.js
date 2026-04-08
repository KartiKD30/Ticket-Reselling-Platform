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
    const body = { ...req.body };

    // Normalize: title must exist; fallback to name for legacy compatibility
    if (!body.title && body.name) body.title = body.name;

    // Cast numeric fields to Number to avoid storing strings in MongoDB
    if (body.price !== undefined)           body.price           = Number(body.price)          || 0;
    if (body.totalTickets !== undefined)    body.totalTickets    = parseInt(body.totalTickets)  || 0;
    if (body.availableTickets !== undefined) body.availableTickets = parseInt(body.availableTickets) || 0;

    console.log('[POST /api/events] Creating event with body:', body);

    const newEvent = new Event(body);
    await newEvent.save();

    console.log('[POST /api/events] Saved event:', newEvent._id, '| status:', newEvent.status);
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('[POST /api/events] Error:', err.message);
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
    const { id } = req.params;
    console.log(`[Senior Log] Updating event ${id}. Incoming Body:`, req.body);
    
    // Explicitly cast numeric fields to ensure they satisfy the schema correctly
    if (req.body.price !== undefined) req.body.price = Number(req.body.price);
    if (req.body.totalTickets !== undefined) req.body.totalTickets = Number(req.body.totalTickets);
    if (req.body.availableTickets !== undefined) req.body.availableTickets = Number(req.body.availableTickets);

    const updatedEvent = await Event.findByIdAndUpdate(id, { $set: req.body }, { 
      new: true, 
      runValidators: true 
    });

    if (!updatedEvent) {
      console.error(`[Senior Log] Event with ID ${id} not found.`);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log(`[Senior Log] Update successful for ${id}. Saved Price: ${updatedEvent.price}`);
    res.json(updatedEvent);
  } catch (err) {
    console.error('[Senior Log] Update error:', err);
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
    newEventData.title = newEventData.title ? newEventData.title + ' (Copy)' : 'Untitled (Copy)';
    
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
