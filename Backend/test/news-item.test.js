const test = require('node:test');
const assert = require('node:assert/strict');
const NewsItem = require('../models/NewsItem');

test('accepts a complete dated news item', () => {
  const item = new NewsItem({
    dateKey: '2026-08-27',
    heading: 'A processor architecture update',
    summary: 'A concise explanation for the homepage.',
    content: 'The complete daily note for the dated reading page.',
    order: 1
  });

  assert.equal(item.validateSync(), undefined);
});

test('rejects malformed dates and missing complete notes', () => {
  const item = new NewsItem({
    dateKey: '27-08-2026',
    heading: 'Invalid item',
    summary: 'Summary only',
    order: 1
  });

  const error = item.validateSync();
  assert.ok(error.errors.dateKey);
  assert.ok(error.errors.content);
});
