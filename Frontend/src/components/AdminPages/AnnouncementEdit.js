import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { invalidatePublicResource } from '../../hooks/usePublicResource';
import './AnnouncementEdit.css';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/announcements`;
const createEmptyForm = () => ({ title: '', message: '', actionLabel: '', actionUrl: '', category: 'notice', isActive: true });

const AnnouncementEdit = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setAnnouncements(response.data || []); setError('');
    } catch { setError('Unable to load announcements. Please retry.'); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);
  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };
  const resetForm = () => { setForm(createEmptyForm()); setEditingId(null); };
  const handleSubmit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = editingId
        ? await axios.put(`${API_URL}/${editingId}`, form, config)
        : await axios.post(API_URL, form, config);
      setAnnouncements((current) => editingId
        ? current.map((item) => item._id === editingId ? response.data : item)
        : [response.data, ...current]);
      invalidatePublicResource('announcements');
      resetForm();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save this announcement.'); }
    finally { setSubmitting(false); }
  };
  const handleEdit = (item) => {
    setForm({ title: item.title || '', message: item.message || item.text || '', actionLabel: item.actionLabel || '', actionUrl: item.actionUrl || '', category: item.category || 'notice', isActive: item.isActive !== false });
    setEditingId(item._id); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete “${item.title || item.message || item.text}”?`)) return;
    try {
      await axios.delete(`${API_URL}/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements((current) => current.filter((candidate) => candidate._id !== item._id));
      invalidatePublicResource('announcements');
      if (editingId === item._id) resetForm();
    } catch {
      setError('Unable to delete this announcement.');
    }
  };
  return <main className="admin-editor announcement-edit-page">
    <header className="admin-editor__header"><p>Public announcement editor</p><h1>{editingId ? 'Update announcement' : 'Add announcement'}</h1><span>Every field below maps directly to the announcement visitors see on the homepage.</span></header>
    <form className="admin-form announcement-form" onSubmit={handleSubmit}>
      <div className="admin-form__row"><label>Title <input name="title" maxLength="120" value={form.title} onChange={updateField} placeholder="Optional announcement title" /></label><label>Type <select name="category" value={form.category} onChange={updateField}><option value="notice">Notice</option><option value="event">Event</option><option value="opportunity">Opportunity</option><option value="update">Update</option></select></label></div>
      <label>Message <textarea name="message" rows="4" maxLength="600" value={form.message} onChange={updateField} placeholder="The concise message shown to visitors." required /></label>
      <fieldset className="announcement-form__link-group"><legend>Optional call to action</legend><div className="admin-form__row"><label>Link label <input name="actionLabel" maxLength="48" value={form.actionLabel} onChange={updateField} placeholder="Read more" /></label><label>Destination <input name="actionUrl" value={form.actionUrl} onChange={updateField} placeholder="https://… or /events" /></label></div></fieldset>
      <label className="admin-checkbox"><input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} /> Show this announcement publicly</label>
      <div className="admin-form__actions"><button type="submit" disabled={submitting}>{submitting ? 'Saving…' : editingId ? 'Update announcement' : 'Publish announcement'}</button>{editingId && <button className="admin-secondary" type="button" onClick={resetForm}>Cancel edit</button>}</div>
    </form>
    {error && <p className="admin-message" role="alert">{error}</p>}
    <section className="admin-list" aria-busy={loading}><div className="admin-list__heading"><h2>Announcements</h2><span>{announcements.length} total</span></div>{loading ? <p className="admin-message" role="status">Loading announcements…</p> : announcements.length ? announcements.map((item) => <article className="announcement-admin-card" key={item._id}><div className="announcement-admin-card__meta"><span>{item.category || 'notice'}</span><span>{item.isActive !== false ? 'Visible' : 'Hidden'}</span></div><h3>{item.title || 'Untitled announcement'}</h3><p>{item.message || item.text}</p>{item.actionUrl && <small>{item.actionLabel || 'Learn more'} → {item.actionUrl}</small>}<div className="admin-card-actions"><button type="button" onClick={() => handleEdit(item)}>Edit</button><button type="button" onClick={() => handleDelete(item)}>Delete</button></div></article>) : <p className="admin-message">No announcements have been added.</p>}</section>
    <button type="button" className="admin-back" onClick={() => navigate('/admin/dashboard')}>← Admin dashboard</button>
  </main>;
};
export default AnnouncementEdit;
