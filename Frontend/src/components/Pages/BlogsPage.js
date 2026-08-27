/**
 * @file BlogsPage.js
 * @description
 * Displays a horizontally scrollable carousel of featured blogs.
 * Renders locally packaged blog metadata so the carousel is available immediately.
 * Allows users to scroll through blog cards, swipe on mobile, and open blog links.
 * 
 * Features:
 * - Displays a locally packaged article catalogue with no preview API wait.
 * - Responsive carousel with left/right scroll arrows.
 * - Mobile swipe support for carousel.
 * - "More..." card to view all blogs.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPreviews } from '../../hooks/useBlogPreviews';
import BlogCard from '../BlogCard/BlogCard';
import './BlogsPage.css';

const BlogsPage = () => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const sliderRef = useRef(null);
  const { items: blogs, isRefreshing } = useBlogPreviews({ limit: 7 });

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  const scroll = useCallback((direction) => {
    const scrollAmount = isMobile ? (window.innerWidth <= 375 ? 200 : 250) : 320;
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [isMobile]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback((e) => {
    if (!touchStart) return;
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && canScrollRight) {
        scroll('right');
      } else if (diff < 0 && canScrollLeft) {
        scroll('left');
      }
      setTouchStart(null);
    }
  }, [touchStart, canScrollRight, canScrollLeft, scroll]);

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // Set up scroll and touch event listeners
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    checkScrollPosition();
    slider.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);
    if (isMobile) {
      slider.addEventListener('touchstart', handleTouchStart, { passive: true });
      slider.addEventListener('touchmove', handleTouchMove, { passive: true });
      slider.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    return () => {
      slider.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
      if (isMobile) {
        slider.removeEventListener('touchstart', handleTouchStart);
        slider.removeEventListener('touchmove', handleTouchMove);
        slider.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [blogs, isMobile, touchStart, canScrollLeft, canScrollRight, handleTouchMove]);

  return (
    <div className="blogs-page">
      <h1 className="tab-heading">Blogs</h1>
      <p className="tab-desc">
        Read articles and tutorials written by our community members.
      </p>
      {isRefreshing && <p className="content-refresh-status blog-cache-status">Refreshing article previews in the background…</p>}

      <>
          <div className="carousel-wrapper">
            {canScrollLeft && (
              <button 
                className="scroll-arrow left-arrow" 
                onClick={() => scroll('left')} 
                aria-label="Scroll Left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
            )}

            <div 
              className={`blog-slider ${isMobile ? 'mobile-slider' : ''}`} 
              ref={sliderRef}
            >
              {blogs.map((blog, idx) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  index={idx}
                  className={isMobile ? 'mobile-card' : ''}
                  linkClassName="blog-read-link"
                  actionLabel="Read Article"
                />
              ))}
              {/* More... card */}
              <div className={`blog-card more-card ${isMobile ? 'mobile-card' : ''}`}>
                <Link to="/blogs/details" className="more-card-link">
                  <div className="card-content more-card-content">
                    <div className="more-card-inner">
                      <div className="more-icon">
                        <svg width={isMobile ? "50" : "70"} height={isMobile ? "50" : "70"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"></circle>
                          <circle cx="12" cy="5" r="3"></circle>
                          <circle cx="12" cy="19" r="3"></circle>
                        </svg>
                      </div>
                      <h3 className="more-title">More...</h3>
                      <p className="more-description">
                        {isMobile ? "Explore more content" : "Explore all our blogs and discover more amazing content"}
                      </p>
                      <div className="more-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="7" y1="17" x2="17" y2="7"></line>
                          <polyline points="7,7 17,7 17,17"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {canScrollRight && (
              <button 
                className="scroll-arrow right-arrow" 
                onClick={() => scroll('right')} 
                aria-label="Scroll Right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            )}
          </div>
          <div className="read-more-container">
            <Link to="/blogs/details" className="read-more-link">
              View All Blogs →
            </Link>
          </div>
      </>
    </div>
  );
};

export default BlogsPage;
