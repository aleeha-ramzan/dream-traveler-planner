const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All destination routes require login
router.use(verifyToken);

// GET /api/destinations -> normal users see only THEIR destinations.
// Admins can pass ?all=true to see everyone's destinations (with owner name/email populated).
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.country) filter.country = new RegExp(req.query.country, 'i');

    if (req.query.all === 'true' && req.user.role === 'admin') {
      const destinations = await Destination.find(filter)
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
      return res.json(destinations);
    }

    filter.owner = req.user.id;
    const destinations = await Destination.find(filter).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/destinations/stats -> stats for the logged in user (admins get global stats with ?all=true)
router.get('/stats', async (req, res) => {
  try {
    const filter = (req.query.all === 'true' && req.user.role === 'admin') ? {} : { owner: req.user.id };
    const all = await Destination.find(filter);
    const stats = {
      total: all.length,
      planned: all.filter(d => d.status === 'Planned').length,
      booked: all.filter(d => d.status === 'Booked').length,
      visited: all.filter(d => d.status === 'Visited').length,
      totalBudget: all.reduce((sum, d) => sum + (d.estimatedBudget || 0), 0)
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/destinations/upcoming -> destinations with a target date in the next 30 days (for notifications)
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const upcoming = await Destination.find({
      owner: req.user.id,
      status: { $ne: 'Visited' },
      targetDate: { $gte: now, $lte: in30Days }
    }).sort({ targetDate: 1 });

    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/destinations/:id -> single destination (owner or admin only)
router.get('/:id', async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ error: 'Destination not found' });
    if (dest.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(dest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/destinations -> create new destination, owned by the logged in user
router.post('/', async (req, res) => {
  try {
    const dest = new Destination({ ...req.body, owner: req.user.id });
    const saved = await dest.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/destinations/:id -> update (owner or admin only)
router.put('/:id', async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ error: 'Destination not found' });
    if (dest.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { owner, ...updateData } = req.body; // owner cannot be changed via update
    const updated = await Destination.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/destinations/:id -> (owner or admin only)
router.delete('/:id', async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ error: 'Destination not found' });
    if (dest.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
