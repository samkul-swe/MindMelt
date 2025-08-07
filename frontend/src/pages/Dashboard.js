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
  ChevronRight,
  Key,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authAPI';
import aiAPI from '../services/aiAPI';
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

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [testingEnvKey, setTestingEnvKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState(null);
  const [envKeyTestResult, setEnvKeyTestResult] = useState(null);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

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
    if (e) e.preventDefault();
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

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setSavingApiKey(true);
    setApiKeyTestResult(null);
    
    try {
      console.log('🔧 Frontend: Saving API key...');
      await authAPI.setApiKey(apiKey.trim());
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 3000);
      
      console.log('🔧 Frontend: NOT auto-testing after save to avoid double calls');
    } catch (error) {
      console.error('Failed to save API key:', error);
      setApiKeyTestResult({
        success: false,
        message: `Failed to save API key: ${error.message}`
      });
    } finally {
      setSavingApiKey(false);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyTestResult({
        success: false,
        message: 'Please enter an API key to test'
      });
      return;
    }
    
    console.log('🧪 Frontend: Starting API key test...');
    setTestingApiKey(true);
    setApiKeyTestResult(null);
    
    try {
      console.log('📞 Frontend: Making single test API call...');
      const result = await aiAPI.testApiKey(apiKey.trim());
      console.log('✅ Frontend: Test completed, result:', result);
      setApiKeyTestResult(result);
    } catch (error) {
      console.error('❌ Frontend: Test failed with error:', error);
      setApiKeyTestResult({
        success: false,
        message: `Test failed: ${error.message}`
      });
    } finally {
      console.log('🏁 Frontend: Test finished, setting testingApiKey to false');
      setTestingApiKey(false);
    }
  };

  const handleTestEnvironmentKey = async () => {
    console.log('🧪 Frontend: Starting environment key test...');
    setTestingEnvKey(true);
    setEnvKeyTestResult(null);
    
    try {
      console.log('📞 Frontend: Making environment key test call...');
      const result = await aiAPI.testEnvironmentApiKey();
      console.log('✅ Frontend: Environment test completed, result:', result);
      setEnvKeyTestResult(result);
    } catch (error) {
      console.error('❌ Frontend: Environment test failed:', error);
      setEnvKeyTestResult({
        success: false,
        message: `Environment key test failed: ${error.message}`
      });
    } finally {
      console.log('🏁 Frontend: Environment test finished');
      setTestingEnvKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      await authAPI.removeApiKey();
      setApiKey('');
      setApiKeyTestResult(null);
      alert('API key removed successfully!');
    } catch (error) {
      console.error('Failed to remove API key:', error);
      alert('Failed to remove API key. Please try again.');
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
                
                <div className="username-edit-form">
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
                  <div className="username-button-wrapper">
                    <button
                      type="button"
                      onClick={handleSaveUsername}
                      className="btn btn-primary btn-sm"
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
                          Update Username
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {usernameUpdateSuccess && (
                  <div className="username-success-message">
                    <CheckCircle size={16} />
                    Username updated successfully!
                  </div>
                )}
              </div>

              <div className="api-key-section">
                <h4>
                  <Key size={16} />
                  AI API Key Settings
                </h4>
                <p>Configure your Google Gemini API key for AI-powered learning features.</p>
                
                <div className="api-key-input-group">
                  <label htmlFor="api-key">Google Gemini API Key</label>
                  <div className="api-key-input-wrapper">
                    <input
                      type={showApiKey ? "text" : "password"}
                      id="api-key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSyC..."
                      disabled={savingApiKey || testingApiKey}
                    />
                    <button
                      type="button"
                      className="toggle-visibility-btn"
                      onClick={() => setShowApiKey(!showApiKey)}
                      title={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="api-key-actions">
                  <button
                    onClick={handleSaveApiKey}
                    className="btn btn-primary btn-sm"
                    disabled={!apiKey.trim() || savingApiKey}
                  >
                    {savingApiKey ? (
                      <>
                        <div className="spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Save Key
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleTestApiKey}
                    className="btn btn-secondary btn-sm"
                    disabled={!apiKey.trim() || testingApiKey}
                  >
                    {testingApiKey ? (
                      <>
                        <div className="spinner" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube size={14} />
                        Test Key
                      </>
                    )}
                  </button>

                  {apiKey.trim() && (
                    <button
                      onClick={handleRemoveApiKey}
                      className="btn btn-danger btn-sm"
                    >
                      Remove Key
                    </button>
                  )}
                </div>

                {apiKeySaved && (
                  <div className="api-key-success-message">
                    <CheckCircle size={16} />
                    API key saved successfully!
                  </div>
                )}

                {apiKeyTestResult && (
                  <div className={`api-test-result ${apiKeyTestResult.success ? 'success' : 'error'}`}>
                    <div className="test-result-header">
                      {apiKeyTestResult.success ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span>API Key Test Result</span>
                    </div>
                    <p>{apiKeyTestResult.message}</p>
                    {apiKeyTestResult.debug && (
                      <details className="test-debug-details">
                        <summary>Debug Information</summary>
                        <pre>{JSON.stringify(apiKeyTestResult.debug, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="env-key-testing">
                  <h5>
                    <AlertCircle size={14} />
                    Test Environment API Key
                  </h5>
                  <p>
                    Check if the server has GEMINI_API_KEY configured (for admins/developers)
                  </p>
                  
                  <button
                    onClick={handleTestEnvironmentKey}
                    className="btn btn-outline btn-sm"
                    disabled={testingEnvKey}
                  >
                    {testingEnvKey ? (
                      <>
                        <div className="spinner" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube size={14} />
                        Test Environment Key
                      </>
                    )}
                  </button>

                  {envKeyTestResult && (
                    <div className={`api-test-result ${envKeyTestResult.success ? 'success' : 'error'}`}>
                      <div className="test-result-header">
                        {envKeyTestResult.success ? (
                          <CheckCircle size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        <span>Environment Key Test</span>
                      </div>
                      <p>{envKeyTestResult.message}</p>
                      {envKeyTestResult.debug && (
                        <details className="test-debug-details">
                          <summary>Debug Information</summary>
                          <pre>{JSON.stringify(envKeyTestResult.debug, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>

                <div className="api-key-help">
                  <h5>Need an API Key?</h5>
                  <p>
                    Get your free Google Gemini API key from{' '}
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
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

        /* Profile Modal Styling */
        .profile-modal {
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .username-edit-section,
        .api-key-section,
        .profile-section {
          margin-bottom: 2rem;
        }

        .api-key-section {
          padding-top: 2rem;
          border-top: 1px solid #E5E5E5;
        }

        .profile-section {
          padding-top: 2rem;
          border-top: 1px solid #E5E5E5;
        }

        .api-key-section h4,
        .username-edit-section h4,
        .profile-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: #262626;
          font-size: 1.1rem;
        }

        .api-key-section p,
        .username-edit-section p {
          color: #525252;
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
        }

        /* Username Form Layout */
        .username-edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .username-input-group {
          width: 100%;
        }

        .username-button-wrapper {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .username-input-group label,
        .api-key-input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #404040;
          font-size: 0.9rem;
        }

        .username-input-group input,
        .api-key-input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #E5E5E5;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .username-input-group input:focus,
        .api-key-input-wrapper input:focus {
          outline: none;
          border-color: #FF6B35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        /* API Key Input */
        .api-key-input-group {
          margin-bottom: 1rem;
        }

        .api-key-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .api-key-input-wrapper input {
          padding-right: 3rem;
        }

        .toggle-visibility-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #737373;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-visibility-btn:hover {
          color: #404040;
          background: #F5F5F5;
        }

        .api-key-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        /* Button Styles */
        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-decoration: none;
        }

        .btn-primary {
          background: #FF6B35;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #E55A2B;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #E5E5E5;
          color: #404040;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #D4D4D4;
        }

        .btn-outline {
          background: white;
          color: #FF6B35;
          border: 2px solid #FF6B35;
        }

        .btn-outline:hover:not(:disabled) {
          background: #FF6B35;
          color: white;
        }

        .btn-danger {
          background: #EF4444;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #DC2626;
        }

        .btn-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Success Messages */
        .api-key-success-message,
        .username-success-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f0f9f4;
          color: #15803d;
          border-radius: 8px;
          margin-top: 1rem;
          border: 1px solid #bbf7d0;
          font-size: 0.9rem;
        }

        /* Test Results */
        .api-test-result {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid;
        }

        .api-test-result.success {
          background: #f0f9f4;
          border-color: #bbf7d0;
          color: #15803d;
        }

        .api-test-result.error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .test-result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .test-result-header + p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .test-debug-details {
          margin-top: 0.75rem;
        }

        .test-debug-details summary {
          cursor: pointer;
          font-size: 0.85rem;
          color: #525252;
          margin-bottom: 0.5rem;
          padding: 0.25rem 0;
        }

        .test-debug-details summary:hover {
          color: #262626;
        }

        .test-debug-details pre {
          background: rgba(0, 0, 0, 0.05);
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          margin: 0;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Environment Key Testing */
        .env-key-testing {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E5E5E5;
        }

        .env-key-testing h5 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.5rem 0;
          color: #262626;
          font-size: 1rem;
        }

        .env-key-testing p {
          margin: 0 0 1rem 0;
          color: #525252;
          font-size: 0.85rem;
        }

        /* API Key Help */
        .api-key-help {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .api-key-help h5 {
          margin: 0 0 0.5rem 0;
          color: #262626;
          font-size: 0.95rem;
        }

        .api-key-help p {
          margin: 0;
          color: #525252;
          font-size: 0.85rem;
        }

        .api-key-help a {
          color: #FF6B35;
          text-decoration: none;
          font-weight: 500;
        }

        .api-key-help a:hover {
          text-decoration: underline;
        }

        /* Profile Fields */
        .profile-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
        }

        .profile-field label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #404040;
          font-size: 0.9rem;
        }

        .profile-field input {
          padding: 0.75rem 1rem;
          border: 2px solid #E5E5E5;
          border-radius: 8px;
          background: #FAFAFA;
          color: #525252;
          font-size: 0.9rem;
        }

        /* Loading Spinner */
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .roadmap-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .roadmap-card {
            margin: 0 0.5rem;
          }

          .username-edit-form {
            gap: 1rem;
          }

          .username-button-wrapper {
            justify-content: stretch;
          }

          .username-button-wrapper .btn {
            width: 100%;
            justify-content: center;
          }

          .api-key-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .api-key-actions .btn {
            width: 100%;
            justify-content: center;
          }

          .modal-content {
            margin: 1rem;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
