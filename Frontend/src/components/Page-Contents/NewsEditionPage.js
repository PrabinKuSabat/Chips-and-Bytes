import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePublicResource } from '../../hooks/usePublicResource';
import './NewsDetailsPage.css';

const formatDate = (dateKey) => new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const hasValidDateKey = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const NewsEditionPage = () => {
  const { dateKey } = useParams();
  const isValidDate = hasValidDateKey(dateKey);
  const newsVersion = localStorage.getItem('chips-and-bytes:news-version') || '0';
  const { data: items, isRefreshing, error } = usePublicResource({
    cacheKey: `news-edition-${dateKey}`,
    url: isValidDate ? `${process.env.REACT_APP_BACKEND_URL}/api/news/date/${dateKey}?v=${newsVersion}` : '',
    fallback: []
  });

  return (
    <main className="news-details-container news-edition-page">
      <header className="news-details-header">
        <Link to="/news" className="news-back-link">← All news</Link>
        <p className="news-kicker">Daily edition</p>
        <h1>{isValidDate ? formatDate(dateKey) : 'News edition'}</h1>
        <p>Complete notes from the day’s architecture and AI briefing.</p>
      </header>

      {!isValidDate ? (
        <p className="news-details-empty">This news date is not valid.</p>
      ) : items.length > 0 ? (
        <ol className="news-note-list">
          {items.map((item, index) => (
            <li className="news-note" key={item._id}>
              <span className="news-note__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{item.heading}</h2>
                <p className="news-note__summary">{item.summary}</p>
                <div className="news-note__content">{item.content}</div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="news-details-empty">
          {isRefreshing ? 'Loading the complete edition…' : 'No news was published for this date.'}
        </p>
      )}

      {isRefreshing && <p className="content-refresh-status">Loading the complete edition…</p>}
      {error && items.length > 0 && <p className="content-refresh-status">Showing the saved edition while the server reconnects.</p>}
    </main>
  );
};

export default NewsEditionPage;
