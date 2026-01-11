const express = require('express');
const router = express.Router();
const WasteScan = require('../models/WasteScan');

// POST /api/waste/scan
// Stores a scanned waste item in the database
router.post('/scan', async (req, res, next) => {
  try {
    const { qrCode, itemName, category, impact, userId, weight, unit } = req.body;
    if (!qrCode || !itemName || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scan = new WasteScan({ 
      qrCode, 
      itemName, 
      category, 
      impact, 
      userId,
      weight: weight || 0,
      unit: unit || 'kg'
    });
    await scan.save();
    return res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
});

// GET /api/waste
// Returns all stored waste scan records
router.get('/', async (req, res, next) => {
  try {
    // Optional query param `userId` to return only a user's scans
    const { userId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;

    const scans = await WasteScan.find(filter).sort({ timestamp: -1 });
    return res.json(scans);
  } catch (err) {
    next(err);
  }
});

// GET /api/waste/stats
// Returns aggregated statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Optional filtering by userId
    const { userId } = req.query;
    const match = {};
    if (userId) match.userId = userId;

    const totalScans = await WasteScan.countDocuments(match);

    const categoryAgg = await WasteScan.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryWiseCount = categoryAgg.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    return res.json({ totalScans, categoryWiseCount });
  } catch (err) {
    next(err);
  }
});

// GET /api/waste/analytics
// Returns per-day, per-category counts and weights for the last N days (default 30)
router.get('/analytics', async (req, res, next) => {
  try {
    const { userId, days = 30 } = req.query;
    const daysNum = parseInt(days, 10) || 30;

    const match = {};
    if (userId) match.userId = userId;

    // Calculate start date
    const start = new Date();
    start.setDate(start.getDate() - (daysNum - 1));
    start.setHours(0, 0, 0, 0);

    const agg = await WasteScan.aggregate([
      { $match: { ...match, timestamp: { $gte: start } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            category: '$category'
          },
          count: { $sum: 1 },
          weight: { $sum: '$weight' } // Sum total weight per category per day
        }
      },
      {
        $group: {
          _id: '$_id.date',
          counts: { $push: { category: '$_id.category', count: '$count', weight: '$weight' } },
          total: { $sum: '$count' },
          totalWeight: { $sum: '$weight' } // Total weight for the day
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build a date-indexed object for the last N days
    const result = {};
    for (let i = daysNum - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result[key] = { dry: 0, wet: 0, ewaste: 0, hazardous: 0, dryWeight: 0, wetWeight: 0, ewasteWeight: 0, hazardousWeight: 0, total: 0, totalWeight: 0 };
    }

    agg.forEach(day => {
      const date = day._id;
      const obj = result[date] || { dry: 0, wet: 0, ewaste: 0, hazardous: 0, dryWeight: 0, wetWeight: 0, ewasteWeight: 0, hazardousWeight: 0, total: 0, totalWeight: 0 };
      day.counts.forEach(c => {
        obj[c.category] = c.count;
        obj[c.category + 'Weight'] = c.weight || 0;
      });
      obj.total = day.total || (obj.dry + obj.wet + obj.ewaste + obj.hazardous);
      obj.totalWeight = day.totalWeight || 0;
      result[date] = obj;
    });

    return res.json({ days: daysNum, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
