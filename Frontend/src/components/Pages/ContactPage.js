/**
 * @file ContactPage.js
 * @description
 * Contact form page for the Chips & Bytes website.
 * Allows users to send messages to the club.
 * 
 * Features:
 * - Validates form fields (name, email, message).
 * - Shows error messages for invalid input.
 * - Sends form data to the backend API.
 * - Displays success or error status messages.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import './ContactPage.css';

const initialForm = { name: '', email: '', message: '' };
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactPage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Validate on demand
  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email is not valid.';
    }
    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty.';
    return newErrors;
  }, [formData]);

  // Live validation when fields are touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate());
    }
  }, [formData, touched, validate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setStatusMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      // focus first invalid field
      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstErrorField);
      el?.focus();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData(initialForm);
        setTouched({});
        setErrors({});
        setStatusMessage({
          type: 'success',
          text: "Thanks for your message. We'll get back to you soon!",
        });
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = data.error || 'Failed to send message. Please try again.';
        setStatusMessage({ type: 'error', text: msg });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setStatusMessage({
        type: 'error',
        text: 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (touched[field] && errors[field]) {
      return (
        <small className="error" id={`${field}-error`} aria-live="polite">
          {errors[field]}
        </small>
      );
    }
    return null;
  };

  return (
    <section className="contact-page" aria-labelledby="contact-heading">
      <header className="contact-page__header">
        <p className="contact-page__eyebrow">Open channel / C&amp;B</p>
        <h1 id="contact-heading">Contact Us</h1>
        <p>We'd love to hear from you! Reach out with questions, feedback, or collaboration ideas.</p>
      </header>

      <div className="contact-page__layout">
        <aside className="contact-page__signal" aria-label="Chips and Bytes contact channel">
          <img
            src="/assets/logo_white_full.png"
            alt="Chips & Bytes"
            className="contact-page__club-logo"
          />
        </aside>

        <form className="contact-form" onSubmit={handleSubmit} noValidate aria-describedby="form-status">
          <div className="contact-form__topline">
            <span>Send a message</span>
            <span>* Required fields</span>
          </div>
          {statusMessage && (
            <div
              className={`form-status ${statusMessage.type === 'error' ? 'error-box' : 'success-box'}`}
              role={statusMessage.type === 'error' ? 'alert' : 'status'}
              id="form-status"
            >
              {statusMessage.text}
            </div>
          )}

          <div className="contact-form__fields">
            <div className="form-group">
          <label htmlFor="name">
            Name<span aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            disabled={loading}
            autoComplete="name"
          />
          {renderError('name')}
            </div>

            <div className="form-group">
          <label htmlFor="email">
            Email<span aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            disabled={loading}
            autoComplete="email"
          />
          {renderError('email')}
            </div>

            <div className="form-group form-group--message">
          <label htmlFor="message">
            Message<span aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            value={formData.message}
            onChange={handleChange}
            placeholder="Type your message..."
            rows="5"
            required
            disabled={loading}
          />
          {renderError('message')}
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
            aria-busy={loading}
          >
            <span>{loading ? 'Sending…' : 'Send Message'}</span>
            <Send size={17} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactPage;
