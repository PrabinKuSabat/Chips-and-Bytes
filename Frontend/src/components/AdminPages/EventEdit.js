/**
 * @file EventEdit.js
 * @description
 * Admin page for creating, editing, and deleting events.
 * Allows admins to manage event details such as title, speaker, date, time, location, and description.
 * 
 * Features:
 * - Fetches all events from the backend.
 * - Allows adding new events.
 * - Allows editing and deleting existing events.
 * - Uses JWT token from localStorage for authentication.
 * - Navigates back to the admin dashboard.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EventEdit.css';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/events`;

/**
 * EventEdit Component
 * 
 * Renders a form and list for managing events.
 * 
 * @component
 */
const EventEdit = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  /**
   * Fetch all events from the backend API.
   */
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data || []);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('You are not authorized. Please login.');
      return;
    }
    fetchEvents();
    // eslint-disable-next-line
  }, [token]);

  /**
   * Handle input changes for the event form.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission for adding or updating an event.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert('No token. Please login again.');

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({
        title: '',
        speaker: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });
      setEditingId(null);
      fetchEvents();
    } catch (err) {
      setError('Failed to save event.');
    }
  };

  /**
   * Populate the form for editing an event.
   * @param {Object} event - Event object
   */
  const handleEdit = (event) => {
    setFormData({
      title: event.title || '',
      speaker: event.speaker || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : '',
      time: event.time || '',
      location: event.location || '',
      description: event.description || ''
    });
    setEditingId(event._id);
  };

  /**
   * Delete an event by ID.
   * @param {string} _id - Event ID
   */
  const handleDelete = async (_id) => {
    try {
      await axios.delete(`${API_URL}/${_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (err) {
      setError('Delete failed.');
    }
  };

  const handleArchive = async (event) => {
    if (!window.confirm(`Archive “${event.title}” to Past Events? You can add its report and resources there later.`)) return;

    try {
      await axios.post(`${API_URL}/${event._id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (editingId === event._id) {
        setFormData({ title: '', speaker: '', date: '', time: '', location: '', description: '' });
        setEditingId(null);
      }
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to archive event.');
    }
  };

  return (
    <main className="admin-editor event-edit-page">
      <header className="admin-editor__header">
        <p>Upcoming events</p>
        <h1>{editingId ? 'Update event' : 'Schedule an event'}</h1>
        <span>Add the complete schedule once. The nearest event becomes “Next on the calendar,” while every future event remains visible in Events.</span>
      </header>
      {error && <p className="admin-event-status admin-event-status--error" role="alert">{error}</p>}
      {loading && <p className="admin-event-status" role="status">Loading events…</p>}

      {!loading && !error && (
        <>
          <form className="event-form" onSubmit={handleSubmit}>
            <div className="event-form__grid">
              <label>
                Event title
                <input name="title" placeholder="Think Architecture Together" value={formData.title} onChange={handleChange} required />
              </label>
              <label>
                Speaker
                <input name="speaker" placeholder="Speaker or facilitator" value={formData.speaker} onChange={handleChange} required />
              </label>
              <label>
                Date
                <input name="date" type="date" value={formData.date} onChange={handleChange} required />
              </label>
              <label>
                Time
                <input name="time" type="time" value={formData.time} onChange={handleChange} required />
              </label>
              <label className="event-form__wide-field">
                Venue
                <input name="location" placeholder="Room or online destination" value={formData.location} onChange={handleChange} required />
              </label>
              <label className="event-form__wide-field">
                Description
                <textarea name="description" rows="5" placeholder="What will participants study or build?" value={formData.description} onChange={handleChange} required />
              </label>
            </div>
            <div className="event-form__actions">
              <button type="submit">{editingId ? 'Update event' : 'Schedule event'}</button>
            </div>
          </form>

          <section className="admin-event-list" aria-labelledby="scheduled-events-heading">
            <div className="admin-event-list__heading">
              <h2 id="scheduled-events-heading">Scheduled events</h2>
              <span>{events.length} total</span>
            </div>
            {events.length === 0 ? (
              <p className="admin-event-status">No events have been scheduled.</p>
            ) : (
              <div className="admin-event-grid">
                {events.map(event => (
                  <article className="admin-event-card" key={event._id}>
                    <div className="admin-event-card__header">
                      <span>{new Date(event.date).toISOString().slice(0, 10)}</span>
                      <span>{event.time}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p className="admin-event-card__speaker">{event.speaker} · {event.location}</p>
                    <p className="admin-event-card__description">{event.description}</p>
                    <div className="admin-event-card__actions">
                      <button type="button" onClick={() => handleEdit(event)}>Edit</button>
                      <button type="button" className="admin-event-action--archive" onClick={() => handleArchive(event)}>Archive</button>
                      <button type="button" className="admin-event-action--danger" onClick={() => handleDelete(event._id)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <button
        className="back-to-admin-btn"
        onClick={() => navigate('/admin/dashboard')}
      >
        ← Admin dashboard
      </button>
    </main>
  );
};

export default EventEdit;
