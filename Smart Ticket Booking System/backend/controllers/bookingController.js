const Booking = require('../models/Booking');
const ResaleTicket = require('../models/ResaleTicket');
const { addWalletTransaction } = require('./authController');

const parseShowDateTime = (date, time) => {
  if (!date || !time) return null;
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const fallback = new Date(`${date} ${time}`);
    return isNaN(fallback) ? null : fallback;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
};

const canCancelBooking = (booking) => {
  const scheduled = parseShowDateTime(booking.date, booking.time);
  if (!scheduled) return false;
  const diff = scheduled.getTime() - Date.now();
  return diff > 1000 * 60 * 60;
};

const autoCompletePassedBookings = async (userId = null) => {
  try {
    const query = { status: 'Confirmed' };
    if (userId) {
      query.userId = userId;
    }

    const confirmedBookings = await Booking.find(query).select('_id date time');
    if (!confirmedBookings.length) {
      return 0;
    }

    const now = Date.now();
    const bookingIdsToComplete = confirmedBookings
      .filter((booking) => {
        const showDate = parseShowDateTime(booking.date, booking.time);
        return showDate && showDate.getTime() <= now;
      })
      .map((booking) => booking._id);

    if (!bookingIdsToComplete.length) {
      return 0;
    }

    const updateResult = await Booking.updateMany(
      { _id: { $in: bookingIdsToComplete }, status: 'Confirmed' },
      { $set: { status: 'Completed' } }
    );

    return updateResult.modifiedCount || 0;
  } catch (error) {
    console.error('Auto-completing bookings failed:', error.message);
    return 0;
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      event,
      seats,
      total,
      date,
      time,
      method,
      transactionId,
      receiptId,
      status,
      discountApplied = 0,
      discountDescription = '',
      walletDeducted = 0,
    } = req.body;

    if (!event || !event.id || !Array.isArray(seats) || seats.length === 0 || !total || !date || !time || !method) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const existingBookings = await Booking.find({
      'event.id': event.id,
      date,
      time,
      seats: { $in: seats },
      status: { $in: ['Confirmed', 'Completed'] },
    }).select('seats');

    if (existingBookings.length > 0) {
      const conflictSeats = Array.from(
        new Set(existingBookings.flatMap((booking) => booking.seats))
      );
      return res.status(409).json({
        error: 'One or more seats are already booked for this time slot.',
        conflictSeats,
      });
    }

    const booking = new Booking({
      userId: req.userId,
      event,
      date,
      seats,
      total,
      time,
      method,
      transactionId,
      receiptId,
      status: status || 'Confirmed',
      discountApplied: Number(discountApplied) || 0,
      discountDescription,
      walletDeducted: Number(walletDeducted) || 0,
    });

    await booking.save();

    // Add discount to wallet if discount was applied
    if (Number(discountApplied) > 0) {
      try {
        const transactionDesc = discountDescription 
          ? `${discountDescription} - ${event.name || 'event'} booking`
          : `Discount credited from ${event.name || 'event'} booking`;
        
        await addWalletTransaction(
          req.userId,
          Number(discountApplied),
          'credit',
          transactionDesc,
          booking._id
        );
      } catch (walletError) {
        console.error('Failed to add discount to wallet:', walletError.message);
        // Don't fail the booking if wallet update fails
      }
    }

    // Deduct wallet if wallet was used
    if (Number(walletDeducted) > 0) {
      try {
        await addWalletTransaction(
          req.userId,
          Number(walletDeducted),
          'debit',
          `Wallet used for ${event.name || 'event'} booking`,
          booking._id
        );
      } catch (walletError) {
        console.error('Failed to deduct from wallet:', walletError.message);
        // Don't fail the booking if wallet update fails
      }
    }

    const bookingObj = booking.toObject({ virtuals: true });
    bookingObj.id = booking._id.toString();

    res.status(201).json({ message: 'Booking created successfully', booking: bookingObj });
  } catch (error) {
    console.error('Booking creation failed:', error.message);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const getBookings = async (req, res) => {
  try {
    await autoCompletePassedBookings(req.userId);

    const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
    const bookingList = bookings.map((booking) => {
      const obj = booking.toObject({ virtuals: true });
      obj.id = obj._id.toString();
      return obj;
    });
    res.json({ bookings: bookingList });
  } catch (error) {
    console.error('Fetching bookings failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getBookingById = async (req, res) => {
  try {
    await autoCompletePassedBookings(req.userId);

    const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const bookingObj = booking.toObject({ virtuals: true });
    bookingObj.id = booking._id.toString();
    res.json({ booking: bookingObj });
  } catch (error) {
    console.error('Fetching booking failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

const getBookedSeats = async (req, res) => {
  try {
    const eventId = req.query.eventId || req.body.eventId;
    const date = req.query.date || req.body.date;
    const time = req.query.time || req.body.time;

    if (!eventId || !date || !time) {
      return res.status(400).json({ error: 'eventId, date and time are required' });
    }

    const occupied = await Booking.find({
      'event.id': Number(eventId),
      date,
      time,
      status: { $in: ['Confirmed', 'Completed'] },
    }).select('seats -_id');

    const occupiedSeats = Array.from(
      new Set(occupied.flatMap((booking) => booking.seats))
    );

    res.json({ seats: occupiedSeats });
  } catch (error) {
    console.error('Fetching occupied seats failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch occupied seats' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    await autoCompletePassedBookings(req.userId);

    const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be canceled' });
    }

    if (!canCancelBooking(booking)) {
      return res.status(400).json({ error: 'Cancellation is only allowed at least one hour before the show' });
    }

    booking.status = 'Canceled';
    await booking.save();

    const bookingObj = booking.toObject({ virtuals: true });
    bookingObj.id = booking._id.toString();

    res.json({ message: 'Booking canceled successfully', booking: bookingObj });
  } catch (error) {
    console.error('Canceling booking failed:', error.message);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

const requestResale = async (req, res) => {
  try {
    const { resalePrice, resaleBuyerName, resaleBuyerContact, resaleBuyerEmail } = req.body;
    const bookingId = req.params.id;

    if (!resalePrice || Number(resalePrice) <= 0) {
      return res.status(400).json({ error: 'A valid resale price is required' });
    }

    const buyerName = String(resaleBuyerName || '').trim();
    const buyerContact = String(resaleBuyerContact || '').trim();
    const buyerEmail = String(resaleBuyerEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const contactRegex = /^[0-9+\-\s()]{7,20}$/;

    if (!buyerName || !buyerContact || !buyerEmail) {
      return res.status(400).json({ error: 'Buyer name, contact number, and email are required' });
    }

    if (!emailRegex.test(buyerEmail)) {
      return res.status(400).json({ error: 'Please enter a valid buyer email' });
    }

    if (!contactRegex.test(buyerContact)) {
      return res.status(400).json({ error: 'Please enter a valid buyer contact number' });
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be listed for resale' });
    }

    const existing = await ResaleTicket.findOne({
      bookingId,
      status: { $in: ['Pending', 'Approved'] },
    });

    if (existing) {
      return res.status(409).json({ error: 'This ticket is already in resale approval flow' });
    }

    if (!booking.wasResaleListed) {
      booking.wasResaleListed = true;
      await booking.save();
    }

    const resale = new ResaleTicket({
      userId: req.userId,
      bookingId,
      event: {
        name: booking.event?.name || 'Event',
        city: booking.event?.city || '',
        venue: booking.event?.venue || booking.event?.city || '',
        date: booking.date,
        time: booking.time,
      },
      seats: booking.seats || [],
      originalPrice: booking.total || 0,
      receiptId: booking.receiptId || '',
      resalePrice: Number(resalePrice),
      resaleBuyer: {
        name: buyerName,
        contactNumber: buyerContact,
        email: buyerEmail,
      },
      status: 'Pending',
    });

    await resale.save();

    const resaleObj = resale.toObject({ virtuals: true });
    resaleObj.id = resale._id.toString();
    resaleObj.bookingId = resale.bookingId.toString();

    return res.status(201).json({
      message: 'Resale request submitted for admin approval',
      resale: resaleObj,
    });
  } catch (error) {
    console.error('Resale request failed:', error.message);
    return res.status(500).json({ error: 'Failed to submit resale request' });
  }
};

const getMyResaleTickets = async (req, res) => {
  try {
    const resaleTickets = await ResaleTicket.find({ userId: req.userId }).sort({ createdAt: -1 });
    const list = resaleTickets.map((item) => {
      const obj = item.toObject({ virtuals: true });
      obj.id = item._id.toString();
      obj.bookingId = item.bookingId.toString();
      return obj;
    });

    return res.json({ resaleTickets: list });
  } catch (error) {
    console.error('Fetching resale tickets failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch resale tickets' });
  }
};

const getResaleMarketplace = async (req, res) => {
  try {
    const listings = await ResaleTicket.find({
      status: 'Approved',
      userId: { $ne: req.userId },
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    const list = listings.map((item) => {
      const obj = item.toObject({ virtuals: true });
      obj.id = item._id.toString();
      obj.bookingId = item.bookingId.toString();
      return obj;
    });

    return res.json({ resaleTickets: list });
  } catch (error) {
    console.error('Fetching resale marketplace failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch resale marketplace' });
  }
};

const buyResaleTicket = async (req, res) => {
  try {
    const { method, transactionId } = req.body;
    const resale = await ResaleTicket.findById(req.params.id);

    if (!resale) {
      return res.status(404).json({ error: 'Resale ticket not found' });
    }

    if (resale.status !== 'Approved') {
      return res.status(400).json({ error: 'Only approved resale tickets can be purchased' });
    }

    if (resale.userId.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'You cannot buy your own resale ticket' });
    }

    if (!method) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    const sellerBooking = await Booking.findById(resale.bookingId);
    if (!sellerBooking) {
      return res.status(404).json({ error: 'Original booking not found for this resale ticket' });
    }

    if (sellerBooking.status !== 'Confirmed') {
      return res.status(400).json({ error: 'This resale ticket is no longer valid' });
    }

    const buyerBooking = new Booking({
      userId: req.userId,
      event: sellerBooking.event,
      seats: sellerBooking.seats,
      total: resale.resalePrice,
      date: sellerBooking.date,
      time: sellerBooking.time,
      method,
      transactionId,
      status: 'Confirmed',
    });

    await buyerBooking.save();

    // Cancel seller booking after successful transfer.
    sellerBooking.status = 'Canceled';
    await sellerBooking.save();

    resale.status = 'Sold';
    resale.reviewedAt = new Date();
    resale.reviewedBy = req.userId;
    await resale.save();

    const bookingObj = buyerBooking.toObject({ virtuals: true });
    bookingObj.id = buyerBooking._id.toString();

    const resaleObj = resale.toObject({ virtuals: true });
    resaleObj.id = resale._id.toString();
    resaleObj.bookingId = resale.bookingId.toString();

    return res.status(201).json({
      message: 'Resale ticket purchased successfully',
      booking: bookingObj,
      resale: resaleObj,
    });
  } catch (error) {
    console.error('Buying resale ticket failed:', error.message);
    return res.status(500).json({ error: 'Failed to buy resale ticket' });
  }
};

const removeResaleTicket = async (req, res) => {
  try {
    const resale = await ResaleTicket.findOne({ _id: req.params.id, userId: req.userId });
    if (!resale) {
      return res.status(404).json({ error: 'Resale ticket not found' });
    }

    await ResaleTicket.deleteOne({ _id: resale._id });
    return res.json({ message: 'Resale ticket removed successfully' });
  } catch (error) {
    console.error('Removing resale ticket failed:', error.message);
    return res.status(500).json({ error: 'Failed to remove resale ticket' });
  }
};

const getPendingResaleTickets = async (req, res) => {
  try {
    const pending = await ResaleTicket.find({ status: 'Pending' })
      .sort({ createdAt: 1 })
      .populate('userId', 'username email');

    const list = pending.map((item) => {
      const obj = item.toObject({ virtuals: true });
      obj.id = item._id.toString();
      obj.bookingId = item.bookingId.toString();
      return obj;
    });

    return res.json({ resaleTickets: list });
  } catch (error) {
    console.error('Fetching pending resale tickets failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch pending resale tickets' });
  }
};

const approveResaleTicket = async (req, res) => {
  try {
    const resale = await ResaleTicket.findById(req.params.id);
    if (!resale) {
      return res.status(404).json({ error: 'Resale ticket not found' });
    }

    resale.status = 'Approved';
    resale.reviewedAt = new Date();
    resale.reviewedBy = req.userId;
    await resale.save();

    const resaleObj = resale.toObject({ virtuals: true });
    resaleObj.id = resale._id.toString();
    resaleObj.bookingId = resale.bookingId.toString();

    return res.json({ message: 'Resale ticket approved', resale: resaleObj });
  } catch (error) {
    console.error('Approving resale ticket failed:', error.message);
    return res.status(500).json({ error: 'Failed to approve resale ticket' });
  }
};

const rejectResaleTicket = async (req, res) => {
  try {
    const resale = await ResaleTicket.findById(req.params.id);
    if (!resale) {
      return res.status(404).json({ error: 'Resale ticket not found' });
    }

    resale.status = 'Rejected';
    resale.reviewedAt = new Date();
    resale.reviewedBy = req.userId;
    await resale.save();

    const resaleObj = resale.toObject({ virtuals: true });
    resaleObj.id = resale._id.toString();
    resaleObj.bookingId = resale.bookingId.toString();

    return res.json({ message: 'Resale ticket rejected', resale: resaleObj });
  } catch (error) {
    console.error('Rejecting resale ticket failed:', error.message);
    return res.status(500).json({ error: 'Failed to reject resale ticket' });
  }
};

module.exports = {
  autoCompletePassedBookings,
  createBooking,
  getBookings,
  getBookingById,
  getBookedSeats,
  cancelBooking,
  requestResale,
  getMyResaleTickets,
  getResaleMarketplace,
  buyResaleTicket,
  removeResaleTicket,
  getPendingResaleTickets,
  approveResaleTicket,
  rejectResaleTicket,
};
