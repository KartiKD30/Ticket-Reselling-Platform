const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');
const { verifyToken, requireRole } = require('../middleware/auth');

const buildActivePromoQuery = (eventId) => {
  const query = {
    expiryDate: { $gte: new Date() }
  };

  if (eventId) {
    query.eventId = eventId;
  }

  return query;
};

// Get all promos
router.get('/', verifyToken, requireRole(['organizer']), async (req, res) => {
  try {
    const promos = await PromoCode.find({ organizerId: req.userId }).populate('eventId', 'title name').sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    const promos = await PromoCode.find(buildActivePromoQuery(req.query.eventId))
      .populate('eventId', 'title name')
      .sort({ createdAt: -1 });

    const availablePromos = promos.filter((promo) => (
      promo.usageLimit == null || promo.timesUsed < promo.usageLimit
    ));

    res.json({
      success: true,
      data: availablePromos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create promo
router.post('/', verifyToken, requireRole(['organizer']), async (req, res) => {
  try {
    const newPromo = new PromoCode({ ...req.body, organizerId: req.userId });
    await newPromo.save();
    const populated = await newPromo.populate('eventId', 'title name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete promo
router.delete('/:id', verifyToken, requireRole(['organizer']), async (req, res) => {
  try {
    const deletedPromo = await PromoCode.findOneAndDelete({
      _id: req.params.id,
      organizerId: req.userId
    });

    if (!deletedPromo) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json({ message: 'Promo code deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
