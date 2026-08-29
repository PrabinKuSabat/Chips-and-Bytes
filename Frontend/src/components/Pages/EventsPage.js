/**
 * @file EventsPage.js
 * @description
 * Displays a grid of upcoming events.
 * Fetches event data from the backend API.
 * 
 * Features:
 * - Fetches and displays all upcoming events.
 * - Shows event details: title, speaker, date, time, location, description.
 * - Link to view past events.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { publicContentFallback } from '../../data/publicContentFallback';
import { usePublicResource } from '../../hooks/usePublicResource';
import { getScheduledEvents } from '../../utils/eventSchedule';
import './EventsPage.css';

const EventsPage = () => {
  const { data: events, isRefreshing, error } = usePublicResource({
    cacheKey: 'events',
    url: `${process.env.REACT_APP_BACKEND_URL}/api/events`,
    fallback: publicContentFallback.events,
    refreshInterval: 60000,
  });
  const scheduledEvents = getScheduledEvents(events);

  return (
    <>
      <header className="section-heading">
        <h1 className="tab-heading">Events</h1>
        <p className="tab-desc">Join our upcoming workshops, hackathons, and seminars.</p>
      </header>

      {scheduledEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="events-wrapper" aria-busy={isRefreshing}>
          {isRefreshing && <p className="content-refresh-status">Refreshing the latest event details…</p>}
          <div className="events-grid">
            {scheduledEvents.map((event) => (
              <div className="event-card neon-glow" key={event._id}>
                <div className="event-card-header">
                  <h2 className="event-title">{event.title}</h2>
                  <span className="event-speaker">by {event.speaker}</span>
                </div>
                <div className="event-card-body">
                  <div className="event-meta">
                    <span className="event-date">
                      🗓️ {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="event-time">🕒 {event.time}</span>
                    <span className="event-location">📍 {event.location}</span>
                  </div>
                  <p className="event-description">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="content-refresh-status">Showing the latest available event details while the server reconnects.</p>}

      <div className="section-route">
        <Link to="/events/details" className="section-route__link">
          <span>View Past Events</span><span aria-hidden="true">↗</span>
        </Link>
      </div>
    </>
  );
};

export default EventsPage;
