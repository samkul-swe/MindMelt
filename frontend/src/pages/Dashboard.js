import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  User, 
  LogOut, 
  Plus,
  Target,
  BookOpen,
  Clock,
  Save,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/authAPI';
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
  const { currentUser, isAuthenticated, logout, updateUser, getDisplayName } = useAuth();
  
  const [learningSessions, setLearningSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState(false);
  const [dailyPun, setDailyPun] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  const fetchLearningSessions = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sessions = await api.getLearningHistory();
      setLearningSessions(sessions || []);
    } catch (error) {
      console.error('Failed to fetch learning sessions:', error);
      setLearningSessions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (usernameUpdateSuccess) {
      setNewUsername('');
    }
  }, [usernameUpdateSuccess]);

  useEffect(() => {
    fetchLearningSessions();
    setDailyPun(getTechPunPersistent());

    const allProgress = {};
    Object.keys(roadmapTopics).forEach(roadmapId => {
      allProgress[roadmapId] = getUserProgress(roadmapId);
    });
    setUserProgress(allProgress);
  }, [fetchLearningSessions]);

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || savingUsername) return;
    
    setSavingUsername(true);
    try {
      const updatedUser = await api.updateProfile({ username: newUsername.trim() });
      
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
    navigate(`/roadmap/${roadmapData.roadmapId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#2ECC71';
      case 'Intermediate': return '#F39C12';
      case 'Advanced': return '#E74C3C';
      case 'Expert': return '#9B59B6';
      default: return '#95A5A6';
    }
  };

  if (loading) {
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
              <h4 style={{ color: 'var(--gray-800)', marginBottom: '1rem', fontSize: '1.1rem' }}>Select a structured learning path:</h4>
              <div className="roadmap-grid">
                <div 
                  className="roadmap-card dsa-fundamentals"
                  onClick={() => {
                    handleRoadmapClick({
                      name: "Data Structures & Algorithms Fundamentals",
                      description: "Master the core concepts of DSA from basics to advanced topics",
                      category: "Programming Fundamentals",
                      difficulty: "Beginner to Advanced",
                      roadmapId: "dsa-fundamentals"
                    });
                  }}
                >
                  <div className="roadmap-card-header">
                    <div className="roadmap-icon-container">
                      <span className="roadmap-icon">DSA</span>
                    </div>
                    <div className="roadmap-title-section">
                      <h5 className="roadmap-title">DSA Fundamentals</h5>
                      <p className="roadmap-category">Programming Fundamentals</p>
                    </div>
                    <div className="roadmap-action">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                  <p className="roadmap-description">Master core data structures and algorithms from basics to advanced topics</p>
                  <div className="roadmap-meta">
                    <span className="meta-item">
                      <BookOpen size={14} />
                      15 Topics
                    </span>
                    <span className="meta-item">
                      <Clock size={14} />
                      8-12 weeks
                    </span>
                  </div>
                  <div className="difficulty-badge">
                    <Target size={12} />
                    Beginner to Advanced
                  </div>
                </div>

                <div 
                  className="roadmap-card web-development"
                  onClick={() => {
                    handleRoadmapClick({
                      name: "Complete Web Development",
                      description: "From HTML basics to full-stack web applications",
                      category: "Web Development",
                      difficulty: "Beginner to Advanced",
                      roadmapId: "web-development"
                    });
                  }}
                >
                  <div className="roadmap-card-header">
                    <div className="roadmap-icon-container">
                      <span className="roadmap-icon">WEB</span>
                    </div>
                    <div className="roadmap-title-section">
                      <h5 className="roadmap-title">Web Development</h5>
                      <p className="roadmap-category">Web Development</p>
                    </div>
                    <div className="roadmap-action">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                  <p className="roadmap-description">Complete web development from HTML basics to full-stack applications</p>
                  <div className="roadmap-meta">
                    <span className="meta-item">
                      <BookOpen size={14} />
                      14 Topics
                    </span>
                    <span className="meta-item">
                      <Clock size={14} />
                      12-16 weeks
                    </span>
                  </div>
                  <div className="difficulty-badge">
                    <Target size={12} />
                    Beginner to Advanced
                  </div>
                </div> 
              </div>
            </div>
            
            {!isAuthenticated && (
              <div style={{ textAlign: 'center', padding: '1rem', background: 'linear-gradient(135deg, #FFF4E6 0%, #FFE4B5 100%)', borderRadius: '0.75rem', border: '2px solid var(--accent-light)' }}>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
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
    </div>
  );
};

export default Dashboard;