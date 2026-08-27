/**
 * @file App.js
 * @description
 * Main entry point for the Chips & Bytes React application.
 * Sets up routing for all pages, including public and admin routes.
 * Handles navigation, active tab state, and renders the Navbar and Footer.
 * 
 * Features:
 * - Client-side routing using react-router-dom.
 * - Dynamic active tab highlighting in the Navbar.
 * - Protected admin routes using JWT authentication.
 * - Renders all main pages and admin edit pages.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const ChipsBytesWebsite = lazy(() => import('./ChipsBytesWebsite'));
const BlogsPage = lazy(() => import('./components/Pages/BlogsPage'));
const BlogsDetailsPage = lazy(() => import('./components/Page-Contents/BlogsDetailsPage'));
const ProjectsPage = lazy(() => import('./components/Pages/ProjectsPage'));
const ProjectsDetailsPage = lazy(() => import('./components/Page-Contents/ProjectsDetailsPage'));
const EventsPage = lazy(() => import('./components/Pages/EventsPage'));
const EventDetailsPage = lazy(() => import('./components/Page-Contents/EventsDetailsPage'));
const NewsDetailsPage = lazy(() => import('./components/Page-Contents/NewsDetailsPage'));
const NewsEditionPage = lazy(() => import('./components/Page-Contents/NewsEditionPage'));
const AdminLogin = lazy(() => import('./components/Pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/Pages/AdminDashboard'));
const EventEdit = lazy(() => import('./components/AdminPages/EventEdit'));
const PastEventsEdit = lazy(() => import('./components/AdminPages/PastEventsEdit'));
const AnnouncementEdit = lazy(() => import('./components/AdminPages/AnnouncementEdit'));
const NewsEdit = lazy(() => import('./components/AdminPages/NewsEdit'));

/**
 * AppContent Component
 * 
 * Handles the main layout, routing, and active tab state.
 * 
 * @component
 * @returns {JSX.Element}
 */
function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  // Update activeTab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('home');
    } else if (path.startsWith('/blogs')) {
      setActiveTab('blogs');
    } else if (path.startsWith('/projects')) {
      setActiveTab('projects');
    } else if (path.startsWith('/news')) {
      setActiveTab('news');
    } else if (path.startsWith('/events')) {
      setActiveTab('events');
    }
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      <div style={{ flex: 1 }}>
        <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
          <Routes>
            <Route path="/" element={<ChipsBytesWebsite />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/details" element={<BlogsDetailsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/details" element={<ProjectsDetailsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/details" element={<EventDetailsPage />} />
            <Route path="/news" element={<NewsDetailsPage />} />
            <Route path="/news/:dateKey" element={<NewsEditionPage />} />
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/event-edit"
              element={
                <ProtectedRoute>
                  <EventEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/past-events-edit"
              element={
                <ProtectedRoute>
                  <PastEventsEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcement-edit"
              element={
                <ProtectedRoute>
                  <AnnouncementEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news-edit"
              element={
                <ProtectedRoute>
                  <NewsEdit />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

/**
 * App Component
 * 
 * Wraps the application in a Router and renders AppContent.
 * 
 * @component
 * @returns {JSX.Element}
 */
function App() {
  return (
    <div className="app-container">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
