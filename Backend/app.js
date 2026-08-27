/**
 * @file app.js
 * @description
 * Main Express application for the Chips & Bytes backend API.
 * Sets up middleware, connects to MongoDB, and registers all API routes.
 * 
 * Features:
 * - Loads environment variables from .env
 * - Connects to MongoDB using Mongoose
 * - Enables CORS and JSON body parsing
 * - Registers routes for events, authentication, announcements, and past events
 * 
 * @module app
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db/mongoose');

const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');
const announcementRoutes = require('./routes/announcements');
const pastEventsRoutes = require('./routes/pastevents');
const blogPreviewRoutes = require('./routes/blogPreviews');
const newsRoutes = require('./routes/news');
const { warmBlogPreviewCache } = require('./services/blogPreviewCache');

const app = express();

// Start connecting at boot. Once Mongo is ready, prewarm the first seven
// articles. This keeps the most visible covers in the persistent cache across
// deployments without delaying the server from accepting requests.
connectDB()
  .then(() => warmBlogPreviewCache({ limit: 7 }))
  .catch(() => {});

app.use(cors());
app.use(bodyParser.json());

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ message: 'Service is temporarily unavailable. Please retry shortly.' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json({ status: 'ready' });
});

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/pastevents', pastEventsRoutes);
app.use('/api/blog-previews', blogPreviewRoutes);
app.use('/api/news', newsRoutes);

module.exports = app;
