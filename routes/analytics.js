const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { verifyToken, requireRole } = require('../middleware/auth');

const ANALYTICS_ROLES = ['organizer', 'admin'];

const formatDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getBookingAmount = (booking) =>
  Number(booking.totalAmount ?? booking.total ?? 0);

const getBookingTickets = (booking) => {
  if (booking.quantity !== undefined) return Number(booking.quantity) || 0;
  if (booking.numTickets !== undefined) return Number(booking.numTickets) || 0;
  if (Array.isArray(booking.seats)) return booking.seats.length;
  return 0;
};

const getBookingDate = (booking) =>
  booking.purchaseDate || booking.bookedAt || booking.createdAt;

const getBookingEventId = (booking) => {
  if (booking.eventId) return booking.eventId.toString();
  if (booking.event?.id) return booking.event.id.toString();
  return null;
};

const buildLastSevenDays = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    dates.push(formatDateKey(date));
  }

  return dates;
};

const getScopedEvents = async (req) => {
  if (req.userRole === 'admin') {
    return Event.find({});
  }

  return Event.find({ organizer: req.userId });
};

const getScopedBookings = async (eventIds) => {
  const bookings = await Booking.find({ status: { $ne: 'Canceled' } }).lean();
  return bookings.filter((booking) => eventIds.has(getBookingEventId(booking)));
};

router.use(verifyToken, requireRole(ANALYTICS_ROLES));

// Dashboard overview metrics scoped to the logged-in organizer.
router.get('/overview', async (req, res) => {
  try {
    const events = await getScopedEvents(req);
    const eventIdSet = new Set(events.map((event) => event._id.toString()));
    const bookings = await getScopedBookings(eventIdSet);

    const totalRevenue = bookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
    const totalSeats = events.reduce((sum, event) => sum + (Number(event.totalTickets) || 0), 0);
    const ticketsSold = bookings.reduce((sum, booking) => sum + getBookingTickets(booking), 0);
    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= new Date();
    }).length;

    return res.json({
      totalRevenue,
      ticketsSold,
      totalSeats,
      upcomingEvents,
      sellThroughRate: totalSeats ? (ticketsSold / totalSeats) * 100 : 0,
    });
  } catch (err) {
    console.error('Error getting analytics overview:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Sales trend for the last 7 days.
router.get('/sales-trend', async (req, res) => {
  try {
    const events = await getScopedEvents(req);
    const eventIdSet = new Set(events.map((event) => event._id.toString()));
    const bookings = await getScopedBookings(eventIdSet);

    const trendMap = new Map(
      buildLastSevenDays().map((date) => [date, { _id: date, revenue: 0, tickets: 0 }])
    );

    bookings.forEach((booking) => {
      const dateKey = formatDateKey(getBookingDate(booking));
      if (!dateKey || !trendMap.has(dateKey)) return;

      const day = trendMap.get(dateKey);
      day.revenue += getBookingAmount(booking);
      day.tickets += getBookingTickets(booking);
    });

    return res.json(Array.from(trendMap.values()));
  } catch (err) {
    console.error('Error getting sales trend:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Revenue grouped by booking category for charting.
router.get('/category-breakdown', async (req, res) => {
  try {
    const events = await getScopedEvents(req);
    const eventIdSet = new Set(events.map((event) => event._id.toString()));
    const bookings = await getScopedBookings(eventIdSet);
    const categoryMap = new Map();

    bookings.forEach((booking) => {
      const category = booking.event?.category || 'Other';
      const current = categoryMap.get(category) || { name: category, revenue: 0, tickets: 0 };
      current.revenue += getBookingAmount(booking);
      current.tickets += getBookingTickets(booking);
      categoryMap.set(category, current);
    });

    const breakdown = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
    return res.json(breakdown);
  } catch (err) {
    console.error('Error getting category breakdown:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
