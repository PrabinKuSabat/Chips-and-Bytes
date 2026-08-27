import React from 'react';
import { FaGithub } from 'react-icons/fa';
import ExternalCardLink from '../ExternalCardLink/ExternalCardLink';
import './ProjectCard.css';

const ProjectCard = ({ project, className = '' }) => (
  <article className={`project-card-shell ${className}`.trim()}>
    <div className="project-card-surface">
      <div className="project-card-media">
        {project.image ? (
          <img
            src={project.image}
            alt=""
            className="project-card-image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="project-card-fallback" aria-hidden="true">
            <FaGithub size={74} />
          </div>
        )}
        <div className="project-card-overlay" aria-hidden="true" />
        <span className="project-card-kicker">Open source</span>
      </div>

      <div className="project-card-copy">
        <h3>{project.title}</h3>
        <p>{project.description || 'A Chips & Bytes community project.'}</p>
        <ExternalCardLink
          href={project.url}
          ariaLabel={`View ${project.title} repository on GitHub`}
          icon={<FaGithub size={19} />}
          label="View repository"
          host="github.com"
          className="project-repository-link"
        />
      </div>
    </div>
  </article>
);

export default ProjectCard;
