/**
 * @file BlogsDetailsPage.js
 * @description
 * Displays a horizontally scrollable carousel of featured blogs.
 * Renders locally packaged blog metadata without waiting for third-party previews.
 * Allows users to scroll through blog cards and open blog links.
 * 
 * Features:
 * - Displays a locally packaged article catalogue with no preview API wait.
 * - Responsive carousel with left/right scroll arrows.
 * - Smooth scroll and scroll position detection.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React, { useEffect, useState, useRef } from 'react';
import { useBlogPreviews } from '../../hooks/useBlogPreviews';
import BlogCard from '../BlogCard/BlogCard';
import './BlogsDetailsPage.css';
import { useLocation } from "react-router-dom";

const BlogsDetailsPage = () => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef(null);
  const location = useLocation();
  const { items: blogs, isRefreshing } = useBlogPreviews();

  /**
   * Checks and updates the scroll position state for the carousel.
   */
  const checkScrollPosition = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    setCanScrollLeft(slider.scrollLeft > 0);
    setCanScrollRight(slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 5);
  };

  /**
   * Scrolls the carousel left or right by a fixed amount.
   * @param {'left'|'right'} direction
   */
  const scroll = (direction) => {
    const scrollAmount = 350;
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    checkScrollPosition();
    slider.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      slider.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [blogs]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="blog-details-container">
      <div className="header-section">
        <h1 className="blog-heading">Featured Blogs</h1>
        <p className="blog-subtitle">Discover our latest insights and stories</p>
        {isRefreshing && <p className="content-refresh-status blog-cache-status">Refreshing original article previews…</p>}
      </div>

      <div className="carousel-wrapper">
          {canScrollLeft && (
            <button 
              className="scroll-arrow left-arrow" 
              onClick={() => scroll('left')} 
              aria-label="Scroll Left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
          )}

          <div className="blog-slider" ref={sliderRef}>
            {blogs.map((blog, idx) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                index={idx}
                linkClassName="blog-read-link"
                actionLabel="Read More"
              />
            ))}
          </div>

          {canScrollRight && (
            <button 
              className="scroll-arrow right-arrow" 
              onClick={() => scroll('right')} 
              aria-label="Scroll Right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          )}
      </div>
    </div>
  );
};

export default BlogsDetailsPage;
