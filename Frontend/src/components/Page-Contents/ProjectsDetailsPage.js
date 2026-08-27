/**
 * @file ProjectsDetailsPage.js
 * @description
 * Displays a horizontally scrollable carousel of featured projects.
 * Fetches project preview data (title, description, image, url) using the Microlink API.
 * Allows users to scroll through project cards and open GitHub links.
 * 
 * Features:
 * - Fetches and displays project previews from external links.
 * - Responsive carousel with left/right scroll arrows.
 * - Smooth scroll and scroll position detection.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React, { useEffect, useState } from 'react';
import { gitLinks } from '../../data/constants';
import ProjectCard from '../ProjectCard/ProjectCard';
import './ProjectsDetailsPage.css';

const ProjectsDetailsPage = () => {
  const [projects, setProjects] = useState(gitLinks);

  useEffect(() => {
    /**
     * Fetches project preview data from the Microlink API for each project link.
     */
    const fetchProjectPreviews = async () => {
      const previews = await Promise.all(gitLinks.map(async (linkObj) => {
        try {
          const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(linkObj.url)}`);
          const payload = await response.json();
          const { title, description, image } = payload.data || {};
          return {
            title: title || linkObj.title,
            description: description || linkObj.description,
            image: image?.url || '',
            url: linkObj.url,
          };
        } catch (error) {
          console.error("Error fetching preview for", linkObj.url, error);
          return { ...linkObj };
        }
      }));
      setProjects(previews);
    };
    fetchProjectPreviews();
  }, []);

  return (
    <div className="project-details-container">
      <div className="header-section">
        <h1 className="project-heading">Featured Projects</h1>
        <p className="project-subtitle">Explore our latest open-source work and research projects</p>
      </div>

      <div className="project-grid">
          {projects.map((project, idx) => (
            <ProjectCard key={project.url || idx} project={project} />
          ))}
      </div>
    </div>
  );
};

export default ProjectsDetailsPage;
