const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { 
    getDashboardStats, 
    getEvents, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    toggleUserBlock, 
    getUsers,
    getAuditLogs,
    getRevenueStats,
    approveEvent,
    rejectEvent,
    getEventRevenueReport,
    getPendingResales,
    approveResale,
    rejectResale
} = require('../controllers/adminController');

// All routes here should be protected and Admin-only
router.use(auth);
router.use(adminOnly);

// Stats & Revenue
router.get('/stats', getDashboardStats);
router.get('/revenue-stats', getRevenueStats);

// Events
router.get('/events', getEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.patch('/events/approve/:id', approveEvent);
router.patch('/events/reject/:id', rejectEvent);
router.get('/events/revenue/:id', getEventRevenueReport);

// Users
router.get('/users', getUsers);
router.patch('/users/block/:id', toggleUserBlock);

// Audit
router.get('/audit-logs', getAuditLogs);

// Resales
router.get('/resales', getPendingResales);
router.patch('/resales/approve/:id', approveResale);
router.patch('/resales/reject/:id', rejectResale);

module.exports = router;
