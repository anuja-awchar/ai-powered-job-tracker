import React, { useState } from 'react';
import { getMatchColor, getMatchLabel, formatTimeAgo } from '../utils/helpers';
import '../styles/jobCard.css';

export default function JobCard({ job, onApply }) {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    window.open(job.link, '_blank');
    setApplied(true);
    setTimeout(() => {
      onApply(job);
    }, 500);
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title-section">
          <h3>{job.title}</h3>
          <p className="company">{job.company}</p>
        </div>
        <div className="match-badge" style={{ backgroundColor: getMatchColor(job.matchScore) }}>
          <span className="score">{job.matchScore}%</span>
          <span className="label">{getMatchLabel(job.matchScore)}</span>
        </div>
      </div>

      <div className="job-meta">
        <span className="location">📍 {job.location}</span>
        <span className="job-type">{job.job_type}</span>
        <span className="work-mode">{job.work_mode}</span>
        <span className="posted-date">{formatTimeAgo(job.posted_date)}</span>
      </div>

      <p className="description">{job.description.substring(0, 150)}...</p>

      {job.keyMatches && (
        <div className="key-matches">
          <strong>Why it matches:</strong>
          <div className="skills">
            {job.keyMatches.map((match, idx) => (
              <span key={idx} className="skill-tag">✓ {match}</span>
            ))}
          </div>
        </div>
      )}

      {job.missingSkills && job.missingSkills.length > 0 && (
        <div className="missing-skills">
          <strong>Missing skills:</strong>
          <div className="skills">
            {job.missingSkills.map((skill, idx) => (
              <span key={idx} className="skill-tag missing">✗ {skill}</span>
            ))}
          </div>
        </div>
      )}

      <button
        className={`apply-btn ${applied ? 'applied' : ''}`}
        onClick={handleApply}
        disabled={applied}
      >
        {applied ? '✓ Opening...' : 'Apply Now'}
      </button>
    </div>
  );
}
