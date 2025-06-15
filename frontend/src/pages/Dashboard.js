// ============================================================================
// pages/Dashboard.js - Main Dashboard with User Profile and Learning Sessions
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  User, 
  LogOut, 
  Plus,
  Play,
  Pause,
  Clock,
  Calendar,
  TrendingUp,
  Target,
  BookOpen,
  RotateCcw,
  Trash2,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/authAPI';
import { useTopicSearch } from '../hooks/useTopicSearch';
import { useApiKey } from '../hooks/useApiKey';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [learningSessions, setLearningSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');

  const apiKeyManager = useApiKey();
  const topicSearch = useTopicSearch(apiKeyManager);

  // Fetch user's learning sessions
  const fetchLearningSessions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchLearningSessions();
  }, [fetchLearningSessions]);

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
    
    // Navigate to learning session with topic data
    navigate('/learn', {
      state: {
        isNewSession: true,
        topicData: selectedTopic,
        learningPath: learningPath,
        questioningStyle: 'socratic'
      }
    });
  };

  const continueSession = (session) => {
    navigate(`/learn/${session.id}`, {
      state: { sessionData: session }
    });
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this learning session?')) {
      return;
    }

    try {
      await api.deleteLearningSession(sessionId);
      setLearningSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 50) return '#F59E0B';
    return '#EF4444';
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
              <span className="stat-label">Sessions</span>
            </div>
          </div>
          <div className="stat-item">
            <Target size={20} />
            <div>
              <span className="stat-number">
                {learningSessions.filter(s => s.completed).length}
              </span>
              <span className="stat-label">Completed</span>
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
          <button
            onClick={handleLogout}
            className="sidebar-btn logout-btn"
          >
            <LogOut size={18} />
            Sign Out
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
          <button
            onClick={() => setShowNewSession(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Start New Session
          </button>
        </div>

        {/* Learning Sessions */}
        <div className="sessions-section">
          <div className="section-header">
            <h2>Your Learning Sessions</h2>
            <span className="session-count">{learningSessions.length} sessions</span>
          </div>

          {learningSessions.length === 0 ? (
            <div className="empty-state">
              <Brain size={64} className="empty-icon" />
              <h3>No learning sessions yet</h3>
              <p>Start your first MindMelt session to begin your journey!</p>
              <button
                onClick={() => setShowNewSession(true)}
                className="btn btn-primary"
              >
                <Sparkles size={20} />
                Create Your First Session
              </button>
            </div>
          ) : (
            <div className="sessions-grid">
              {learningSessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <div className="session-info">
                      <h3>{session.topicName}</h3>
                      <div className="session-meta">
                        <span className="category">{session.category}</span>
                        <span 
                          className="difficulty"
                          style={{ color: getDifficultyColor(session.difficulty) }}
                        >
                          {session.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="session-actions">
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="action-btn delete-btn"
                        title="Delete session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="session-progress">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span style={{ color: getProgressColor(session.progress) }}>
                        {session.progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${session.progress}%`,
                          backgroundColor: getProgressColor(session.progress)
                        }}
                      />
                    </div>
                  </div>

                  <div className="session-details">
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="learning-path-indicator">
                        {learningPaths[session.learningPath]?.icon} {learningPaths[session.learningPath]?.name}
                      </span>
                    </div>
                  </div>

                  <div className="session-footer">
                    <span className={`status-badge ${session.completed ? 'completed' : 'in-progress'}`}>
                      {session.completed ? 'Completed' : 'In Progress'}
                    </span>
                    <button
                      onClick={() => continueSession(session)}
                      className="btn btn-secondary btn-sm"
                    >
                      {session.completed ? 'Review' : 'Continue'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

      {/* Profile Modal */}
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