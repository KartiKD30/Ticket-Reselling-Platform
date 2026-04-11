const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');

router.get('/event/:eventId', async (req, res) => {
    try {
        const count = await Waitlist.countDocuments({ eventId: req.params.eventId });
        res.json({ eventId: req.params.eventId, waitlistCount: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const entry = new Waitlist(req.body);
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
