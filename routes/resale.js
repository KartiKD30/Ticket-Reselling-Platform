const express = require('express');
const router = express.Router();
const ResaleListing = require('../models/ResaleListing');

// Get all resale listings (organizer view doesn't care about seller just event)
router.get('/', async (req, res) => {
  try {
    const listings = await ResaleListing.find().populate('eventId', 'name');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create listing (with 130% cap validation)
router.post('/', async (req, res) => {
  try {
    const { originalPrice, resalePrice } = req.body;
    const maxCap = originalPrice * 1.30;
    
    // Automatic flagging if price goes above 130%
    const status = resalePrice > maxCap ? 'flagged' : 'pending';

    const newListing = new ResaleListing({
      ...req.body,
      status
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update listing status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await ResaleListing.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
