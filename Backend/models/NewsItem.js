/**
 * @file NewsItem.js
 * @description Stores one ordered item within a dated Chips & Bytes news edition.
 */

const mongoose = require('mongoose');

const isValidDateKey = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};

const newsItemSchema = new mongoose.Schema({
  dateKey: {
    type: String,
    required: true,
    validate: {
      validator: isValidDateKey,
      message: 'dateKey must be a real date in YYYY-MM-DD format'
    },
    trim: true
  },
  heading: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 600
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20000
  },
  order: {
    type: Number,
    min: 1,
    default: 1
  }
}, { timestamps: true });

newsItemSchema.index({ dateKey: -1, order: 1, createdAt: 1 });
newsItemSchema.statics.isValidDateKey = isValidDateKey;

module.exports = mongoose.model('NewsItem', newsItemSchema);
