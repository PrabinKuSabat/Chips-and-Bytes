/**
 * @file events.js
 * @description
 * Express router for managing events.
 * Supports CRUD operations for events, with admin authentication for write actions.
 * 
 * Routes:
 *   GET    /api/events        - Get all events (public)
 *   POST   /api/events        - Add new event (admin only)
 *   PUT    /api/events/:id    - Edit an event (admin only)
 *   DELETE /api/events/:id    - Delete an event (admin only)
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const { archiveEventById, archiveExpiredEvents } = require('../services/eventLifecycle');
const { preventMutableContentCaching } = require('../services/mutableContentCache');

// GET all events (public)
router.get('/', async (req, res) => {
  preventMutableContentCaching(res);
  try {
    await archiveExpiredEvents();
    const events = await Event.find({}).sort({ date: 1, time: 1 }).lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive a completed event manually when it needs to be removed before its
// scheduled time. Report and resource links remain deliberately blank.
router.post('/:id/archive', auth, async (req, res) => {
  try {
    const archivedEvent = await archiveEventById(req.params.id);
    if (!archivedEvent) return res.status(404).json({ message: 'Event not found' });
    return res.status(201).json(archivedEvent);
  } catch (error) {
    return res.status(400).json({ message: 'Unable to archive event' });
  }
});

// POST new event (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// PUT update event by ID (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// DELETE event by ID (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
