/**
 * @file AdminLogin.js
 * @description
 * Admin login page for Chips & Bytes website.
 * Allows admins to log in using username and password.
 * 
 * Features:
 * - Handles login form and authentication.
 * - Stores JWT token in localStorage on success.
 * - Redirects to admin dashboard after login.
 * - Shows error messages on failure.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Wake the server and database while the administrator enters credentials.
  // This request never blocks the form and is cancelled when the page unmounts.
  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) return undefined;

    const controller = new AbortController();
    fetch(`${backendUrl}/api/health`, {
      cache: 'no-store',
      signal: controller.signal
    }).catch(() => {});

    return () => controller.abort();
  }, []);

  /**
   * Handles admin login form submission.
   * @param {React.FormEvent} e
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Username</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
