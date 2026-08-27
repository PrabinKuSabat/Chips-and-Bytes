import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock } from 'lucide-react';
import './LiveSessions.css';

const formatSessionDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const formatSessionTime = (value) => {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return value;
  const date = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const LiveSessions = ({ sessions = [], isRefreshing = false }) => {
  const railRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const items = Array.isArray(sessions) ? sessions.filter(Boolean) : [];

  useEffect(() => {
    setActiveIndex(0);
    if (railRef.current) railRef.current.scrollLeft = 0;
  }, [items.length]);

  const moveTo = (nextIndex) => {
    if (items.length < 2 || !railRef.current) return;
    const boundedIndex = (nextIndex + items.length) % items.length;
    const card = railRef.current.children[boundedIndex];
    const left = card.offsetLeft - railRef.current.offsetLeft;
    if (typeof railRef.current.scrollTo === 'function') {
      railRef.current.scrollTo({ left, behavior: 'smooth' });
    } else {
      railRef.current.scrollLeft = left;
    }
    setActiveIndex(boundedIndex);
  };

  const updateActiveCard = () => {
    const rail = railRef.current;
    if (!rail || items.length < 2) return;
    const closest = Array.from(rail.children).reduce(
      (best, card, index) => {
        const distance = Math.abs(card.offsetLeft - rail.offsetLeft - rail.scrollLeft);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );
    setActiveIndex(closest.index);
  };

  return (
    <section className="live-sessions" aria-labelledby="live-sessions-heading">
      <header className="live-sessions__header">
        <div>
          <p className="live-sessions__eyebrow">Next on the calendar</p>
          <h2 id="live-sessions-heading">Upcoming Sessions</h2>
        </div>
        <div className="live-sessions__state" aria-live="polite">
          {isRefreshing ? 'Refreshing schedule' : `${items.length} ${items.length === 1 ? 'scheduled session' : 'scheduled sessions'}`}
        </div>
      </header>

      {items.length > 0 ? (
        <>
          <div
            className={`live-sessions__rail ${items.length === 1 ? 'live-sessions__rail--single' : ''}`}
            ref={railRef}
            onScroll={updateActiveCard}
          >
            {items.map((session, index) => (
              <article
                className="live-session-card"
                key={session._id || `${session.title || session.text}-${index}`}
                style={{ '--session-index': index }}
              >
                <div className="live-session-card__number">{String(index + 1).padStart(2, '0')}</div>
                <CalendarClock size={26} strokeWidth={1.45} aria-hidden="true" />
                <div className="live-session-card__content">
                  <h3>{session.title || session.text}</h3>
                  {(session.date || session.time || session.location) && (
                    <dl className="live-session-card__details">
                      {session.date && <div><dt>Date</dt><dd>{formatSessionDate(session.date)}</dd></div>}
                      {session.time && <div><dt>Time</dt><dd>{formatSessionTime(session.time)}</dd></div>}
                      {session.location && <div><dt>Venue</dt><dd>{session.location}</dd></div>}
                    </dl>
                  )}
                  {session.description && <p className="live-session-card__description">{session.description}</p>}
                </div>
                <span className="live-session-card__label">Scheduled session</span>
              </article>
            ))}
          </div>

          {items.length > 1 && (
            <div className="live-sessions__controls">
              <p><strong>{String(activeIndex + 1).padStart(2, '0')}</strong> / {String(items.length).padStart(2, '0')}</p>
              <div>
                <button type="button" onClick={() => moveTo(activeIndex - 1)} aria-label="Previous live session">
                  <ArrowLeft size={17} />
                </button>
                <button type="button" onClick={() => moveTo(activeIndex + 1)} aria-label="Next live session">
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="live-sessions__empty">The next club session will appear here.</p>
      )}
    </section>
  );
};

export default LiveSessions;
