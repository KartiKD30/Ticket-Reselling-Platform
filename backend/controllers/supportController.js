const SupportTicket = require('../models/SupportTicket');

const createSupportTicket = async (req, res) => {
  try {
    const { subject, category, message, bookingId } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const ticket = new SupportTicket({
      userId: req.userId,
      subject,
      category: category || 'Other',
      message,
      bookingId: bookingId || '',
      status: 'Pending',
    });

    await ticket.save();

    const ticketObj = ticket.toObject({ virtuals: true });
    ticketObj.id = ticket._id.toString();

    return res.status(201).json({
      message: 'Support ticket raised successfully. Waiting for admin team.',
      ticket: ticketObj,
    });
  } catch (error) {
    console.error('Creating support ticket failed:', error.message);
    return res.status(500).json({ error: 'Failed to raise support ticket' });
  }
};

const getMySupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.userId }).sort({ createdAt: -1 });

    const list = tickets.map((ticket) => {
      const ticketObj = ticket.toObject({ virtuals: true });
      ticketObj.id = ticket._id.toString();
      return ticketObj;
    });

    return res.json({ tickets: list });
  } catch (error) {
    console.error('Fetching user support tickets failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
};

const getPendingSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ status: 'Pending' })
      .sort({ createdAt: 1 })
      .populate('userId', 'username email');

    const list = tickets.map((ticket) => {
      const ticketObj = ticket.toObject({ virtuals: true });
      ticketObj.id = ticket._id.toString();
      return ticketObj;
    });

    return res.json({ tickets: list });
  } catch (error) {
    console.error('Fetching pending support tickets failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch pending tickets' });
  }
};

module.exports = {
  createSupportTicket,
  getMySupportTickets,
  getPendingSupportTickets,
};
