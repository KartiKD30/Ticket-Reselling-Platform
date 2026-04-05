const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');

// Get all promos
router.get('/', async (req, res) => {
  try {
    const organizerId = 'mock_organizer_1';
    const promos = await PromoCode.find({ organizerId }).populate('eventId', 'name').sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create promo
router.post('/', async (req, res) => {
  try {
    const newPromo = new PromoCode({ ...req.body, organizerId: 'mock_organizer_1' });
    await newPromo.save();
    const populated = await newPromo.populate('eventId', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete promo
router.delete('/:id', async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo code deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
