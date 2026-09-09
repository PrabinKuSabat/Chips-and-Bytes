const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { preventMutableContentCaching } = require('../services/mutableContentCache');

test('prevents browsers and shared caches from storing mutable collections', () => {
  const headers = new Map();
  const response = { set: (name, value) => headers.set(name, value) };

  preventMutableContentCaching(response);

  assert.equal(headers.get('Cache-Control'), 'no-store');
});

test('event and announcement reads use the mutable-content cache policy', () => {
  for (const route of ['announcements.js', 'events.js']) {
    const source = readFileSync(resolve(__dirname, '..', 'routes', route), 'utf8');
    assert.match(source, /preventMutableContentCaching\(res\)/);
    assert.doesNotMatch(source, /stale-while-revalidate/);
  }
});
