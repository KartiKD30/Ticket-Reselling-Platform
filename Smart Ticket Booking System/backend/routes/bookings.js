const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const {
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
} = require('../controllers/bookingController');

router.use(verifyToken);
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/occupied', getBookedSeats);
router.get('/resale/my', getMyResaleTickets);
router.get('/resale/market', getResaleMarketplace);
router.post('/:id/resale', requestResale);
router.post('/resale/:id/buy', buyResaleTicket);
router.delete('/resale/:id', removeResaleTicket);
router.get('/resale/pending', requireAdmin, getPendingResaleTickets);
router.put('/resale/:id/approve', requireAdmin, approveResaleTicket);
router.put('/resale/:id/reject', requireAdmin, rejectResaleTicket);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
