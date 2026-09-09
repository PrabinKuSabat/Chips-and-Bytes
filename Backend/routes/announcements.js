/**
 * @file announcements.js
 * @description
 * Express router for managing announcements.
 * Supports CRUD operations for announcements, with admin authentication for write actions.
 * 
 * Routes:
 *   GET    /api/announcements        - Get all announcements (public)
 *   POST   /api/announcements        - Add new announcement (admin only)
 *   PUT    /api/announcements/:id    - Edit an announcement (admin only)
 *   DELETE /api/announcements/:id    - Delete an announcement (admin only)
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const { preventMutableContentCaching } = require('../services/mutableContentCache');

const clean = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const normalizeAnnouncement = (body = {}) => {
  const message = clean(body.message || body.text, 600);
  const title = clean(body.title, 120);
  const actionLabel = clean(body.actionLabel, 48);
  const actionUrl = clean(body.actionUrl, 2048);
  const category = ['notice', 'event', 'opportunity', 'update'].includes(body.category)
    ? body.category
    : 'notice';

  return {
    title,
    message,
    text: message,
    actionLabel: actionUrl ? actionLabel || 'Learn more' : '',
    actionUrl,
    category,
    isActive: body.isActive !== false
  };
};

// Get all announcements (public)
router.get('/', async (req, res) => {
  preventMutableContentCaching(res);
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new announcement (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const announcement = new Announcement(normalizeAnnouncement(req.body));
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Edit announcement (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      normalizeAnnouncement(req.body),
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Announcement not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
