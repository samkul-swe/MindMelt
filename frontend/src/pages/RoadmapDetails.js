import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Target,
  BookOpen,
  Play,
  CheckCircle,
  Shield,
  Award,
  Star,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import dataAPI from '../services/dataAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/roadmap-details.css';

// Mock user progress data - replace with API call later
const getUserProgress = (roadmapId) => {
  const mockProgress = {
    "dsa-fundamentals": {
      1: { completed: false, progress: 75, unlocked: true, started: true, canAdvance: true },
      2: { completed: false, progress: 35, unlocked: true, started: true, canAdvance: false },
      3: { completed: false, progress: 0, unlocked: true, started: false, canAdvance: false },
      4: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      5: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false }
    }
  };
  
  return mockProgress[roadmapId] || {};
};

// Calculate overall roadmap progress
const calculateRoadmapProgress = (progress) => {
  const topics = Object.values(progress);
  if (topics.length === 0) return 0;
  const totalProgress = topics.reduce((sum, topic) => sum + topic.progress, 0);
  return Math.round(totalProgress / topics.length);
};

const RoadmapDetails = () => {
  const navigate = useNavigate();
  const { roadmapId } = useParams();
  const { currentUser, isAuthenticated, getDisplayName } = useAuth();
  
  const [roadmapData, setRoadmapData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoadmapData();
  }, [roadmapId, currentUser]);

  const loadRoadmapData = async () => {
    try {
      setLoading(true);
      
      const roadmap = await dataAPI.getRoadmapTopics(roadmapId);
      const roadmapTopics = roadmap.topics;
      const progress = getUserProgress(roadmapId);
      
      if (!roadmap) {
        setError('Roadmap not found');
        return;
      }
      
      setRoadmapData(roadmap.details);
      setTopics(roadmapTopics);
      setUserProgress(progress);
      
    } catch (error) {
      console.error('Error loading roadmap data:', error);
      setError('Failed to load roadmap data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = async (topic) => {
    const topicProgress = userProgress[topic.id];
    
    // Check if topic is unlocked
    if (!topicProgress?.unlocked) {
      console.log('Topic is locked:', topic.name);
      return;
    }
    
    console.log('Starting topic:', topic.name, 'with progress:', topicProgress);
    
    // Update progress in backend if authenticated
    if (isAuthenticated && currentUser?.id && !topicProgress.started) {
      try {
        // Update topic progress via API
        // await api.updateUserProgress(roadmapId, topic.id, topicProgress.progress || 0);
        console.log('Would update progress for authenticated user');
      } catch (error) {
        console.error('Error updating topic progress:', error);
      }
    }

    let initialDifficulty = 'beginner';
    let questioningStyle = 'socratic';
    
    if (topicProgress.progress >= 70) {
      initialDifficulty = 'advanced';
      questioningStyle = 'challenging';
    } else if (topicProgress.progress >= 40) {
      initialDifficulty = 'intermediate';
      questioningStyle = 'guided';
    } else if (topicProgress.progress > 0) {
      initialDifficulty = 'beginner-plus';
      questioningStyle = 'supportive';
    }

    const navigationState = {
      isNewSession: true,
      roadmapId: roadmapId,
      learningPath: 'comprehensive',
      questioningStyle: questioningStyle,
      skipConfiguration: true,
      topicData: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        difficulty: topic.difficulty,
        duration: topic.duration,
        roadmapId: roadmapId,
        roadmapName: roadmapData?.name || 'Unknown Roadmap',
        currentProgress: topicProgress?.progress || 0,
        initialDifficulty: initialDifficulty,
        category: roadmapData?.category || 'General'
      }
    };

    console.log('Navigating to /learn with state:', navigationState);

    if (!navigationState.topicData || !navigationState.topicData.name) {
      console.error('Invalid navigation state - missing topic data:', navigationState);
      alert('Error: Invalid topic data. Please try again.');
      return;
    }

    navigate('/learn', {
      state: navigationState
    });
  };

  const getTopicStatus = (topic, progress) => {
    const topicProgress = progress[topic.id];
    if (!topicProgress) return 'locked';
    
    if (topicProgress.completed) return 'completed';
    if (topicProgress.progress > 0) return 'in-progress';
    if (topicProgress.unlocked) return 'available';
    return 'locked';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'available': return '#6366F1';
      case 'locked': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'available': return 'Available';
      case 'locked': return 'Locked';
      default: return 'Locked';
    }
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
    return <LoadingSpinner message="Loading roadmap..." />;
  }

  if (error) {
    return (
      <div className="roadmap-not-found">
        <h2>Error Loading Roadmap</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="roadmap-not-found">
        <h2>Roadmap Not Found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const overallProgress = calculateRoadmapProgress(userProgress);
  const completedCount = Object.values(userProgress).filter(p => p.completed).length;
  const inProgressCount = Object.values(userProgress).filter(p => p.progress > 0 && !p.completed).length;
  const unlockedCount = Object.values(userProgress).filter(p => p.unlocked).length;

  return (
    <div className="roadmap-details">
      <div className="roadmap-header">
        <div className="header-navigation">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="back-button"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="roadmap-hero" style={{ background: roadmapData.gradient }}>
          <div className="hero-content">
            <div className="roadmap-icon-large">
              <BookOpen size={48} color="white" />
            </div>
            <div className="roadmap-info">
              <h1 className="roadmap-title">{roadmapData.name}</h1>
              <p className="roadmap-description">{roadmapData.description}</p>
            </div>
            <div className="progress-circle-large">
              <svg width="120" height="120" className="progress-ring-large">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallProgress / 100)}`}
                  className="progress-arc-large"
                />
              </svg>
              <div className="progress-text-large">
                <span className="progress-number">{overallProgress}%</span>
                <span className="progress-label">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-stats-section">
        <div className="stats-grid">
          <div className="stat-card completed">
            <div className="stat-icon">
              <CheckCircle size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          
          <div className="stat-card in-progress">
            <div className="stat-icon">
              <Play size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{inProgressCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          
          <div className="stat-card unlocked">
            <div className="stat-icon">
              <Target size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{unlockedCount}</div>
              <div className="stat-label">Unlocked</div>
            </div>
          </div>
          
          <div className="stat-card total">
            <div className="stat-icon">
              <BookOpen size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{topics.length}</div>
              <div className="stat-label">Total Topics</div>
            </div>
          </div>
        </div>
      </div>

      <div className="topics-section">
        <div className="section-header">
          <h2>Learning Path</h2>
          <p>Complete topics in order to unlock advanced concepts and build your expertise</p>
        </div>

        <div className="topics-list">
          {topics.map((topic, index) => {
            const status = getTopicStatus(topic, userProgress);
            const topicProgress = userProgress[topic.id];
            const isClickable = status !== 'locked';
            
            return (
              <div
                key={topic.id}
                className={`topic-item ${status} ${!isClickable ? 'disabled' : ''}`}
              >
                <div 
                  className="topic-number" 
                  style={{ background: status === 'locked' ? '#9CA3AF' : getStatusColor(status) }}
                >
                  {status === 'locked' ? <Shield size={16} /> : index + 1}
                </div>

                <div className="topic-main">
                  <div className="topic-header">
                    <h3 className="topic-title">{topic.name}</h3>
                  </div>
                  
                  <p className="topic-description">{topic.description}</p>

                  {status !== 'locked' && (
                    <div className="topic-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${topicProgress?.progress || 0}%`,
                            background: getStatusColor(status)
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {topicProgress?.progress || 0}%
                      </span>
                    </div>
                  )}

                  <div className="topic-meta">
                    <span 
                      className="difficulty-tag"
                      style={{ 
                        backgroundColor: `${getDifficultyColor(topic.difficulty)}20`,
                        color: getDifficultyColor(topic.difficulty)
                      }}
                    >
                      {topic.difficulty}
                    </span>
                    <span className="duration-tag">
                      <Clock size={14} />
                      {topic.duration}
                    </span>
                  </div>
                </div>
                
                <div className="topic-action-container">
                  {status === 'locked' ? (
                    <div className="topic-action locked-action">
                      <Shield size={16} />
                      <span>Locked</span>
                    </div>
                  ) : (
                    <button 
                      className={`topic-action-btn ${status}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTopicSelect(topic);
                      }}
                      style={{
                        background: getStatusColor(status),
                        border: 'none',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      {status === 'completed' ? (
                        <>
                          <Star size={16} />
                          <span>Review</span>
                        </>
                      ) : status === 'in-progress' ? (
                        <>
                          <Play size={16} />
                          <span>Continue</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          <span>Start Learning</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {overallProgress > 0 && (
        <div className="encouragement-section" style={{
          padding: '2rem',
          maxWidth: '1200px',
          margin: '2rem auto 0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)',
            padding: '2rem',
            borderRadius: '1.5rem',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
              <Award size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Great Progress! You're {overallProgress}% through this roadmap
            </h3>
            <p style={{ margin: '0', opacity: '0.9', fontSize: '0.95rem' }}>
              Keep up the momentum! Each topic you complete brings you closer to mastering {roadmapData.category}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapDetails;