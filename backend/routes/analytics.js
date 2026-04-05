const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// Dashboard Overview Metrics
router.get('/overview', async (req, res) => {
  try {
    const organizerId = 'mock_organizer_1';

    const events = await Event.find({ organizerId });
    const eventIds = events.map(e => e._id);

    const tickets = await Ticket.find({ eventId: { $in: eventIds } });
    const totalSeats = tickets.reduce((acc, curr) => acc + curr.totalQuantity, 0);
    const ticketsSold = tickets.reduce((acc, curr) => acc + curr.soldQuantity, 0);

    const bookings = await Booking.find({ eventId: { $in: eventIds } });
    const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const upcomingEvents = events.filter(e => e.status === 'upcoming').length;

    res.json({
      totalRevenue,
      ticketsSold,
      totalSeats,
      upcomingEvents,
      sellThroughRate: totalSeats ? (ticketsSold / totalSeats) * 100 : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Sales Trend (Line chart data)
router.get('/sales-trend', async (req, res) => {
    try {
        const organizerId = 'mock_organizer_1';
        const events = await Event.find({ organizerId });
        const eventIds = events.map(e => e._id);

        const bookings = await Booking.aggregate([
            { $match: { eventId: { $in: eventIds } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
                    revenue: { $sum: "$totalAmount" },
                    tickets: { $sum: "$quantity" }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 7 } // Last 7 days
        ]);

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
