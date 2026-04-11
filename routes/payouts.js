const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { verifyToken, requireRole } = require('../middleware/auth');

const PAYOUT_ROLES = ['organizer', 'admin'];

const getBookingEventId = (booking) => {
  if (booking.eventId) return booking.eventId.toString();
  if (booking.event?.id) return booking.event.id.toString();
  return null;
};

const getBookingAmount = (booking) =>
  Number(booking.totalAmount ?? booking.total ?? 0);

const getScopedEvents = async (req) => {
  if (req.userRole === 'admin') {
    return Event.find({});
  }

  return Event.find({ organizer: req.userId });
};

router.use(verifyToken, requireRole(PAYOUT_ROLES));

// Get payouts and aggregate earnings
router.get('/', async (req, res) => {
  try {
    const events = await getScopedEvents(req);
    const eventIdSet = new Set(events.map((event) => event._id.toString()));
    const organizerId = req.userRole === 'admin' ? null : req.userId;

    const bookings = await Booking.find({ status: { $ne: 'Canceled' } }).lean();
    const scopedBookings = bookings.filter((booking) => eventIdSet.has(getBookingEventId(booking)));
    const totalEarnings = scopedBookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);

    const payoutQuery = organizerId ? { organizerId } : {};
    const payouts = await Payout.find(payoutQuery)
      .populate('eventId', 'title name')
      .sort({ createdAt: -1 });

    const pendingPayouts = payouts
      .filter((payout) => payout.status === 'pending')
      .reduce((sum, payout) => sum + (Number(payout.amount) || 0), 0);
    const completedPayouts = payouts
      .filter((payout) => payout.status === 'completed')
      .reduce((sum, payout) => sum + (Number(payout.amount) || 0), 0);

    res.json({
      totalEarnings,
      pendingPayouts,
      completedPayouts,
      payoutHistory: payouts,
      defaultEventId: events[0]?._id || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request payout
router.post('/request', async (req, res) => {
  try {
    const { eventId, amount } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: 'A valid payout amount is required.' });
    }

    let normalizedEventId;
    if (eventId) {
      const ownedEventQuery = req.userRole === 'admin'
        ? { _id: eventId }
        : { _id: eventId, organizer: req.userId };
      const event = await Event.findOne(ownedEventQuery).select('_id');

      if (!event) {
        return res.status(403).json({ error: 'You can only request payouts for accessible events.' });
      }

      normalizedEventId = event._id;
    }

    const payout = new Payout({
      eventId: normalizedEventId,
      amount: parsedAmount,
      organizerId: req.userId,
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
