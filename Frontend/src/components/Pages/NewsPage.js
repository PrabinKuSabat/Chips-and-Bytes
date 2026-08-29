import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicResource } from '../../hooks/usePublicResource';
import './NewsPage.css';

const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const NewsPage = () => {
  const today = getLocalDateKey();
  const newsVersion = localStorage.getItem('chips-and-bytes:news-version') || '0';
  const { data: items, isRefreshing, error } = usePublicResource({
    cacheKey: `news-${today}`,
    url: `${process.env.REACT_APP_BACKEND_URL}/api/news/date/${today}?v=${newsVersion}`,
    fallback: []
  });

  return (
    <section className="news-page" aria-labelledby="news-heading">
      <header className="section-heading">
        <h1 id="news-heading" className="tab-heading">News</h1>
        <p className="tab-desc">Today’s concise briefing on computer architecture, processors, AI systems, and the ideas shaping them.</p>
      </header>

      {items.length > 0 ? (
        <>
          <ol className="news-today-list">
            {items.map((item, index) => (
              <li className="news-today-item" key={item._id}>
                <span className="news-today-item__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{item.heading}</h2>
                  <p>{item.summary}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="news-page__actions">
            <Link to={`/news/${today}`} className="read-more-link">Read today’s complete note →</Link>
            <Link to="/news" className="read-more-link">Browse all news →</Link>
          </div>
        </>
      ) : (
        <div className="news-empty-state">
          <p>{isRefreshing ? 'Checking today’s briefing…' : 'No briefing has been published for today yet.'}</p>
          <Link to="/news" className="read-more-link">Browse earlier news →</Link>
        </div>
      )}

      {isRefreshing && <p className="content-refresh-status">Checking for today’s latest additions…</p>}
      {error && items.length > 0 && <p className="content-refresh-status">Showing the latest saved copy while the server reconnects.</p>}
    </section>
  );
};

export default NewsPage;
