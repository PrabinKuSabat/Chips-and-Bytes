import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { publicContentFallback } from '../data/publicContentFallback';
import { invalidatePublicResource, usePublicResource } from './usePublicResource';

const Harness = ({ refreshInterval = 0 }) => {
  const { data } = usePublicResource({ cacheKey: 'events', url: '/api/events', refreshInterval });
  return <div>{data.map((item) => item.title).join(', ')}</div>;
};

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ _id: 'fresh', title: 'Fresh event' }],
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('ships no hard-coded public announcement', () => {
  expect(publicContentFallback.announcements).toEqual([]);
});

test('invalidating a mutable public resource clears storage and triggers a no-store refresh', async () => {
  window.localStorage.setItem('chips-and-bytes:public-resource:events', JSON.stringify({
    savedAt: Date.now(),
    value: [{ _id: 'stale', title: 'Deleted event' }],
  }));

  render(<Harness />);
  expect(screen.getByText('Deleted event')).toBeInTheDocument();

  await act(async () => invalidatePublicResource('events'));

  await waitFor(() => expect(screen.getByText('Fresh event')).toBeInTheDocument());
  expect(window.localStorage.getItem('chips-and-bytes:public-resource:events')).not.toContain('Deleted event');
  expect(global.fetch).toHaveBeenCalledWith('/api/events', expect.objectContaining({ cache: 'no-store' }));
});

test('refreshes when another tab removes the shared cache entry', async () => {
  render(<Harness />);
  await screen.findByText('Fresh event');
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [{ _id: 'cross-tab', title: 'Cross-tab event' }],
  });

  window.dispatchEvent(new StorageEvent('storage', {
    key: 'chips-and-bytes:public-resource:events',
    newValue: null,
  }));

  await screen.findByText('Cross-tab event');
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('uses a bounded refresh interval for cross-device changes', async () => {
  jest.useFakeTimers();
  render(<Harness refreshInterval={60000} />);
  await act(async () => Promise.resolve());
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [{ _id: 'remote', title: 'Remote event' }],
  });

  await act(async () => {
    jest.advanceTimersByTime(60000);
    await Promise.resolve();
  });

  expect(screen.getByText('Remote event')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
