import React, { useEffect } from 'react';
import './HomePage.css';
import AboutPage from './AboutPage';
import EventsPage from './EventsPage';
import NewsPage from './NewsPage';
import ProjectsPage from './ProjectsPage';
import BlogsPage from './BlogsPage';
import MentorsPage from './MentorsPage';
import ContactPage from './ContactPage';
import MembersPage from './MembersPage';
import { Link } from 'react-router-dom';
import { publicContentFallback } from '../../data/publicContentFallback';
import { usePublicResource } from '../../hooks/usePublicResource';
import CinematicHero from '../CinematicHero/CinematicHero';
import LiveSessions from '../LiveSessions/LiveSessions';
import AnnouncementPanel from '../AnnouncementPanel/AnnouncementPanel';
import { getScheduledEvents } from '../../utils/eventSchedule';

const ANNOUNCEMENTS_API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/announcements`;
const EVENTS_API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/events`;

const HomePage = () => {
  const { data: announcements } = usePublicResource({
    cacheKey: 'announcements',
    url: ANNOUNCEMENTS_API_URL,
    fallback: publicContentFallback.announcements,
    refreshInterval: 60000,
  });
  const { data: events, isRefreshing: loadingEvents } = usePublicResource({
    cacheKey: 'events',
    url: EVENTS_API_URL,
    fallback: publicContentFallback.events,
    refreshInterval: 60000,
  });
  // The API archives expired events; this client guard keeps a passed cached
  // event from lingering while the tab stays open between refreshes.
  const nextSession = getScheduledEvents(events)[0];

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('.tab-section-container'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page home-page">
      <CinematicHero
        onJoin={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
      />

      <AnnouncementPanel announcements={announcements} />
      <LiveSessions sessions={nextSession ? [nextSession] : []} isRefreshing={loadingEvents} />

      <div id="about-us" className="tab-section-container"><AboutPage /></div>
      <div id="members-section" className="tab-section-container"><MembersPage /></div>
      <div id="events-section" className="tab-section-container"><EventsPage /></div>
      <div id="news-section" className="tab-section-container"><NewsPage /></div>
      <div id="projects-section" className="tab-section-container"><ProjectsPage /></div>
      <div id="blogs-section" className="tab-section-container"><BlogsPage /></div>
      <div id="mentors-section" className="tab-section-container"><MentorsPage /></div>
      <div id="contact-section" className="tab-section-container"><ContactPage /></div>

      <div className="admin-entry">
        <Link to="/admin" aria-label="Admin login">
          <img src="/assets/logo_white_full.png" alt="" />
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
