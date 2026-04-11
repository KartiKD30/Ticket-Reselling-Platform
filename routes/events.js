const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const { verifyToken, auth, adminOnly, requireRole } = require('../middleware/auth');

/**
 * PUBLIC ROUTES (No authentication required)
 */

// GET all APPROVED events (Public/Users)
router.get('/public/approved', async (req, res) => {
  try {
    const { category, search, sortBy = 'date' } = req.query;
    
    // Build query for approved events only
    let query = { status: 'Approved' };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    if (sortBy === 'price-low') sortOptions.price = 1;
    else if (sortBy === 'price-high') sortOptions.price = -1;
    else sortOptions.date = 1;
    
    const events = await Event
      .find(query)
      .populate('organizer', 'username email')
      .sort(sortOptions)
      .limit(50);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single event (Public)
router.get('/public/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'username email');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Only show approved events to public, or admin can see all
    if (event.status !== 'Approved' && !req.user?.role === 'admin') {
      return res.status(403).json({ error: 'Event is not available' });
    }
    
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ORGANIZER ROUTES (Requires organizer role)
 */

// POST - Create event (Organizer only)
router.post('/', verifyToken, requireRole(['organizer']), async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      venue,
      city,
      category,
      price,
      totalTickets,
      availableTickets,
      imageUrl,
      images
    } = req.body;

    // Validation
    if (!title || !description || !date || !venue || !category || price === undefined || !totalTickets) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, date, venue, category, price, totalTickets'
      });
    }

    // Cast numeric fields
    const priceNum = Number(price);
    const totalTicketsNum = parseInt(totalTickets);
    const availableTicketsNum = availableTickets === undefined
      ? totalTicketsNum
      : parseInt(availableTickets);

    if (
      priceNum < 0 ||
      totalTicketsNum < 1 ||
      Number.isNaN(availableTicketsNum) ||
      availableTicketsNum < 0 ||
      availableTicketsNum > totalTicketsNum
    ) {
      return res.status(400).json({ error: 'Invalid price or ticket count' });
    }

    const normalizedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === 'string'
        ? images.split(',').map((entry) => entry.trim()).filter(Boolean)
        : [];
    const primaryImage = imageUrl || normalizedImages[0] || '';

    // Create event with organizer_id from token
    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      time: time || '10:00',
      venue: venue.trim(),
      city: city?.trim() || '',
      category: category.trim(),
      price: priceNum,
      totalTickets: totalTicketsNum,
      availableTickets: availableTicketsNum,
      organizer: req.userId,
      organizerName: req.username,
      imageUrl: primaryImage,
      images: normalizedImages,
      status: 'Pending', // Default to pending for admin approval
      isApproved: false
    });

    const savedEvent = await newEvent.save();
    
    console.log(`✓ Event created: ${savedEvent._id} by organizer ${req.userId}`);
    console.log(`  Title: ${savedEvent.title}`);
    console.log(`  Status: ${savedEvent.status} (Awaiting admin approval)`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully! Awaiting admin approval.',
      data: savedEvent
    });
  } catch (err) {
    console.error('Error creating event:', err.message);
    res.status(400).json({ 
      error: err.message,
      details: 'Failed to create event'
    });
  }
});

// GET - Organizer's own events
router.get('/organizer/my-events', verifyToken, requireRole(['organizer']), async (req, res) => {
  try {
    const events = await Event
      .find({ organizer: req.userId })
      .populate('organizer', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update own event (Organizer only)
router.put('/:id', verifyToken, requireRole(['organizer']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (!event.isOwnedBy(req.userId)) {
      return res.status(403).json({ error: 'You can only edit your own events' });
    }

    // Prevent editing of approved/rejected events
    if (['Approved', 'Rejected', 'Live', 'Completed'].includes(event.status)) {
      return res.status(400).json({ 
        error: `Cannot edit event with status: ${event.status}`
      });
    }

    // Update allowed fields
    const updateFields = ['title', 'description', 'date', 'time', 'venue', 'city', 'category', 'price', 'imageUrl'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    if (req.body.images !== undefined) {
      event.images = Array.isArray(req.body.images)
        ? req.body.images.filter(Boolean)
        : typeof req.body.images === 'string'
          ? req.body.images.split(',').map((entry) => entry.trim()).filter(Boolean)
          : [];

      if (!req.body.imageUrl && event.images.length > 0) {
        event.imageUrl = event.images[0];
      }
    }

    // Update ticket count only if event hasn't started
    if (req.body.totalTickets !== undefined) {
      event.totalTickets = parseInt(req.body.totalTickets);
      if (!event.availableTickets) {
        event.availableTickets = event.totalTickets;
      }
    }

    if (req.body.availableTickets !== undefined) {
      event.availableTickets = parseInt(req.body.availableTickets);
    }

    if (event.availableTickets < 0 || event.availableTickets > event.totalTickets) {
      return res.status(400).json({
        error: 'Available tickets must be between 0 and total tickets'
      });
    }

    const updatedEvent = await event.save();
    
    console.log(`✓ Event updated: ${updatedEvent._id}`);

    res.json({
      success: true,
      message: 'Event updated successfully!',
      data: updatedEvent
    });
  } catch (err) {
    console.error('Error updating event:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE - Delete own event (Organizer only)
router.delete('/:id', verifyToken, requireRole(['organizer']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ownership
    if (!event.isOwnedBy(req.userId)) {
      return res.status(403).json({ error: 'You can only delete your own events' });
    }

    // Check if event has bookings
    const bookingCount = await Booking.countDocuments({ eventId: req.params.id });
    if (bookingCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete event with ${bookingCount} existing booking(s)` 
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Ticket.deleteMany({ eventId: req.params.id });

    console.log(`✓ Event deleted: ${req.params.id}`);

    res.json({ 
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * ADMIN ROUTES (Admin only - Approval workflow)
 */

// GET - All events (Admin view with all statuses)
router.get('/admin/all-events', auth, adminOnly, async (req, res) => {
  try {
    const { status, sortBy = 'createdAt' } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const events = await Event
      .find(query)
      .populate('organizer', 'username email phone')
      .populate('approvedBy', 'username email')
      .sort({ [sortBy]: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Pending events only (for admin approval queue)
router.get('/admin/pending', auth, adminOnly, async (req, res) => {
  try {
    const pendingEvents = await Event
      .find({ status: 'Pending' })
      .populate('organizer', 'username email phone')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: pendingEvents.length,
      data: pendingEvents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Approve event (Admin only)
router.patch('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'Pending') {
      return res.status(400).json({ error: `Event status is ${event.status}, cannot approve` });
    }

    await event.approve(req.user.id);
    
    console.log(`✓ Event approved: ${event._id}`);

    res.json({
      success: true,
      message: 'Event approved successfully!',
      data: event
    });
  } catch (err) {
    console.error('Error approving event:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// PATCH - Reject event (Admin only)
router.patch('/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const { reason = 'No reason provided' } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'Pending') {
      return res.status(400).json({ error: `Event status is ${event.status}, cannot reject` });
    }

    await event.reject(req.user.id, reason);
    
    console.log(`✓ Event rejected: ${event._id}`);

    res.json({
      success: true,
      message: 'Event rejected',
      data: event
    });
  } catch (err) {
    console.error('Error rejecting event:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GENERAL ROUTES
 */

// GET - All approved events (for users)
router.get('/', async (req, res) => {
  try {
    const events = await Event
      .find({ status: 'Approved' })
      .populate('organizer', 'username email')
      .sort({ date: 1 })
      .limit(50);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event
      .findById(req.params.id)
      .populate('organizer', 'username email phone')
      .populate('approvedBy', 'username');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
