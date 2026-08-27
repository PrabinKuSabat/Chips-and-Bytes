/**
 * @file AdminDashboard.js
 * @description
 * Admin dashboard page for Chips & Bytes website.
 * Allows navigation to announcement, event, news, and past event editors.
 * Handles admin logout.
 * 
 * Features:
 * - Navigation links to admin edit pages.
 * - Logout button clears JWT token and redirects to login.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  /**
   * Handles admin logout by clearing token and redirecting.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <nav className="admin-nav">
        <ul>
          <li>
            <Link to="/admin/announcement-edit">Edit Announcements</Link>
          </li>
          <li>
            <Link to="/admin/event-edit">Edit Events</Link>
          </li>
          <li>
            <Link to="/admin/past-events-edit">Edit Past Events</Link>
          </li>
          <li>
            <Link to="/admin/news-edit">Edit Daily News</Link>
          </li>
        </ul>
      </nav>
      <button
        className="logout-btn"
        style={{ marginTop: '2rem' }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
