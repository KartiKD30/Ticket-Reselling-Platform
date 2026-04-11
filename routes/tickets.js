const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Get tickets for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add ticket category
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
