const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Get payouts and aggregate earnings
router.get('/', async (req, res) => {
  try {
    const organizerId = 'mock_organizer_1';

    // Total Earnings calculation (from all bookings)
    const events = await Event.find({ organizerId });
    const eventIds = events.map(e => e._id);
    
    const bookings = await Booking.find({ eventId: { $in: eventIds } });
    const totalEarnings = bookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Get payouts
    const payouts = await Payout.find({ organizerId }).populate('eventId', 'name').sort({ createdAt: -1 });
    
    const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
    const completedPayouts = payouts.filter(p => p.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      totalEarnings,
      pendingPayouts,
      completedPayouts,
      payoutHistory: payouts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request payout
router.post('/request', async (req, res) => {
  try {
    const { eventId, amount } = req.body;
    const payout = new Payout({
      eventId,
      amount,
      organizerId: 'mock_organizer_1'
    });
    await payout.save();
    res.status(201).json(payout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark payout as completed (For Admin/Demo purposes)
router.put('/:id/complete', async (req, res) => {
  try {
    const payout = await Payout.findByIdAndUpdate(
      req.params.id, 
      { status: 'completed', transferredAt: new Date() },
      { new: true }
    );
    res.json(payout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
