import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AnnouncementEdit from './AnnouncementEdit';
import EventEdit from './EventEdit';
import NewsEdit from './NewsEdit';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const axios = require('axios');

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  window.localStorage.setItem('token', 'test-token');
  window.scrollTo = jest.fn();
});

test('updates and deletes announcements locally without a second collection GET', async () => {
  const original = { _id: 'announcement-1', title: 'Original', message: 'Old message', category: 'notice', isActive: true };
  const updated = { ...original, message: 'Updated immediately' };
  axios.get.mockResolvedValue({ data: [original] });
  axios.put.mockResolvedValue({ data: updated });
  axios.delete.mockResolvedValue({ data: { message: 'deleted' } });
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  window.localStorage.setItem('chips-and-bytes:public-resource:announcements', JSON.stringify({ savedAt: Date.now(), value: [original] }));

  render(<AnnouncementEdit />);
  await screen.findByText('Old message');
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Updated immediately' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update announcement' }));

  await screen.findByText('Updated immediately');
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(window.localStorage.getItem('chips-and-bytes:public-resource:announcements')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await screen.findByText('No announcements have been added.');
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test('updates and deletes events locally while invalidating the public schedule', async () => {
  const original = {
    _id: 'event-1', title: 'Cache lab', speaker: 'Club', date: '2026-12-01T00:00:00.000Z',
    time: '15:10', location: 'Lab', description: 'Old description',
  };
  const updated = { ...original, description: 'Updated immediately' };
  axios.get.mockResolvedValue({ data: [original] });
  axios.put.mockResolvedValue({ data: updated });
  axios.delete.mockResolvedValue({ data: { message: 'deleted' } });
  window.localStorage.setItem('chips-and-bytes:public-resource:events', JSON.stringify({ savedAt: Date.now(), value: [original] }));

  render(<EventEdit />);
  await screen.findByText('Old description');
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated immediately' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update event' }));

  await screen.findByText('Updated immediately');
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(window.localStorage.getItem('chips-and-bytes:public-resource:events')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(screen.getByText('No events have been scheduled.')).toBeInTheDocument());
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test('archiving an event invalidates both the upcoming and past-event collections', async () => {
  const original = {
    _id: 'event-1', title: 'Cache lab', speaker: 'Club', date: '2026-12-01T00:00:00.000Z',
    time: '15:10', location: 'Lab', description: 'Description',
  };
  axios.get.mockResolvedValue({ data: [original] });
  axios.post.mockResolvedValue({ data: { _id: 'past-event-1', title: original.title } });
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  window.localStorage.setItem('chips-and-bytes:public-resource:events', JSON.stringify({ savedAt: Date.now(), value: [original] }));
  window.localStorage.setItem('chips-and-bytes:public-resource:past-events', JSON.stringify({ savedAt: Date.now(), value: [] }));

  render(<EventEdit />);
  await screen.findByRole('heading', { name: 'Cache lab' });
  fireEvent.click(screen.getByRole('button', { name: 'Archive' }));

  await waitFor(() => expect(screen.getByText('No events have been scheduled.')).toBeInTheDocument());
  expect(window.localStorage.getItem('chips-and-bytes:public-resource:events')).toBeNull();
  expect(window.localStorage.getItem('chips-and-bytes:public-resource:past-events')).toBeNull();
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test('moves, updates, and deletes news locally without a second collection GET', async () => {
  const original = {
    _id: 'news-1', dateKey: '2026-09-08', heading: 'Original', summary: 'Old summary',
    content: 'Old content', order: 1, createdAt: '2026-09-08T10:00:00.000Z',
  };
  const updated = {
    ...original, dateKey: '2026-09-09', summary: 'Updated immediately', content: '**Updated**',
  };
  axios.get.mockResolvedValue({ data: [original] });
  axios.put.mockResolvedValue({ data: updated });
  axios.delete.mockResolvedValue({ data: { message: 'deleted' } });
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  for (const cacheKey of ['news-2026-09-08', 'news-edition-2026-09-08', 'news-2026-09-09', 'news-edition-2026-09-09', 'news-archive']) {
    window.localStorage.setItem(`chips-and-bytes:public-resource:${cacheKey}`, JSON.stringify({ savedAt: Date.now(), value: [original] }));
  }

  render(<NewsEdit />);
  await screen.findByText('Old summary');
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Edition date'), { target: { value: '2026-09-09' } });
  fireEvent.change(screen.getByLabelText('Short description'), { target: { value: 'Updated immediately' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update item' }));

  await screen.findByText('Updated immediately');
  expect(axios.get).toHaveBeenCalledTimes(1);
  for (const cacheKey of ['news-2026-09-08', 'news-edition-2026-09-08', 'news-2026-09-09', 'news-edition-2026-09-09', 'news-archive']) {
    expect(window.localStorage.getItem(`chips-and-bytes:public-resource:${cacheKey}`)).toBeNull();
  }

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await screen.findByText('No news items have been added.');
  expect(axios.get).toHaveBeenCalledTimes(1);
});
