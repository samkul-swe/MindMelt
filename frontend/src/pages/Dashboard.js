// ============================================================================
// pages/Dashboard.js - Dashboard with Daily Summary Bell
// ============================================================================

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
  Settings,
  ChevronRight,
  Trophy,
  Clock,
  CheckCircle,
  Star,
  Zap
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [learningSessions, setLearningSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');
  const [dailySummary, setDailySummary] = useState(null);
  const [userLearningData, setUserLearningData] = useState(null);
  const [bellNotificationCount, setBellNotificationCount] = useState(0);

  const apiKeyManager = useApiKey();
  const topicSearch = useTopicSearch(apiKeyManager);

  // Fetch user's learning sessions
  const fetchLearningSessions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchLearningSessions();
  }, [fetchLearningSessions]);

  // Generate daily summary when bell is clicked
  const generateDailySummary = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const tomorrowYesterday = new Date(yesterday);
    tomorrowYesterday.setDate(tomorrowYesterday.getDate() + 1);
    
    // Filter sessions from yesterday
    const yesterdaysSessions = learningSessions.filter(session => {
      const sessionDate = new Date(session.updatedAt);
      return sessionDate >= yesterday && sessionDate < tomorrowYesterday;
    });
    
    // Calculate summary stats
    const completedSessions = yesterdaysSessions.filter(s => s.completed);
    const totalSessions = yesterdaysSessions.length;
    const totalDuration = yesterdaysSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalQuestions = yesterdaysSessions.reduce((acc, s) => acc + (s.questionsAsked || 0), 0);
    const avgProgress = totalSessions > 0 
      ? Math.round(yesterdaysSessions.reduce((acc, s) => acc + (s.progress || 0), 0) / totalSessions)
      : 0;
    
    // Group by topics
    const topicStats = {};
    yesterdaysSessions.forEach(session => {
      if (!topicStats[session.topicName]) {
        topicStats[session.topicName] = {
          count: 0,
          duration: 0,
          avgProgress: 0,
          category: session.category,
          difficulty: session.difficulty
        };
      }
      topicStats[session.topicName].count++;
      topicStats[session.topicName].duration += session.duration || 0;
      topicStats[session.topicName].avgProgress += session.progress || 0;
    });
    
    // Calculate averages for topics
    Object.keys(topicStats).forEach(topic => {
      topicStats[topic].avgProgress = Math.round(topicStats[topic].avgProgress / topicStats[topic].count);
    });
    
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
      topicStats,
      sessions: yesterdaysSessions,
      achievements: generateAchievements(yesterdaysSessions, completedSessions.length)
    };
    
    setDailySummary(summary);
    setShowDailySummary(true);
    setBellNotificationCount(0); // Clear notification after viewing
  }, [learningSessions]);

  // Generate achievements based on yesterday's activity
  const generateAchievements = (sessions, completed) => {
    const achievements = [];
    
    if (completed >= 3) {
      achievements.push({
        icon: '🔥',
        title: 'On Fire!',
        description: `Completed ${completed} learning sessions`
      });
    } else if (completed >= 1) {
      achievements.push({
        icon: '⭐',
        title: 'Consistent Learner',
        description: `Completed ${completed} session${completed > 1 ? 's' : ''}`
      });
    }
    
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    if (totalDuration >= 1800) { // 30+ minutes
      achievements.push({
        icon: '⏰',
        title: 'Time Master',
        description: `Spent ${Math.round(totalDuration / 60)} minutes learning`
      });
    }
    
    const uniqueTopics = [...new Set(sessions.map(s => s.topicName))];
    if (uniqueTopics.length >= 3) {
      achievements.push({
        icon: '🌟',
        title: 'Topic Explorer',
        description: `Explored ${uniqueTopics.length} different topics`
      });
    }
    
    return achievements;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
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
    <div className="dashboard-container">
      {/* Left Sidebar - User Profile & Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <Brain className="logo-icon" />
            <h2>MindMelt</h2>
          </div>
        </div>

        <div className="user-profile-section">
          <div className="user-avatar">
            <User size={24} />
          </div>
          <div className="user-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <span className="member-since">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        <div className="sidebar-stats">
          <div className="stat-item">
            <BookOpen size={20} />
            <div>
              <span className="stat-number">{learningSessions.length}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
          </div>
          <div className="stat-item">
            <Clock size={20} />
            <div>
              <span className="stat-number">
                {userLearningData?.currentStreak || 0}
              </span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
          <div className="stat-item">
            <TrendingUp size={20} />
            <div>
              <span className="stat-number">
                {Math.round(learningSessions.reduce((acc, s) => acc + (s.progress || 0), 0) / Math.max(learningSessions.length, 1))}%
              </span>
              <span className="stat-label">Avg Progress</span>
            </div>
          </div>
        </div>

        <div className="sidebar-actions">
          <button
            onClick={() => setShowProfile(true)}
            className="sidebar-btn"
          >
            <Settings size={18} />
            Profile Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <div className="header-actions">
            {/* Daily Summary Bell */}
              <button
                onClick={generateDailySummary}
                className={`bell-button ${bellNotificationCount > 0 ? 'has-notification' : ''}`}
                title="View yesterday's learning summary"
              >
              <Bell size={20} />
              {bellNotificationCount > 0 && (
                <span className="notification-badge">{bellNotificationCount}</span>
              )}
            </button>
            <button
              onClick={() => setShowNewSession(true)}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Start New Session
            </button>
          </div>
        </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <div className="welcome-section">
          <div className="welcome-card">
          <div className="welcome-header">
            <Brain size={48} className="welcome-icon" />
            <div>
              <h2>{getTechPun().text}</h2>
              <p>{getTechPun().subtitle}</p>
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
                  <p>Begin a new CS topic session</p>
                </div>
              </button>
              
              <button
                onClick={generateDailySummary}
                className="quick-action-btn secondary"
              >
                <Trophy size={24} />
                <div>
                  <h4>Yesterday's Summary</h4>
                  <p>See what you accomplished</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Last Session Display */}
        {learningSessions.length > 0 && (
          <div className="last-session-section">
            <h3>Continue Your Journey</h3>
            <div className="last-session-card">
              <div className="session-header">
                <div className="session-icon">
                  <BookOpen size={24} />
                </div>
                <div className="session-info">
                  <h4>Last Session: {learningSessions[0].topicName}</h4>
                  <p className="session-meta">
                    {learningSessions[0].category} • {learningSessions[0].difficulty} • 
                    {Math.round(learningSessions[0].progress || 0)}% complete
                  </p>
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

          {/* Recent Activity Overview */}
          <div className="activity-overview">
            <h3>Recent Learning Activity</h3>
            <div className="activity-grid">
              <div className="activity-stat">
                <div className="stat-icon">
                  <Calendar size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {learningSessions.filter(s => {
                      const sessionDate = new Date(s.updatedAt);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return sessionDate >= today;
                    }).length}
                  </span>
                  <span className="stat-label">Today's Sessions</span>
                </div>
              </div>
              
              <div className="activity-stat">
                <div className="stat-icon">
                  <Zap size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {learningSessions.filter(s => {
                      const sessionDate = new Date(s.updatedAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return sessionDate >= weekAgo;
                    }).length}
                  </span>
                  <span className="stat-label">This Week</span>
                </div>
              </div>
              
              <div className="activity-stat">
                <div className="stat-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {Math.round((learningSessions.filter(s => s.completed).length / Math.max(learningSessions.length, 1)) * 100)}%
                  </span>
                  <span className="stat-label">Completion Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summary Modal */}
      {showDailySummary && dailySummary && (
        <div className="modal-overlay" onClick={() => setShowDailySummary(false)}>
          <div className="modal-content daily-summary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">📊</span>
                <div>
                  <h2>Daily Learning Summary</h2>
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
              <div className="summary-stats">
                <div className="summary-stat">
                  <div className="stat-icon">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <span className="stat-number">{dailySummary.totalSessions}</span>
                    <span className="stat-label">Sessions Started</span>
                  </div>
                </div>
                
                <div className="summary-stat">
                  <div className="stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <span className="stat-number">{dailySummary.completedSessions}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
                
                <div className="summary-stat">
                  <div className="stat-icon">
                    <Clock size={24} />
                  </div>
                  <div>
                    <span className="stat-number">{formatDuration(dailySummary.totalDuration)}</span>
                    <span className="stat-label">Time Spent</span>
                  </div>
                </div>
                
                <div className="summary-stat">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="stat-number">{dailySummary.avgProgress}%</span>
                    <span className="stat-label">Avg Progress</span>
                  </div>
                </div>
              </div>

              {dailySummary.achievements.length > 0 && (
                <div className="achievements-section">
                  <h3>🏆 Achievements Unlocked</h3>
                  <div className="achievements-grid">
                    {dailySummary.achievements.map((achievement, index) => (
                      <div key={index} className="achievement-card">
                        <span className="achievement-icon">{achievement.icon}</span>
                        <div>
                          <h4>{achievement.title}</h4>
                          <p>{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(dailySummary.topicStats).length > 0 && (
                <div className="topics-section">
                  <h3>📚 Topics Covered</h3>
                  <div className="topics-list">
                    {Object.entries(dailySummary.topicStats).map(([topic, stats]) => (
                      <div key={topic} className="topic-summary">
                        <div className="topic-info">
                          <h4>{topic}</h4>
                          <span className="topic-category">{stats.category}</span>
                        </div>
                        <div className="topic-stats">
                          <span>{stats.count} session{stats.count > 1 ? 's' : ''}</span>
                          <span>{formatDuration(stats.duration)}</span>
                          <span>{stats.avgProgress}% progress</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dailySummary.totalSessions === 0 && (
                <div className="empty-summary">
                  <Bell size={48} className="empty-icon" />
                  <h3>No Activity Yesterday</h3>
                  <p>You didn't have any learning sessions yesterday. Ready to start today?</p>
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

      {/* New Session Modal - Keep existing modal */}
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

      {/* Profile Modal - Keep existing modal */}
      {showProfile && (
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
              <div className="profile-section">
                <h3>Account Information</h3>
                <div className="profile-fields">
                  <div className="profile-field">
                    <label>Full Name</label>
                    <input type="text" value={user?.name || ''} readOnly />
                  </div>
                  <div className="profile-field">
                    <label>Email Address</label>
                    <input type="email" value={user?.email || ''} readOnly />
                  </div>
                  <div className="profile-field">
                    <label>Member Since</label>
                    <input 
                      type="text" 
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
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