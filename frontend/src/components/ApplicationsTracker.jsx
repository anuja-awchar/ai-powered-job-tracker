import React, { useState, useEffect } from 'react';
import { applicationsAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';
import '../styles/applications.css';

export default function ApplicationsTracker({ userId }) {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [filterStatus, userId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsAPI.getApplications(userId, filterStatus || null);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(appId, newStatus);
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: '#3b82f6',
      interview: '#10b981',
      offer: '#8b5cf6',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="applications-container">
      <h2>My Applications</h2>

      <div className="status-filters">
        <button
          className={`filter-btn ${filterStatus === '' ? 'active' : ''}`}
          onClick={() => setFilterStatus('')}
        >
          All ({applications.length})
        </button>
        <button
          className={`filter-btn ${filterStatus === 'applied' ? 'active' : ''}`}
          onClick={() => setFilterStatus('applied')}
        >
          Applied
        </button>
        <button
          className={`filter-btn ${filterStatus === 'interview' ? 'active' : ''}`}
          onClick={() => setFilterStatus('interview')}
        >
          Interview
        </button>
        <button
          className={`filter-btn ${filterStatus === 'offer' ? 'active' : ''}`}
          onClick={() => setFilterStatus('offer')}
        >
          Offer
        </button>
        <button
          className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="no-apps">No applications yet</p>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app.id} className="application-item">
              <div className="app-header">
                <div className="app-info">
                  <h3>Job ID: {app.jobId}</h3>
                  <p>{formatDate(app.appliedAt)}</p>
                </div>
                <div className="status-badge" style={{ backgroundColor: getStatusColor(app.status) }}>
                  {app.status}
                </div>
              </div>

              <div className="timeline">
                {app.timeline?.map((event, idx) => (
                  <div key={idx} className="timeline-event">
                    <span className="event-status">{event.status}</span>
                    <span className="event-date">{formatDate(event.timestamp)}</span>
                  </div>
                ))}
              </div>

              <div className="status-update">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
