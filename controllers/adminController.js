const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');
const ResaleTicket = require('../models/ResaleTicket');

const ADMIN_COMMISSION_RATE = 0.1;

const getBookingAmount = (booking) =>
    Number(booking.totalAmount ?? booking.total ?? booking.totalPrice ?? 0);

const getBookingTickets = (booking) => {
    if (booking.quantity !== undefined) return Number(booking.quantity) || 0;
    if (booking.numTickets !== undefined) return Number(booking.numTickets) || 0;
    if (Array.isArray(booking.seats)) return booking.seats.length;
    return 0;
};

const getBookingEventId = (booking) => {
    if (booking.eventId) return booking.eventId.toString();
    if (booking.event?.id) return booking.event.id.toString();
    if (booking.event?._id) return booking.event._id.toString();
    return null;
};

const getScopedAdminBookings = async () => Booking.find({ status: { $ne: 'Canceled' } }).lean();

const buildEventMetrics = async () => {
    const [events, bookings] = await Promise.all([
        Event.find({})
            .populate('organizer', 'username email name')
            .populate('approvedBy', 'username email name')
            .sort({ createdAt: -1 }),
        getScopedAdminBookings(),
    ]);

    const metricsByEventId = new Map();

    bookings.forEach((booking) => {
        const eventId = getBookingEventId(booking);
        if (!eventId) return;

        const current = metricsByEventId.get(eventId) || { sold: 0, revenue: 0, bookings: [] };
        current.sold += getBookingTickets(booking);
        current.revenue += getBookingAmount(booking);
        current.bookings.push(booking);
        metricsByEventId.set(eventId, current);
    });

    return { events, metricsByEventId, bookings };
};

// Get Dashboard Data (Overview)
exports.getDashboardStats = async (req, res) => {
    try {
        const [{ events, metricsByEventId, bookings }, users] = await Promise.all([
            buildEventMetrics(),
            User.find({ role: { $ne: 'admin' } }).select('_id role isActive isBlocked'),
        ]);

        const totalUsers = users.filter((user) => user.role === 'user').length;
        const activeUsers = users.filter((user) => user.role === 'user' && user.isActive !== false && !user.isBlocked).length;
        const totalOrganizers = users.filter((user) => user.role === 'organizer').length;
        const activeOrganizers = users.filter((user) => user.role === 'organizer' && user.isActive !== false && !user.isBlocked).length;
        const totalEvents = events.length;
        const activeEvents = events.filter((event) => ['Approved', 'Live'].includes(event.status)).length;
        const totalRevenue = bookings.reduce((acc, booking) => acc + getBookingAmount(booking), 0);
        const totalTicketsSold = bookings.reduce((acc, booking) => acc + getBookingTickets(booking), 0);

        const revenueByCategory = events.reduce((acc, event) => {
            const metric = metricsByEventId.get(event._id.toString());
            acc[event.category || 'Other'] = (acc[event.category || 'Other'] || 0) + (metric?.revenue || 0);
            return acc;
        }, {});

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalOrganizers,
                activeOrganizers,
                totalEvents,
                activeEvents,
                totalRevenue,
                totalTicketsSold
            },
            revenueByCategory
        });
    } catch (err) {
        console.error('Error getting dashboard stats:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Events: Get events (all or by status)
exports.getEvents = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        // Filter by status if provided and not 'All'
        if (status && status !== 'All') {
            query.status = status;
        }
        
        const events = await Event
            .find(query)
            .populate('organizer', 'name email username')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });
            
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Events: Approve event
exports.approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, msg: 'Event not found' });
        
        // Use the model's approve method
        await event.approve(req.user.id);

        // Log action
        await new AuditLog({
            admin: req.user.id || req.userId,
            action: 'APPROVE_EVENT',
            targetType: 'Event',
            targetId: event._id,
            details: `Admin approved event: ${event.title}`
        }).save();

        res.json({ 
            success: true,
            msg: 'Event approved successfully', 
            data: event 
        });
    } catch (err) {
        console.error('Error approving event:', err);
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Events: Reject event
exports.rejectEvent = async (req, res) => {
    try {
        const { reason = 'No reason provided' } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, msg: 'Event not found' });
        
        // Use the model's reject method
        await event.reject(req.user.id, reason);

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'REJECT_EVENT',
            targetType: 'Event',
            targetId: event._id,
            details: `Admin rejected event: ${event.title} - Reason: ${reason}`
        }).save();

        res.json({ 
            success: true,
            msg: 'Event rejected successfully', 
            data: event 
        });
    } catch (err) {
        console.error('Error rejecting event:', err);
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Events: Get revenue report for a specific event
exports.getEventRevenueReport = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const bookings = await Booking.find({
            status: { $ne: 'Canceled' },
            $or: [
                { eventId: event._id },
                { 'event.id': event._id.toString() },
                { 'event._id': event._id.toString() }
            ]
        }).populate('userId', 'username email profile').sort({ createdAt: -1 });

        const totalSold = bookings.reduce((sum, booking) => sum + getBookingTickets(booking), 0);
        const totalRevenue = bookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
        const adminCommission = totalRevenue * ADMIN_COMMISSION_RATE;
        const organizerShare = totalRevenue - adminCommission;

        res.json({
            event,
            bookings: bookings.map((booking) => ({
                ...booking.toObject(),
                user: booking.userId ? {
                    name: booking.userId.name || booking.userId.username || 'Unknown',
                    email: booking.userId.email || 'N/A'
                } : null,
                numTickets: getBookingTickets(booking),
                totalPrice: getBookingAmount(booking)
            })),
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
        const { title, description, date, time, venue, city, category, price, totalTickets, imageUrl } = req.body;
        
        // Build update object
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (date) updateData.date = new Date(date);
        if (time !== undefined) updateData.time = time;
        if (venue) updateData.venue = venue;
        if (city !== undefined) updateData.city = city;
        if (category) updateData.category = category;
        if (price !== undefined) updateData.price = Number(price);
        if (totalTickets !== undefined) {
            updateData.totalTickets = Number(totalTickets);
            // Don't change availableTickets if it's already been reduced
        }
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

        const event = await Event.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!event) return res.status(404).json({ success: false, msg: 'Event not found' });
        
        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'UPDATE_EVENT',
            targetType: 'Event',
            targetId: event._id,
            details: `Updated event: ${event.title}`
        }).save();

        res.json({
            success: true,
            msg: 'Event updated successfully',
            data: event
        });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(400).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Events: Delete event (soft cancel or hard delete?)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, msg: 'Event not found' });
        
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

        res.json({ 
            success: true,
            msg: 'Event deleted successfully' 
        });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Events: Create event
exports.createEvent = async (req, res) => {
    const { title, description, date, time, venue, city, category, price, totalTickets, organizerId, imageUrl } = req.body;
    try {
        // Validate required fields
        if (!title || !description || !date || !venue || !category || price === undefined || !totalTickets) {
            return res.status(400).json({ 
                success: false,
                msg: 'Missing required fields: title, description, date, venue, category, price, totalTickets' 
            });
        }

        // Use organizerId if provided, otherwise current admin creates it
        const organizer = organizerId || req.user.id;

        const newEvent = new Event({
            title: title.trim(),
            description,
            date: new Date(date),
            time: time || '10:00',
            venue: venue.trim(),
            city: city?.trim() || '',
            category,
            price: Number(price),
            totalTickets: parseInt(totalTickets, 10),
            availableTickets: parseInt(totalTickets, 10),
            organizer,
            imageUrl: imageUrl || '',
            status: 'Approved', // Admin-created events are automatically approved
            isApproved: true,
            approvedBy: req.user.id || req.userId,
            approvedAt: new Date()
        });
        
        const savedEvent = await newEvent.save();

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'CREATE_EVENT',
            targetType: 'Event',
            targetId: savedEvent._id,
            details: `Admin created event: ${title}`
        }).save();

        res.status(201).json({
            success: true,
            msg: 'Event created successfully',
            data: savedEvent
        });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(400).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Users: Delete User
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
        
        if (user.role === 'admin') {
            return res.status(403).json({ success: false, msg: 'Cannot delete admin accounts' });
        }

        const userEmail = user.email;
        const userName = user.name || user.username;
        
        // Delete user and all associated data
        await User.findByIdAndDelete(req.params.id);

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'DELETE_USER',
            targetType: 'User',
            targetId: user._id,
            details: `Deleted user account: ${userEmail} (${userName})`
        }).save();

        res.json({ 
            success: true,
            msg: 'User account deleted permanently',
            data: { deletedUser: userEmail }
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Users: Block/Unblock User
exports.toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
        
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

        res.json({ 
            success: true,
            msg: `User ${user.isBlocked ? 'Blocked' : 'Unblocked'} successfully`,
            data: user
        });
    } catch (err) {
        console.error('Error toggling user block status:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Users: Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password -otp')
            .sort({ createdAt: -1 })
            .exec();
        
        // Transform users to include computed name field
        const formattedUsers = users.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            roleKey: user.role,
            role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            name: user.profile?.firstName || user.username ? 
                   `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.username 
                   : user.username || 'Unknown User',
            isBlocked: user.isBlocked || false,
            isVerified: user.isVerified || false,
            createdAt: user.createdAt || new Date(),
            profile: user.profile || {},
            isActive: user.isActive !== false
        }));

        res.json({
            success: true,
            count: formattedUsers.length,
            data: formattedUsers
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Audit Logs: Get all
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('admin', 'username email')
            .sort({ createdAt: -1 })
            .limit(100);
        
        res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Revenue Stats: Detailed per-event stats
exports.getRevenueStats = async (req, res) => {
    try {
        const { events, metricsByEventId } = await buildEventMetrics();
        const stats = events.map(event => {
            const metric = metricsByEventId.get(event._id.toString()) || { sold: 0, revenue: 0 };
            return {
                id: event._id,
                title: event.title,
                status: event.status,
                sold: metric.sold,
                revenue: metric.revenue,
                commission: metric.revenue * ADMIN_COMMISSION_RATE
            };
        });
        
        res.json({
            success: true,
            count: stats.length,
            data: stats
        });
    } catch (err) {
        console.error('Error getting revenue stats:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Resales: Get pending resale requests
exports.getPendingResales = async (req, res) => {
    try {
        const resales = await ResaleTicket.find({ status: 'Pending' })
            .populate('userId', 'username email profile')
            .sort({ createdAt: 1 });
        
        res.json({
            success: true,
            count: resales.length,
            data: resales.map((resale) => ({
                _id: resale._id,
                user: {
                    name: resale.userId?.name || resale.userId?.username || 'Unknown User',
                    email: resale.userId?.email || 'N/A'
                },
                event: {
                    title: resale.event?.name || 'Unknown Event',
                    date: resale.event?.date || null,
                    venue: resale.event?.venue || ''
                },
                ticketsCount: Array.isArray(resale.seats) ? resale.seats.length : 0,
                resalePrice: resale.resalePrice || 0,
                createdAt: resale.createdAt
            }))
        });
    } catch (err) {
        console.error('Error fetching pending resales:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Resales: Approve resale request
exports.approveResale = async (req, res) => {
    try {
        const resale = await ResaleTicket.findById(req.params.id);
        if (!resale) return res.status(404).json({ success: false, msg: 'Resale not found' });
        if (resale.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                msg: `Only pending resale requests can be approved. Current status: ${resale.status}`
            });
        }

        resale.status = 'Approved';
        resale.reviewedAt = new Date();
        resale.reviewedBy = req.user.id;
        resale.listedAt = new Date();
        await resale.save();

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'APPROVE_RESALE',
            targetType: 'Booking',
            targetId: resale._id,
            details: `Admin approved resale for ticket ID: ${resale._id}`
        }).save();

        res.json({ 
            success: true,
            msg: 'Resale request approved and listed for buyers',
            data: resale 
        });
    } catch (err) {
        console.error('Error approving resale:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};

// Resales: Reject resale request
exports.rejectResale = async (req, res) => {
    try {
        const resale = await ResaleTicket.findById(req.params.id);
        if (!resale) return res.status(404).json({ success: false, msg: 'Resale not found' });
        if (resale.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                msg: `Only pending resale requests can be rejected. Current status: ${resale.status}`
            });
        }

        resale.status = 'Rejected';
        resale.reviewedAt = new Date();
        resale.reviewedBy = req.user.id;
        await resale.save();

        // Log action
        await new AuditLog({
            admin: req.user.id,
            action: 'REJECT_RESALE',
            targetType: 'Booking',
            targetId: resale._id,
            details: `Admin rejected resale for ticket ID: ${resale._id}`
        }).save();

        res.json({ 
            success: true,
            msg: 'Resale request rejected successfully',
            data: resale 
        });
    } catch (err) {
        console.error('Error rejecting resale:', err);
        res.status(500).json({ 
            success: false,
            msg: err.message 
        });
    }
};
