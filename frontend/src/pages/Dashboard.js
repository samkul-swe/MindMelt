import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  User, 
  LogOut, 
  Plus,
  BookOpen,
  Save,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authAPI';
import dataAPI from '../services/dataAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/dashboard.css';

const getTechPunPersistent = () => {
  const puns = [
    { text: "Time to Debug Your Potential!", subtitle: "Let's squash some knowledge gaps together" },
    { text: "Ready to Compile Some Brilliance?", subtitle: "Your brain is the best IDE for learning" },
    { text: "Let's Cache Some Knowledge!", subtitle: "Store these concepts in your long-term memory" },
    { text: "Time to Push Your Limits!", subtitle: "Git ready for an amazing learning session" },
    { text: "Ready to Parse Some Wisdom?", subtitle: "Breaking down complex topics into digestible bits" },
    { text: "Let's Refactor Your Understanding!", subtitle: "Clean code, clean mind, clean learning" },
    { text: "Time to Optimize Your Brain!", subtitle: "Maximum learning efficiency loading..." },
    { text: "Ready to Stack Some Skills?", subtitle: "Building your knowledge data structure" },
    { text: "Let's Initialize Your Growth!", subtitle: "constructor() { this.knowledge = new Map(); }" }
  ];
  
  try {
    const storedPunData = localStorage.getItem('mindmelt_daily_pun');
    const today = new Date().toDateString();
    
    if (storedPunData) {
      const { pun, date } = JSON.parse(storedPunData);
      if (date === today) {
        return pun;
      }
    }
    
    const newPun = puns[Math.floor(Math.random() * puns.length)];
    localStorage.setItem('mindmelt_daily_pun', JSON.stringify({
      pun: newPun,
      date: today
    }));
    
    return newPun;
  } catch (error) {
    console.warn('localStorage not available, using random pun:', error);
    return puns[Math.floor(Math.random() * puns.length)];
  }
};

const formatMemberSinceDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    let date;
    
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting member since date:', error);
    return 'N/A';
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, loading: authLoading, logout, updateUser, getDisplayName } = useAuth();
  
  const [learningSessions, setLearningSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState(false);
  const [dailyPun, setDailyPun] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [roadMaps, setRoadMaps] = useState([]);

  const fetchLearningSessions = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      const sessions = []; // for now, has to be replaced with actual API call
      setLearningSessions(sessions || []);
    } catch (error) {
      console.error('Failed to fetch learning sessions:', error);
      setLearningSessions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchRoadMaps = useCallback(async () => {
    try {
      setLoading(true);
      const roadMaps = await dataAPI.getRoadmaps();
      console.log("Roadmaps count : " + roadMaps.length);
      setRoadMaps(roadMaps || []);
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
      setRoadMaps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usernameUpdateSuccess) {
      setNewUsername('');
    }
  }, [usernameUpdateSuccess]);

  useEffect(() => {
    setDailyPun(getTechPunPersistent());
    fetchLearningSessions();
    fetchRoadMaps();

    const allProgress = {};
    setUserProgress(allProgress);
  }, [fetchLearningSessions, fetchRoadMaps]);

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || savingUsername) return;
    
    setSavingUsername(true);
    try {
      const updatedUser = await authAPI.updateProfile({ username: newUsername.trim() });
      
      if (updateUser && updatedUser) {
        updateUser(updatedUser);
      }
      
      setNewUsername('');
      setUsernameUpdateSuccess(true);
      setTimeout(() => setUsernameUpdateSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to update username:', error);
      alert('Failed to update username. Please try again.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/start', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRoadmapClick = (roadmapData) => {
    navigate(`/roadmap/${roadmapData.id}`);
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard-container-no-sidebar">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <Brain className="logo-icon" />
            <h1>MindMelt</h1>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-profile-compact">
            <div className="user-avatar-small">
              <User size={18} />
            </div>
            <div className="user-info-compact">
              <div className="user-name">{getDisplayName(currentUser)}</div>
              <div className={isAuthenticated ? "member-status" : "anonymous-status"}>
                {isAuthenticated ? (
                  `Member since ${formatMemberSinceDate(currentUser?.createdAt)}`
                ) : (
                  "Anonymous Session"
                )}
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            {isAuthenticated && (
              <button
                onClick={() => setShowProfile(true)}
                className="profile-btn-header"
                title="Profile Settings"
              >
                <User size={18} />
              </button>
            )}
            
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/signup')}
                className="upgrade-btn-header"
              >
                <Sparkles size={16} />
                Create Account
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="welcome-card">
          <div className="welcome-header">
            <Brain className="welcome-icon" />
            <div>
              <h2>{dailyPun?.text || "Welcome to MindMelt!"}</h2>
              <p>{dailyPun?.subtitle || "Your AI-powered learning companion"}</p>
            </div>
          </div>
        </div>

        <div className="activity-overview">
          <h3>Choose Your Learning Roadmap</h3>
          <div className="simple-activity">
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--gray-800)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                Select a structured learning path:
              </h4>
              
              {roadMaps.length > 0 ? (
                <div className="roadmap-grid">
                  {roadMaps.map((roadMap) => (
                    <div 
                      key={roadMap.id}
                      className="roadmap-card"
                      onClick={() => handleRoadmapClick(roadMap)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div 
                        className="roadmap-card-header"
                        style={{
                          background: `linear-gradient(135deg, ${roadMap.color || '#6366f1'} 0%, ${roadMap.color || '#6366f1'}80 100%)`,
                          borderRadius: '12px 12px 0 0',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: 'white'
                        }}
                      >
                        <div className="roadmap-title-section" style={{ flex: 1 }}>
                          <h5 
                            className="roadmap-title"
                            style={{
                              margin: 0,
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: 'white'
                            }}
                          >
                            {roadMap.name || 'Learning Path'}
                          </h5>
                        </div>
                        <div className="roadmap-action">
                          <ChevronRight size={20} color="white" />
                        </div>
                      </div>
                      <div style={{ padding: '1rem' }}>
                        <p 
                          className="roadmap-description"
                          style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            color: 'var(--gray-600)',
                            lineHeight: '1.4'
                          }}
                        >
                          {roadMap.description || 'Enhance your skills with this structured learning path'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: 'var(--gray-500)',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: '8px',
                  border: '2px dashed var(--gray-300)'
                }}>
                  <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No roadmaps available at the moment.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Check back later for exciting learning paths!
                  </p>
                </div>
              )}
            </div>
            
            {!isAuthenticated && (
              <div style={{ 
                textAlign: 'center', 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #FFF4E6 0%, #FFE4B5 100%)', 
                borderRadius: '0.75rem', 
                border: '2px solid var(--accent-light)',
                marginTop: '1.5rem'
              }}>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '0.9rem', 
                  color: 'var(--gray-700)' 
                }}>
                  <strong>Pro tip:</strong> Create an account to save your progress and track your learning journey across topics!
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/signup')}
                  style={{ minWidth: '180px' }}
                >
                  <User size={16} />
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {isAuthenticated && learningSessions.length > 0 && (
          <div className="last-session-section">
            <h3>Continue Your Journey</h3>
            <div className="last-session-card">
              <div className="session-header">
                <div className="session-icon">
                  <BookOpen size={24} />
                </div>
                <div className="session-info">
                  <h4>Last Session: {learningSessions[0].topicName}</h4>
                  <div className="session-meta">
                    {learningSessions[0].category} • {learningSessions[0].difficulty} • 
                    {Math.round(learningSessions[0].progress || 0)}% complete
                  </div>
                  <span className="session-date">
                    {new Date(learningSessions[0].updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="session-actions">
                <button
                  onClick={() => navigate('/learn', {
                    state: { sessionId: learningSessions[0].id }
                  })}
                  className="btn btn-primary btn-sm"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && learningSessions.length > 0 && (
          <div className="activity-overview">
            <h3>Recent Learning Activity</h3>
            <div className="simple-activity">
              <p>
                You've completed {learningSessions.filter(s => s.completed).length} out of {learningSessions.length} sessions
                with an average completion rate of {Math.round((learningSessions.filter(s => s.completed).length / Math.max(learningSessions.length, 1)) * 100)}%.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/learn')}
              >
                <Plus size={16} />
                Start New Session
              </button>
            </div>
          </div>
        )}
      </div>

      {showProfile && isAuthenticated && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div>
                  <h2>Profile Settings</h2>
                  <p>Manage your MindMelt account</p>
                </div>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setShowProfile(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="username-edit-section">
                <h4>
                  <User size={16} />
                  Update Your Username
                </h4>
                <p>Choose how you want to be addressed in MindMelt.</p>
                
                <form onSubmit={handleSaveUsername} className="username-edit-form">
                  <div className="username-input-group">
                    <label htmlFor="new-username">Username</label>
                    <input
                      type="text"
                      id="new-username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder={currentUser?.username || 'Enter your username'}
                      disabled={savingUsername}
                      maxLength={50}
                    />
                  </div>
                  <button
                    type="submit"
                    className="username-save-btn"
                    disabled={!newUsername.trim() || savingUsername}
                  >
                    {savingUsername ? (
                      <>
                        <div className="spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Update
                      </>
                    )}
                  </button>
                </form>

                {usernameUpdateSuccess && (
                  <div className="username-success-message">
                    Username updated successfully!
                  </div>
                )}
              </div>
              
              <div className="profile-section">
                <h3>Account Information</h3>
                <div className="profile-fields">
                  <div className="profile-field">
                    <label>Username</label>
                    <input
                      type="text"
                      value={currentUser?.username || ''}
                      readOnly
                    />
                  </div>
                  <div className="profile-field">
                    <label>Email Address</label>
                    <input type="email" value={currentUser?.email || ''} readOnly />
                  </div>
                  <div className="profile-field">
                    <label>Member Since</label>
                    <input
                      type="text"
                      value={formatMemberSinceDate(currentUser?.createdAt) || 'N/A'}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .roadmap-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .roadmap-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .roadmap-card-header {
          position: relative;
        }

        .roadmap-card-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .roadmap-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .roadmap-card {
            margin: 0 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;