const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Revenue = require('../models/Revenue');
const AuditLog = require('../models/AuditLog');

// Get Dashboard Data (Overview)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'User' });
        const totalOrganizers = await User.countDocuments({ role: 'Organizer' });
        const totalEvents = await Event.countDocuments({ status: 'Active' });
        
        const revenues = await Revenue.find({});
        const totalRevenue = revenues.reduce((acc, curr) => acc + curr.amount, 0); // Simplified total revenue

        // Group revenue by category for charts
        const events = await Event.find({});
        const revenueByCategory = events.reduce((acc, event) => {
            acc[event.category] = (acc[event.category] || 0) + (event.price * (event.totalSeats - event.availableSeats));
            return acc;
        }, {});

        res.json({
            stats: {
                totalUsers,
                totalOrganizers,
                totalEvents,
                totalRevenue
            },
            revenueByCategory
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Events: Get events (all or by status)
exports.getEvents = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status && status !== 'All' ? { status } : {};
        const events = await Event.find(query).populate('organizer', 'name email');
        res.json(events);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Events: Approve event
exports.approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        
        event.status = 'Approved';
        await event.save();

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'APPROVE_EVENT',
            targetType: 'Event',
            targetId: event._id,
            details: `Admin approved event: ${event.title}`
        }).save();

        res.json({ msg: 'Event approved successfully', event });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Events: Reject event
exports.rejectEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        
        event.status = 'Rejected';
        await event.save();

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'REJECT_EVENT',
            targetType: 'Event',
            targetId: event._id,
            details: `Admin rejected event: ${event.title}`
        }).save();

        res.json({ msg: 'Event rejected successfully', event });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Events: Get revenue report for a specific event
exports.getEventRevenueReport = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        
        // Find bookings for this event (if implemented as separate model)
        const bookings = await Booking.find({ event: event._id }).populate('user', 'name email');
        
        const totalSold = event.totalSeats - event.availableSeats;
        const totalRevenue = totalSold * event.price;
        const adminCommission = totalRevenue * 0.1; // 10% commission example
        const organizerShare = totalRevenue - adminCommission;

        res.json({
            event,
            bookings,
            report: {
                totalSold,
                totalRevenue,
                adminCommission,
                organizerShare,
                pricePerTicket: event.price
            }
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Events: Update event
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        
        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'UPDATE_EVENT',
            targetType: 'Event',
            targetId: event._id,
            details: `Updated event: ${event.title}`
        }).save();

        res.json(event);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Events: Delete event (soft cancel or hard delete?)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        
        const title = event.title;
        await Event.findByIdAndDelete(req.params.id);

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'DELETE_EVENT',
            targetType: 'Event',
            targetId: req.params.id,
            details: `Permanent deletion of event: ${title}`
        }).save();

        res.json({ msg: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Events: Create event
exports.createEvent = async (req, res) => {
    const { title, description, date, venue, category, price, totalSeats, organizerId } = req.body;
    try {
        const newEvent = new Event({
            title, description, date, venue, category, price, totalSeats,
            availableSeats: totalSeats,
            organizer: organizerId || req.user.id
        });
        await newEvent.save();

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'CREATE_EVENT',
            targetType: 'Event',
            targetId: newEvent._id,
            details: `Created new event: ${title}`
        }).save();

        res.json(newEvent);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Users: Block/Unblock User
exports.toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.isBlocked = !user.isBlocked;
        await user.save();

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
            targetType: 'User',
            targetId: user._id,
            details: `${user.isBlocked ? 'Blocked' : 'Unblocked'} user: ${user.email}`
        }).save();

        res.json({ msg: `User ${user.isBlocked ? 'Blocked' : 'Unblocked'} successfully` });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Users: Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'Admin' } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Audit Logs: Get all
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('admin', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Revenue Stats: Detailed per-event stats
exports.getRevenueStats = async (req, res) => {
    try {
        const events = await Event.find({});
        const stats = events.map(event => ({
            id: event._id,
            title: event.title,
            sold: event.totalSeats - event.availableSeats,
            revenue: (event.totalSeats - event.availableSeats) * event.price,
            commission: ((event.totalSeats - event.availableSeats) * event.price) * 0.1 // Simulated 10% commission
        }));
        res.json(stats);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
