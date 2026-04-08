const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const {
  createSupportTicket,
  getMySupportTickets,
  getPendingSupportTickets,
} = require('../controllers/supportController');

router.use(verifyToken);

router.post('/tickets', createSupportTicket);
router.get('/tickets/my', getMySupportTickets);
router.get('/tickets/pending', requireAdmin, getPendingSupportTickets);

module.exports = router;
