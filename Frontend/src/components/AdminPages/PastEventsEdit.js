/**
 * @file PastEventsEdit.js
 * @description
 * Admin page for creating, editing, and deleting past events.
 * Allows admins to manage past event details such as date, title, report link, and resources link.
 * 
 * Features:
 * - Fetches all past events from the backend.
 * - Allows adding new past events.
 * - Allows editing and deleting existing past events.
 * - Uses JWT token from localStorage for authentication.
 * - Navigates back to the admin dashboard.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import './PastEventsEdit.css';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/pastevents`;

/**
 * PastEventsEdit Component
 * 
 * Renders a form and table for managing past events.
 * 
 * @component
 */
const PastEventsEdit = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    reportLink: '',
    resourcesLink: ''
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  /**
   * Fetch all past events from the backend API.
   */
  const fetchEvents = async () => {
    const res = await axios.get(API_URL);
    setEvents(res.data || []);
  };

  useEffect(() => { fetchEvents(); }, []);

  /**
   * Handle input changes for the past event form.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission for adding or updating a past event.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, formData, config);
    } else {
      await axios.post(API_URL, formData, config);
    }
    setFormData({ date: '', title: '', reportLink: '', resourcesLink: '' });
    setEditingId(null);
    fetchEvents();
  };

  /**
   * Populate the form for editing a past event.
   * @param {Object} event - Past event object
   */
  const handleEdit = (event) => {
    setFormData({
      date: event.date || '',
      title: event.title || '',
      reportLink: event.reportLink || '',
      resourcesLink: event.resourcesLink || ''
    });
    setEditingId(event._id);
  };

  /**
   * Delete a past event by ID.
   * @param {string} id - Event ID
   */
  const handleDelete = async (id) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`${API_URL}/${id}`, config);
    fetchEvents();
  };

  return (
    <main className="admin-editor past-events-edit-page">
      <header className="admin-editor__header">
        <p>Past events archive</p>
        <h1>{editingId ? 'Update archived event' : 'Add a completed event'}</h1>
        <span>Maintain the public archive and attach reports or learning resources whenever they become available.</span>
      </header>
      <form className="event-form past-event-form" onSubmit={handleSubmit}>
        <div className="past-event-form__grid">
          <label>
            Event date
            <input name="date" type="date" value={formData.date} onChange={handleChange} required />
          </label>
          <label>
            Event title
            <input name="title" placeholder="Completed event title" value={formData.title} onChange={handleChange} required />
          </label>
          <label>
            Report link
            <input name="reportLink" placeholder="https://…" value={formData.reportLink} onChange={handleChange} />
          </label>
          <label>
            Resources link
            <input name="resourcesLink" placeholder="https://…" value={formData.resourcesLink} onChange={handleChange} />
          </label>
        </div>
        <div className="past-event-form__actions">
          <button type="submit">{editingId ? 'Update archived event' : 'Add to archive'}</button>
        </div>
      </form>
      <section className="past-events-list" aria-labelledby="past-events-list-heading">
        <div className="past-events-list__heading">
          <h2 id="past-events-list-heading">Archived events</h2>
          <span>{events.length} total</span>
        </div>
        <div className="past-events-table-wrap" tabIndex="0" aria-label="Archived events table">
          <table className="past-events-table">
            <caption>Past events, reports, resources, and editing actions</caption>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Date</th>
                <th scope="col">Event title</th>
                <th scope="col">Report</th>
                <th scope="col">Resources</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={event._id}>
                  <td>{String(index + 1).padStart(2, '0')}</td>
                  <td>{event.date}</td>
                  <td className="past-events-table__title">{event.title}</td>
                  <td>
                    {event.reportLink ? (
                      <a
                        href={event.reportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="past-event-link"
                        aria-label={`Report for ${event.title}`}
                      >
                        <FaExternalLinkAlt size={16} />
                        Open report
                      </a>
                    ) : (
                      <span className="pending-event-link">Yet to be added</span>
                    )}
                  </td>
                  <td>
                    {event.resourcesLink ? (
                      <a
                        href={event.resourcesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="past-event-link"
                        aria-label={`Resources for ${event.title}`}
                      >
                        <FaExternalLinkAlt size={16} />
                        Open resources
                      </a>
                    ) : (
                      <span className="pending-event-link">Yet to be added</span>
                    )}
                  </td>
                  <td>
                    <div className="past-event-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(event)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="past-event-delete"
                        onClick={() => handleDelete(event._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td className="past-events-table__empty" colSpan="6">No past events have been added.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <button
        className="back-to-admin-btn"
        onClick={() => navigate('/admin/dashboard')}
      >
        ← Admin dashboard
      </button>
    </main>
  );
};

export default PastEventsEdit;
