/**
 * @file NewsEdit.js
 * @description Authenticated editor for dated, ordered daily news items.
 */

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MarkdownPasteTextarea from '../NewsContent/MarkdownPasteTextarea';
import { invalidatePublicResource } from '../../hooks/usePublicResource';
import './NewsEdit.css';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/news`;
const NEWS_VERSION_KEY = 'chips-and-bytes:news-version';
const sortNewsItems = (newsItems) => [...newsItems].sort((left, right) => (
  right.dateKey.localeCompare(left.dateKey)
  || (left.order || 1) - (right.order || 1)
  || new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
));

const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createEmptyForm = () => ({
  dateKey: getLocalDateKey(),
  heading: '',
  summary: '',
  content: '',
  order: 1
});

const NewsEdit = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data || []);
      setError('');
    } catch (requestError) {
      setError('Unable to load the news editor. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'order' ? Number(value) : value
    }));
  };

  const invalidatePublicNews = (...dateKeys) => {
    new Set(dateKeys.filter(Boolean)).forEach((dateKey) => {
      invalidatePublicResource(`news-${dateKey}`);
      invalidatePublicResource(`news-edition-${dateKey}`);
    });
    invalidatePublicResource('news-archive');
    localStorage.setItem(NEWS_VERSION_KEY, String(Date.now()));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const previousDateKey = editingId
        ? items.find((item) => item._id === editingId)?.dateKey
        : null;
      const response = editingId
        ? await axios.put(`${API_URL}/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        })
        : await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      setItems((current) => editingId
        ? sortNewsItems(current.map((item) => item._id === editingId ? response.data : item))
        : sortNewsItems([...current, response.data]));
      invalidatePublicNews(previousDateKey, response.data.dateKey);
      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this news item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      dateKey: item.dateKey,
      heading: item.heading,
      summary: item.summary,
      content: item.content,
      order: item.order || 1
    });
    setEditingId(item._id);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete “${item.heading}”?`)) return;

    try {
      await axios.delete(`${API_URL}/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems((current) => current.filter((candidate) => candidate._id !== item._id));
      invalidatePublicNews(item.dateKey);
      if (editingId === item._id) resetForm();
    } catch (requestError) {
      setError('Unable to delete this news item.');
    }
  };

  return (
    <main className="admin-editor news-edit-page">
      <header className="news-edit-header">
        <p>Daily briefing editor</p>
        <h1>{editingId ? 'Update News Item' : 'Add News Item'}</h1>
        <span>Each item becomes one numbered heading in its dated edition.</span>
      </header>

      <form className="news-edit-form" onSubmit={handleSubmit}>
        <div className="news-edit-form__row">
          <label>
            Edition date
            <input type="date" name="dateKey" value={form.dateKey} onChange={updateField} required />
          </label>
          <label>
            Display order
            <input type="number" name="order" min="1" value={form.order} onChange={updateField} required />
          </label>
        </div>

        <label>
          Numbered heading
          <input name="heading" maxLength="180" value={form.heading} onChange={updateField} placeholder="What happened?" required />
        </label>

        <label>
          Short description
          <textarea name="summary" rows="3" maxLength="600" value={form.summary} onChange={updateField} placeholder="The concise homepage description." required />
        </label>

        <label>
          Complete note
          <MarkdownPasteTextarea name="content" rows="14" maxLength="20000" value={form.content} onChange={updateField} placeholder="Paste formatted ChatGPT text or write Markdown. LaTeX works inside $…$ or $$…$$." required />
          <small>Formatting supported: headings, bold, italic, lists, links, tables, code, blockquotes, and LaTeX math.</small>
        </label>

        <div className="news-edit-form__actions">
          <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : editingId ? 'Update item' : 'Add item'}</button>
          {editingId && <button type="button" className="news-edit-secondary" onClick={resetForm}>Cancel edit</button>}
        </div>
      </form>

      {error && <p className="news-edit-message" role="alert">{error}</p>}

      <section className="news-edit-list" aria-busy={loading}>
        <div className="news-edit-list__heading">
          <h2>Published items</h2>
          <span>{items.length} total</span>
        </div>

        {loading ? (
          <p className="news-edit-message" role="status">Loading news…</p>
        ) : items.length > 0 ? items.map((item) => (
          <article className="news-edit-card" key={item._id}>
            <div className="news-edit-card__meta"><span>{item.dateKey}</span><span>#{item.order || 1}</span></div>
            <h3>{item.heading}</h3>
            <p>{item.summary}</p>
            <div className="news-edit-card__actions">
              <button type="button" onClick={() => handleEdit(item)}>Edit</button>
              <button type="button" onClick={() => handleDelete(item)}>Delete</button>
            </div>
          </article>
        )) : <p className="news-edit-message">No news items have been added.</p>}
      </section>

      <button type="button" className="news-edit-back" onClick={() => navigate('/admin/dashboard')}>← Admin dashboard</button>
    </main>
  );
};

export default NewsEdit;
