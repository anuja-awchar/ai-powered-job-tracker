import React, { useState, useEffect, createContext } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import JobFeed from './components/JobFeed';
import ApplicationsTracker from './components/ApplicationsTracker';
import ResumeUpload from './components/ResumeUpload';
import ChatSidebar from './components/ChatSidebar';
import { applicationsAPI } from './utils/api';
import './styles/global.css';
import './styles/app.css';

export const AppContext = createContext();

function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [pendingJob, setPendingJob] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setUser({ userId, token });
      setCurrentPage('feed');
    }
  }, []);

  const handleAuthSuccess = () => {
    const userId = localStorage.getItem('userId');
    setUser({ userId });
    setCurrentPage('resume');
  };

  const handleResumeSuccess = () => {
    setCurrentPage('feed');
  };

  const handleApply = (job) => {
    setPendingJob(job);
    setShowApplyPopup(true);
  };

  const handleApplyResponse = async (didApply) => {
    if (didApply && pendingJob) {
      try {
        await applicationsAPI.recordApplication(
          user.userId,
          pendingJob.id,
          'applied'
        );
      } catch (error) {
        console.error('Error recording application:', error);
      }
    }
    setShowApplyPopup(false);
    setPendingJob(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setCurrentPage('auth');
    setAuthMode('login');
  };

  return (
    <AppContext.Provider value={{ user, setUser }}>
      <div className="app-container">
        {currentPage === 'auth' && (
          <div className="auth-page">
            {authMode === 'login' ? (
              <>
                <Login onSuccess={handleAuthSuccess} />
                <p className="auth-toggle">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthMode('register')}>Register</button>
                </p>
              </>
            ) : (
              <>
                <Register onSuccess={handleAuthSuccess} />
                <p className="auth-toggle">
                  Already have an account?{' '}
                  <button onClick={() => setAuthMode('login')}>Login</button>
                </p>
              </>
            )}
          </div>
        )}

        {currentPage === 'resume' && user && (
          <div className="resume-page">
            <button className="back-btn" onClick={() => setCurrentPage('auth')}>← Back</button>
            <ResumeUpload userId={user.userId} onSuccess={handleResumeSuccess} />
          </div>
        )}

        {currentPage === 'feed' && user && (
          <div className="main-layout">
            <header className="navbar">
              <div className="nav-left">
                <h1>🚀 AI Job Tracker</h1>
              </div>
              <nav className="nav-links">
                <button
                  className={currentPage === 'feed' ? 'active' : ''}
                  onClick={() => setCurrentPage('feed')}
                >
                  Jobs
                </button>
                <button
                  className={currentPage === 'applications' ? 'active' : ''}
                  onClick={() => setCurrentPage('applications')}
                >
                  Applications
                </button>
                <button
                  className={currentPage === 'resume' ? 'active' : ''}
                  onClick={() => setCurrentPage('resume')}
                >
                  Resume
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </nav>
            </header>

            <div className="main-content">
              {currentPage === 'feed' && (
                <JobFeed userId={user.userId} onApply={handleApply} />
              )}
              {currentPage === 'applications' && (
                <ApplicationsTracker userId={user.userId} />
              )}
              {currentPage === 'resume' && (
                <ResumeUpload userId={user.userId} onSuccess={handleResumeSuccess} />
              )}

              {showApplyPopup && pendingJob && (
                <div className="modal-overlay" onClick={() => handleApplyResponse(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h2>Did you apply?</h2>
                    <p>
                      Did you apply to <strong>{pendingJob.title}</strong> at{' '}
                      <strong>{pendingJob.company}</strong>?
                    </p>
                    <div className="modal-buttons">
                      <button className="btn-yes" onClick={() => handleApplyResponse(true)}>
                        ✓ Yes, Applied
                      </button>
                      <button className="btn-no" onClick={() => handleApplyResponse(false)}>
                        ✗ No, Just Browsing
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ChatSidebar userId={user.userId} />
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;
