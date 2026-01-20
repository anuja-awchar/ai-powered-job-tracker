import React, { useState, useEffect } from 'react';
import { jobsAPI, resumeAPI } from '../utils/api';
import { getMatchColor, getMatchLabel, formatTimeAgo } from '../utils/helpers';
import JobCard from './JobCard';
import '../styles/jobFeed.css';

export default function JobFeed({ userId, onApply }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    title: '',
    jobType: '',
    workMode: '',
    location: '',
    matchScoreFilter: '',
  });
  const [bestMatches, setBestMatches] = useState([]);

  useEffect(() => {
    loadJobs();
  }, [filters, userId]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getFeed(userId, filters);
      setJobs(response.data.allJobs || []);
      setBestMatches(response.data.bestMatches || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  return (
    <div className="job-feed-container">
      <div className="filters-panel">
        <h2>Filter Jobs</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            name="title"
            placeholder="Job title..."
            value={filters.title}
            onChange={handleFilterChange}
          />
          <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
            <option value="">Job Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <select name="workMode" value={filters.workMode} onChange={handleFilterChange}>
            <option value="">Work Mode</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
          <input
            type="text"
            name="location"
            placeholder="Location..."
            value={filters.location}
            onChange={handleFilterChange}
          />
          <select name="matchScoreFilter" value={filters.matchScoreFilter} onChange={handleFilterChange}>
            <option value="">All Match Scores</option>
            <option value="high">High (>70%)</option>
            <option value="medium">Medium (40-70%)</option>
          </select>
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="jobs-section">
        {bestMatches.length > 0 && (
          <div className="best-matches">
            <h2>🎯 Best Matches For You</h2>
            <div className="jobs-grid">
              {bestMatches.map(job => (
                <JobCard key={job.id} job={job} onApply={onApply} />
              ))}
            </div>
          </div>
        )}

        <div className="all-jobs">
          <h2>All Jobs ({jobs.length})</h2>
          {loading ? (
            <p className="loading">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="no-jobs">No jobs found matching your criteria</p>
          ) : (
            <div className="jobs-grid">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} onApply={onApply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
