/**
 * @file EventsDetailsPage.js
 * @description
 * Displays a table of past events with their date, title, report, and resources links.
 * Fetches event data from the backend API.
 * 
 * Features:
 * - Fetches and displays all past events.
 * - Shows links to event reports and resources if available.
 * - Formats event dates for readability.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React from 'react';
import './EventsDetailsPage.css';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { publicContentFallback } from '../../data/publicContentFallback';
import { usePublicResource } from '../../hooks/usePublicResource';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/pastevents`;

const EventDetailsPage = () => {
  const { data: events, isRefreshing } = usePublicResource({
    cacheKey: 'past-events',
    url: API_URL,
    fallback: publicContentFallback.pastEvents,
  });

  /**
   * Formats a date string into a human-readable format.
   * @param {string} dateString
   * @returns {string}
   */
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="event-details-container">
      <div className="header-section">
        <h1 className="event-heading">Event Details</h1>
        <p className="event-subtitle">Comprehensive overview of our events, reports, and resources</p>
      </div>

      <div className="table-wrapper">
        {isRefreshing && <p className="content-refresh-status">Refreshing the latest event archive…</p>}
        <div className="table-container">
          <table className="events-table">
            <thead>
              <tr className="table-header">
                <th className="table-cell header-cell">S.No</th>
                <th className="table-cell header-cell">Date</th>
                <th className="table-cell header-cell">Event Title</th>
                <th className="table-cell header-cell">Report</th>
                <th className="table-cell header-cell">Resources</th>
              </tr>
            </thead>
            <tbody>
              {[...events].reverse().map((event, index) => (
                <tr key={event._id} className="table-row">
                  <td className="table-cell serial-cell">{index + 1}</td>
                  <td className="table-cell date-cell">{formatDate(event.date)}</td>
                  <td className="table-cell title-cell">{event.title}</td>
                  <td className="table-cell link-cell">
                    {event.reportLink ? (
                      <a 
                        href={event.reportLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="drive-link report-link"
                        aria-label={`Report for ${event.title}`}
                      >
                        <FaExternalLinkAlt size={16} />
                        Click here
                      </a>
                    ) : (
                      <span style={{ color: '#888' }}>N/A</span>
                    )}
                  </td>
                  <td className="table-cell link-cell">
                    {event.resourcesLink ? (
                      <a 
                        href={event.resourcesLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="drive-link resources-link"
                        aria-label={`Resources for ${event.title}`}
                      >
                        <FaExternalLinkAlt size={16} />
                        Click here
                      </a>
                    ) : (
                      <span style={{ color: '#888' }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
