import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  User, 
  LogOut, 
  Plus,
  Bell,
  Calendar,
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  CheckCircle,
  Shield,
  Mail,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/authAPI';
import { useTopicSearch } from '../hooks/useTopicSearch';
import { useApiKey } from '../hooks/useApiKey';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/dashboard.css';

// Helper function to calculate learning streak
const calculateStreak = (sessions) => {
  if (!sessions.length) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sessionDates = [...new Set(sessions.map(s => {
    const date = new Date(s.updatedAt);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }))].sort((a, b) => b - a);
  
  let streak = 0;
  for (let i = 0; i < sessionDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (sessionDates[i] === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Generate motivational tech puns
const getTechPun = () => {
  const puns = [
    { text: "Time to Debug Your Potential! 🐛", subtitle: "Let's squash some knowledge gaps together" },
    { text: "Ready to Compile Some Brilliance? ⚡", subtitle: "Your brain is the best IDE for learning" },
    { text: "Let's Cache Some Knowledge! 💾", subtitle: "Store these concepts in your long-term memory" },
    { text: "Time to Push Your Limits! 🚀", subtitle: "Git ready for an amazing learning session" },
    { text: "Ready to Parse Some Wisdom? 📚", subtitle: "Breaking down complex topics into digestible bits" },
    { text: "Let's Refactor Your Understanding! 🔧", subtitle: "Clean code, clean mind, clean learning" },
    { text: "Time to Optimize Your Brain! ⚡", subtitle: "Maximum learning efficiency loading..." },
    { text: "Ready to Stack Some Skills? 📚", subtitle: "Building your knowledge data structure" },
    { text: "Let's Initialize Your Growth! 🌱", subtitle: "constructor() { this.knowledge = new Map(); }" }
  ];
  
  return puns[Math.floor(Math.random() * puns.length)];
};

// Enhanced getTechPun with daily persistence
const getTechPunPersistent = () => {
  const puns = [
    { text: "Time to Debug Your Potential! 🐛", subtitle: "Let's squash some knowledge gaps together" },
    { text: "Ready to Compile Some Brilliance? ⚡", subtitle: "Your brain is the best IDE for learning" },
    { text: "Let's Cache Some Knowledge! 💾", subtitle: "Store these concepts in your long-term memory" },
    { text: "Time to Push Your Limits! 🚀", subtitle: "Git ready for an amazing learning session" },
    { text: "Ready to Parse Some Wisdom? 📚", subtitle: "Breaking down complex topics into digestible bits" },
    { text: "Let's Refactor Your Understanding! 🔧", subtitle: "Clean code, clean mind, clean learning" },
    { text: "Time to Optimize Your Brain! ⚡", subtitle: "Maximum learning efficiency loading..." },
    { text: "Ready to Stack Some Skills! 📚", subtitle: "Building your knowledge data structure" },
    { text: "Let's Initialize Your Growth! 🌱", subtitle: "constructor() { this.knowledge = new Map(); }" }
  ];
  
  try {
    // Check if we have a stored pun for today
    const storedPunData = localStorage.getItem('mindmelt_daily_pun');
    const today = new Date().toDateString(); // Get today's date as string
    
    if (storedPunData) {
      const { pun, date } = JSON.parse(storedPunData);
      
      // If the stored pun is from today, return it
      if (date === today) {
        return pun;
      }
    }
    
    // Generate a new pun for today
    const newPun = puns[Math.floor(Math.random() * puns.length)];
    
    // Store the new pun with today's date
    localStorage.setItem('mindmelt_daily_pun', JSON.stringify({
      pun: newPun,
      date: today
    }));
    
    return newPun;
    
  } catch (error) {
    // Fallback if localStorage is not available
    console.warn('localStorage not available, using random pun:', error);
    return puns[Math.floor(Math.random() * puns.length)];
  }
};

// Format member since date - handles Firestore timestamps
const formatMemberSinceDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    let date;
    
    // Handle Firestore timestamp objects
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
  const {
    currentUser, 
    isRegistered, 
    isAnonymous, 
    logout, 
    signupWithEmail,
    updateUser,
    getDisplayName
  } = useAuth();
  
  const [learningSessions, setLearningSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');
  const [dailySummary, setDailySummary] = useState(null);
  const [userLearningData, setUserLearningData] = useState(null);
  const [bellNotificationCount, setBellNotificationCount] = useState(0);
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradeName, setUpgradeName] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState(false);
  const [dailyPun, setDailyPun] = useState(null);

  const apiKeyManager = useApiKey();
  const topicSearch = useTopicSearch(apiKeyManager);

  // Fetch user's learning sessions (only for registered users)
  const fetchLearningSessions = useCallback(async () => {
    if (!isRegistered) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sessions = await api.getLearningHistory();
      setLearningSessions(sessions || []);
      
      // Transform sessions data for learning summary
      const transformedData = {
        sessions: sessions || [],
        questions: sessions?.flatMap(s => s.questions || []) || [],
        recentTopics: [...new Set(sessions?.slice(0, 10).map(s => s.topicName).filter(Boolean) || [])],
        strengths: [],
        weaknesses: [],
        totalTimeMinutes: Math.round((sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0) / 60),
        currentStreak: calculateStreak(sessions || [])
      };
      
      setUserLearningData(transformedData);
      
      // Calculate bell notification count (sessions completed yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const tomorrowYesterday = new Date(yesterday);
      tomorrowYesterday.setDate(tomorrowYesterday.getDate() + 1);
      
      const yesterdaysActivities = sessions.filter(session => {
        const sessionDate = new Date(session.updatedAt);
        return sessionDate >= yesterday && sessionDate < tomorrowYesterday && session.completed;
      });
      
      setBellNotificationCount(yesterdaysActivities.length);
      
    } catch (error) {
      console.error('Failed to fetch learning sessions:', error);
      setLearningSessions([]);
    } finally {
      setLoading(false);
    }
  }, [isRegistered]);

  // Clear username form when user updates
  useEffect(() => {
    if (usernameUpdateSuccess) {
      setNewUsername('');
    }
  }, [usernameUpdateSuccess]);

  useEffect(() => {
    fetchLearningSessions();
    // Initialize daily pun
    setDailyPun(getTechPunPersistent());
  }, [fetchLearningSessions]);

  // Show upgrade prompt for anonymous users after some time
  useEffect(() => {
    if (isAnonymous && !showUpgradePrompt) {
      const timer = setTimeout(() => {
        setShowUpgradePrompt(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isAnonymous, showUpgradePrompt]);

  const handleUpgradeAccount = async (e) => {
    e.preventDefault();
    if (!upgradeEmail.trim()) return;

    setIsUpgrading(true);
    try {
      await signupWithEmail(upgradeEmail, upgradeName);
      setShowUpgradePrompt(false);
    } catch (error) {
      console.error('Failed to upgrade account:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || savingUsername) return;
    
    setSavingUsername(true);
    try {
      const updatedUser = await api.updateProfile({ name: newUsername.trim() });
      
      if (updateUser && updatedUser) {
        updateUser(updatedUser);
      }
      
      setNewUsername('');
      setUsernameUpdateSuccess(true);
      setTimeout(() => setUsernameUpdateSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to update display name:', error);
      alert('Failed to update display name. Please try again.');
    } finally {
      setSavingUsername(false);
    }
  };

  // Generate daily summary when bell is clicked
  const generateDailySummary = useCallback(() => {
    if (!isRegistered) {
      setShowUpgradePrompt(true);
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const tomorrowYesterday = new Date(yesterday);
    tomorrowYesterday.setDate(tomorrowYesterday.getDate() + 1);
    
    const yesterdaysSessions = learningSessions.filter(session => {
      const sessionDate = new Date(session.updatedAt);
      return sessionDate >= yesterday && sessionDate < tomorrowYesterday;
    });
    
    const completedSessions = yesterdaysSessions.filter(s => s.completed);
    const totalSessions = yesterdaysSessions.length;
    const totalDuration = yesterdaysSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalQuestions = yesterdaysSessions.reduce((acc, s) => acc + (s.questionsAsked || 0), 0);
    const avgProgress = totalSessions > 0 
      ? Math.round(yesterdaysSessions.reduce((acc, s) => acc + (s.progress || 0), 0) / totalSessions)
      : 0;
    
    const summary = {
      date: yesterday.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      totalSessions,
      completedSessions: completedSessions.length,
      totalDuration,
      totalQuestions,
      avgProgress,
      sessions: yesterdaysSessions
    };
    
    setDailySummary(summary);
    setShowDailySummary(true);
    setBellNotificationCount(0);
  }, [learningSessions, isRegistered]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/start', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const startNewSession = () => {
    if (!selectedTopic || !learningPath) return;
    
    navigate('/learn', {
      state: {
        isNewSession: true,
        topicData: selectedTopic,
        learningPath: learningPath,
        questioningStyle: 'socratic'
      }
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const learningPaths = {
    conceptual: { 
      name: "Conceptual Track", 
      description: "Deep understanding of core concepts",
      icon: "🧠"
    },
    applied: { 
      name: "Applied Track", 
      description: "Practical implementation and examples",
      icon: "⚡"
    },
    comprehensive: { 
      name: "Comprehensive Track", 
      description: "Complete mastery with theory and practice",
      icon: "🎯"
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard-container-no-sidebar">
      {/* Header */}
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
              <div className={isRegistered ? "member-status" : "anonymous-status"}>
                {isRegistered ? (
                  `Member since ${formatMemberSinceDate(currentUser?.createdAt)}`
                ) : (
                  <>
                    <Shield size={12} />
                    Anonymous Session
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            {isRegistered && (
              <button
                onClick={() => setShowProfile(true)}
                className="profile-btn-header"
                title="Profile Settings"
              >
                <User size={18} />
              </button>
            )}
            
            {!isRegistered && (
              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="upgrade-btn-header"
              >
                <Sparkles size={16} />
                Create Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-header">
            <Brain size={48} className="welcome-icon" />
            <div>
              <h2>{dailyPun?.text || "Welcome to MindMelt!"}</h2>
              <p>{dailyPun?.subtitle || "Your AI-powered learning companion"}</p>
            </div>
          </div>
          
          <div className="quick-actions">
            <button
              onClick={() => setShowNewSession(true)}
              className="quick-action-btn primary"
            >
              <Sparkles size={24} />
              <div>
                <h4>Start Learning</h4>
                <p>Search any CS topic and begin an AI-powered learning session with personalized questions</p>
              </div>
            </button>
            
            <button
              onClick={generateDailySummary}
              className="quick-action-btn secondary"
            >
              <Calendar size={24} />
              <div>
                <h4>Yesterday's Summary</h4>
                <p>{isRegistered ? "View your learning progress and achievements from yesterday" : "Create account to track daily progress and insights"}</p>
              </div>
            </button>
          </div>
        </div>

        {/* New User Guidance - Show for users with no sessions */}
        {(!isRegistered || (isRegistered && learningSessions.length === 0)) && (
          <div className="activity-overview">
            <h3>🚀 Getting Started with MindMelt</h3>
            <div className="simple-activity">
              <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--gray-800)', marginBottom: '1rem', fontSize: '1.1rem' }}>Here's what you can do:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', minWidth: '1.5rem' }}>🔍</span>
                    <div>
                      <strong>Search & Learn:</strong> Type any computer science topic (like "binary trees" or "machine learning") and start an interactive learning session
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', minWidth: '1.5rem' }}>🤖</span>
                    <div>
                      <strong>AI-Powered Questions:</strong> Our AI asks you personalized questions to help you understand concepts deeply, not just memorize
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', minWidth: '1.5rem' }}>📈</span>
                    <div>
                      <strong>Track Progress:</strong> {isRegistered ? "Your sessions are automatically saved and you can resume anytime" : "Create an account to save your progress and track learning over time"}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', minWidth: '1.5rem' }}>🎯</span>
                    <div>
                      <strong>Choose Your Path:</strong> Select from conceptual, applied, or comprehensive learning approaches based on your goals
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowNewSession(true)}
                  style={{ minWidth: '180px' }}
                >
                  <Sparkles size={16} />
                  Start Your First Session
                </button>
                
                {!isRegistered && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowUpgradePrompt(true)}
                    style={{ minWidth: '180px' }}
                  >
                    <User size={16} />
                    Create Account
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Last Session Display - Only for registered users */}
        {isRegistered && learningSessions.length > 0 && (
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

        {/* Activity Overview - Only show if user is registered and has sessions */}
        {isRegistered && learningSessions.length > 0 && (
          <div className="activity-overview">
            <h3>Recent Learning Activity</h3>
            <div className="simple-activity">
              <p>
                You've completed {learningSessions.filter(s => s.completed).length} out of {learningSessions.length} sessions
                with an average completion rate of {Math.round((learningSessions.filter(s => s.completed).length / Math.max(learningSessions.length, 1)) * 100)}%.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewSession(true)}
              >
                <Plus size={16} />
                Start New Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Account Modal */}
      {showUpgradePrompt && (
        <div className="modal-overlay" onClick={() => setShowUpgradePrompt(false)}>
          <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">✨</span>
                <div>
                  <h2>Unlock Your Full Learning Potential</h2>
                  <p>Save your progress and access advanced features</p>
                </div>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setShowUpgradePrompt(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="upgrade-benefits">
                <h3>What you'll get:</h3>
                <ul>
                  <li>📊 Detailed learning analytics and progress tracking</li>
                  <li>🎯 Personalized learning recommendations</li>
                  <li>🏆 Achievement badges and learning streaks</li>
                  <li>📱 Access your progress from any device</li>
                  <li>💾 Automatic session saving and resume</li>
                  <li>📈 Advanced learning insights and reports</li>
                </ul>
              </div>

              <form onSubmit={handleUpgradeAccount} className="upgrade-form">
                <div className="form-group">
                  <label htmlFor="upgrade-name">
                    <User size={16} />
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    id="upgrade-name"
                    value={upgradeName}
                    onChange={(e) => setUpgradeName(e.target.value)}
                    placeholder="What should we call you?"
                    className="form-input"
                    disabled={isUpgrading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="upgrade-email">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="upgrade-email"
                    value={upgradeEmail}
                    onChange={(e) => setUpgradeEmail(e.target.value)}
                    placeholder="Enter your email to create account"
                    className="form-input"
                    disabled={isUpgrading}
                    required
                  />
                </div>

                <div className="upgrade-actions">
                  <button
                    type="button"
                    onClick={() => setShowUpgradePrompt(false)}
                    className="btn btn-secondary"
                    disabled={isUpgrading}
                  >
                    Continue as Anonymous
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpgrading || !upgradeEmail.trim()}
                  >
                    {isUpgrading ? (
                      <>
                        <div className="spinner" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Create My Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Daily Summary Modal */}
      {showDailySummary && dailySummary && (
        <div className="modal-overlay" onClick={() => setShowDailySummary(false)}>
          <div className="modal-content daily-summary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">📊</span>
                <div>
                  <h2>Your Daily Learning Summary</h2>
                  <p>{dailySummary.date}</p>
                </div>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setShowDailySummary(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {dailySummary.totalSessions > 0 ? (
                <div className="ai-summary-content">
                  <div className="summary-text">
                    <p><strong>Sessions:</strong> {dailySummary.totalSessions} started, {dailySummary.completedSessions} completed</p>
                    <p><strong>Time Spent:</strong> {formatDuration(dailySummary.totalDuration)}</p>
                    <p><strong>Average Progress:</strong> {dailySummary.avgProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="ai-summary-content">
                  <div className="summary-text">
                    <p>No learning sessions yesterday. Ready to start today?</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowDailySummary(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDailySummary(false);
                  setShowNewSession(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showNewSession && (
        <div className="modal-overlay" onClick={() => setShowNewSession(false)}>
          <div className="modal-content new-session-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">✨</span>
                <div>
                  <h2>Start New Learning Session</h2>
                  <p>Search for any computer science topic to begin</p>
                </div>
              </div>
              <button 
                className="modal-close" 
                onClick={() => setShowNewSession(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <label className="form-label">
                  <Brain size={18} />
                  Search for a Computer Science Topic
                </label>
                
                <SearchBar
                  searchQuery={topicSearch.searchQuery}
                  setSearchQuery={topicSearch.setSearchQuery}
                  searchResults={topicSearch.searchResults}
                  onSelectTopic={setSelectedTopic}
                  selectedTopic={selectedTopic}
                  isSearching={topicSearch.isSearching}
                  searchError={topicSearch.searchError}
                  hasSearched={topicSearch.hasSearched}
                  performSearch={topicSearch.performSearch}
                  clearSearch={topicSearch.clearSearch}
                  hideSuggestions={topicSearch.hideSuggestions}
                  showSuggestions={topicSearch.showSuggestions}
                />

                {selectedTopic && (
                  <div className="selected-topic-preview">
                    <div className="topic-preview-header">
                      <span className="topic-icon">{selectedTopic.icon}</span>
                      <div className="topic-info">
                        <h4>{selectedTopic.name}</h4>
                        <p>{selectedTopic.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <label className="form-label">Choose your learning approach</label>
                <div className="learning-paths-grid">
                  {Object.entries(learningPaths).map(([key, path]) => (
                    <div
                      key={key}
                      className={`path-option ${learningPath === key ? 'selected' : ''}`}
                      onClick={() => setLearningPath(key)}
                    >
                      <span className="path-icon">{path.icon}</span>
                      <div className="path-content">
                        <h4>{path.name}</h4>
                        <p>{path.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowNewSession(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={startNewSession}
                className="btn btn-primary"
                disabled={!selectedTopic || !learningPath}
              >
                <Sparkles size={16} />
                Start Learning Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal - Only for registered users */}
      {showProfile && isRegistered && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">👤</span>
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
                <p>Choose how you want to be addressed in MindMelt. This username will appear on your dashboard and learning sessions.</p>
                
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
                    ✅ Username updated successfully!
                  </div>
                )}
              </div>
              
              <div className="profile-section">
                <h3>Account Information</h3>
                <div className="profile-fields">
                  <div className="profile-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={currentUser?.name || currentUser?.username || ''}
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