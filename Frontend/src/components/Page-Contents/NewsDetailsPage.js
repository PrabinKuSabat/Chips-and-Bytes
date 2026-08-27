import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicResource } from '../../hooks/usePublicResource';
import './NewsDetailsPage.css';

const formatDate = (dateKey) => new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const NewsDetailsPage = () => {
  const newsVersion = localStorage.getItem('chips-and-bytes:news-version') || '0';
  const { data: items, isRefreshing, error } = usePublicResource({
    cacheKey: 'news-archive',
    url: `${process.env.REACT_APP_BACKEND_URL}/api/news?limit=500&v=${newsVersion}`,
    fallback: []
  });

  const editions = useMemo(() => {
    const grouped = new Map();
    items.forEach((item) => {
      if (!grouped.has(item.dateKey)) grouped.set(item.dateKey, []);
      grouped.get(item.dateKey).push(item);
    });
    return Array.from(grouped, ([dateKey, editionItems]) => ({ dateKey, items: editionItems }));
  }, [items]);

  return (
    <main className="news-details-container">
      <header className="news-details-header">
        <p className="news-kicker">Architecture + AI briefing</p>
        <h1>Daily News</h1>
        <p>Every dated edition, organized for focused reading and future reference.</p>
      </header>

      {editions.length > 0 ? (
        <div className="news-edition-grid">
          {editions.map((edition) => (
            <article className="news-edition-card" key={edition.dateKey}>
              <p className="news-edition-card__count">{edition.items.length} {edition.items.length === 1 ? 'item' : 'items'}</p>
              <h2>{formatDate(edition.dateKey)}</h2>
              <ol>
                {edition.items.slice(0, 3).map((item) => <li key={item._id}>{item.heading}</li>)}
              </ol>
              <Link to={`/news/${edition.dateKey}`} aria-label={`Read the complete news edition for ${formatDate(edition.dateKey)}`}>
                Read edition <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="news-details-empty">
          {isRefreshing ? 'Loading the news archive…' : 'No news editions have been published yet.'}
        </p>
      )}

      {isRefreshing && <p className="content-refresh-status">Refreshing the news archive…</p>}
      {error && editions.length > 0 && <p className="content-refresh-status">Showing the saved archive while the server reconnects.</p>}
    </main>
  );
};

export default NewsDetailsPage;
