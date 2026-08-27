/**
 * @file news.js
 * @description Public dated news reads and authenticated admin CRUD.
 */

const express = require('express');
const auth = require('../middleware/auth');
const NewsItem = require('../models/NewsItem');

const router = express.Router();

const setPublicCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
};

const setPrivateHeaders = (res) => {
  res.set('Cache-Control', 'private, no-store');
};

const normalizeNewsItem = (body = {}) => ({
  dateKey: typeof body.dateKey === 'string' ? body.dateKey.trim() : '',
  heading: typeof body.heading === 'string' ? body.heading.trim() : '',
  summary: typeof body.summary === 'string' ? body.summary.trim() : '',
  content: typeof body.content === 'string' ? body.content.trim() : '',
  order: Number.isInteger(Number(body.order)) ? Number(body.order) : 1
});

const hasValidNewsItem = (item) => (
  NewsItem.isValidDateKey(item.dateKey)
  && item.heading.length > 0
  && item.summary.length > 0
  && item.content.length > 0
  && item.order >= 1
);

// Archive summaries, newest edition first. Full notes are intentionally omitted.
router.get('/', async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 500) : 250;
    const items = await NewsItem.find({})
      .select('dateKey heading summary order createdAt updatedAt')
      .sort({ dateKey: -1, order: 1, createdAt: 1 })
      .limit(limit)
      .lean();

    setPublicCacheHeaders(res);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load news.' });
  }
});

// The admin editor needs complete notes and must never be stored by shared caches.
router.get('/admin', auth, async (req, res) => {
  try {
    const items = await NewsItem.find({})
      .sort({ dateKey: -1, order: 1, createdAt: 1 })
      .limit(500)
      .lean();

    setPrivateHeaders(res);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load news for editing.' });
  }
});

// Complete daily edition used by both the homepage and the dated reading page.
router.get('/date/:dateKey', async (req, res) => {
  if (!NewsItem.isValidDateKey(req.params.dateKey)) {
    return res.status(400).json({ message: 'Use a date in YYYY-MM-DD format.' });
  }

  try {
    const items = await NewsItem.find({ dateKey: req.params.dateKey })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    setPublicCacheHeaders(res);
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load this news edition.' });
  }
});

router.post('/', auth, async (req, res) => {
  const item = normalizeNewsItem(req.body);
  if (!hasValidNewsItem(item)) {
    return res.status(400).json({ message: 'Date, heading, summary, full note, and a positive order are required.' });
  }

  try {
    const created = await NewsItem.create(item);
    setPrivateHeaders(res);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid news item.' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const item = normalizeNewsItem(req.body);
  if (!hasValidNewsItem(item)) {
    return res.status(400).json({ message: 'Date, heading, summary, full note, and a positive order are required.' });
  }

  try {
    const updated = await NewsItem.findByIdAndUpdate(req.params.id, item, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'News item not found.' });
    setPrivateHeaders(res);
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid news item.' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await NewsItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'News item not found.' });
    setPrivateHeaders(res);
    return res.json({ message: 'News item deleted.' });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid news item identifier.' });
  }
});

module.exports = router;
