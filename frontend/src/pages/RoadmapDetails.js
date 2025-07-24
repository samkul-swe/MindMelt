import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Brain, 
  ArrowLeft,
  Clock,
  Target,
  BookOpen,
  Play,
  CheckCircle,
  Shield,
  TrendingUp,
  Award,
  Star,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import dataService from '../services/dataService';
import '../styles/pages/roadmap-details.css';

// Mock user progress data - this would come from your API
const getUserProgress = (roadmapId) => {
  const mockProgress = {
    "dsa-fundamentals": {
      1: { completed: false, progress: 75, unlocked: true, started: true, canAdvance: true },
      2: { completed: false, progress: 35, unlocked: true, started: true, canAdvance: false },
      3: { completed: false, progress: 0, unlocked: true, started: false, canAdvance: false },
      4: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      5: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      6: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      7: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      8: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      9: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      10: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      11: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      12: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      13: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      14: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
      15: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false }
    },
    "web-development": {
      1: { completed: false, progress: 0, unlocked: true, started: false },
      2: { completed: false, progress: 0, unlocked: false, started: false }
    },
    "machine-learning": {
      1: { completed: false, progress: 0, unlocked: true, started: false }
    },
    "system-design": {
      1: { completed: false, progress: 0, unlocked: true, started: false }
    },
    "android-development": {
      1: { completed: false, progress: 0, unlocked: true, started: false }
    },
    "interview-preparation": {
      1: { completed: false, progress: 0, unlocked: true, started: false }
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

// Roadmap topics data
const roadmapTopics = {
  "dsa-fundamentals": [
    { id: 1, name: "Arrays & Strings", difficulty: "Beginner", duration: "3-4 hours", description: "Master array manipulation and string algorithms" },
    { id: 2, name: "Linked Lists", difficulty: "Beginner", duration: "2-3 hours", description: "Understand pointer concepts and list operations" },
    { id: 3, name: "Stacks & Queues", difficulty: "Beginner", duration: "2-3 hours", description: "Learn LIFO and FIFO data structures" },
    { id: 4, name: "Trees & Binary Trees", difficulty: "Intermediate", duration: "4-5 hours", description: "Explore hierarchical data structures" },
    { id: 5, name: "Binary Search Trees", difficulty: "Intermediate", duration: "3-4 hours", description: "Efficient searching and sorting with BSTs" },
    { id: 6, name: "Heaps & Priority Queues", difficulty: "Intermediate", duration: "3-4 hours", description: "Priority-based data structures" },
    { id: 7, name: "Hash Tables", difficulty: "Intermediate", duration: "3-4 hours", description: "Fast lookups with hashing" },
    { id: 8, name: "Graphs", difficulty: "Advanced", duration: "5-6 hours", description: "Network representations and traversals" },
    { id: 9, name: "Dynamic Programming", difficulty: "Advanced", duration: "6-8 hours", description: "Optimization through memoization" },
    { id: 10, name: "Greedy Algorithms", difficulty: "Advanced", duration: "4-5 hours", description: "Locally optimal choices" },
    { id: 11, name: "Backtracking", difficulty: "Advanced", duration: "4-5 hours", description: "Systematic solution exploration" },
    { id: 12, name: "Divide & Conquer", difficulty: "Advanced", duration: "4-5 hours", description: "Break problems into subproblems" },
    { id: 13, name: "String Algorithms", difficulty: "Advanced", duration: "4-5 hours", description: "Pattern matching and manipulation" },
    { id: 14, name: "Advanced Graph Algorithms", difficulty: "Expert", duration: "6-7 hours", description: "Shortest paths and network flows" },
    { id: 15, name: "Computational Complexity", difficulty: "Expert", duration: "3-4 hours", description: "Big O analysis and optimization" }
  ],
  "web-development": [
    { id: 1, name: "HTML Fundamentals", difficulty: "Beginner", duration: "2-3 hours", description: "Structure and semantic markup" },
    { id: 2, name: "CSS Styling & Layout", difficulty: "Beginner", duration: "4-5 hours", description: "Visual design and responsive layouts" }
  ],
  "machine-learning": [
    { id: 1, name: "Python for ML", difficulty: "Beginner", duration: "4-5 hours", description: "NumPy, Pandas, and basic libraries" }
  ],
  "system-design": [
    { id: 1, name: "Scalability Fundamentals", difficulty: "Intermediate", duration: "3-4 hours", description: "Horizontal vs vertical scaling" }
  ],
  "android-development": [
    { id: 1, name: "Kotlin Fundamentals", difficulty: "Beginner", duration: "4-5 hours", description: "Modern Android programming language" }
  ],
  "interview-preparation": [
    { id: 1, name: "Resume & Portfolio", difficulty: "Beginner", duration: "3-4 hours", description: "Crafting compelling applications" }
  ]
};

// Roadmap metadata
const roadmapData = {
  "dsa-fundamentals": {
    name: "Data Structures & Algorithms Fundamentals",
    description: "Master the core concepts of DSA from basics to advanced topics",
    category: "Programming Fundamentals",
    difficulty: "Beginner to Advanced",
    color: "#FF6B35",
    gradient: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
    duration: "8-12 weeks",
    totalTopics: 15
  },
  "web-development": {
    name: "Complete Web Development",
    description: "From HTML basics to full-stack web applications",
    category: "Web Development",
    difficulty: "Beginner to Advanced",
    color: "#4ECDC4",
    gradient: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
    duration: "12-16 weeks",
    totalTopics: 14
  },
  "machine-learning": {
    name: "Machine Learning Mastery",
    description: "Complete journey from ML basics to deep learning",
    category: "Artificial Intelligence",
    difficulty: "Intermediate to Advanced",
    color: "#9B59B6",
    gradient: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
    duration: "10-14 weeks",
    totalTopics: 12
  },
  "system-design": {
    name: "System Design Interview Prep",
    description: "Master large-scale system design for tech interviews",
    category: "System Architecture",
    difficulty: "Advanced",
    color: "#E74C3C",
    gradient: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
    duration: "8-10 weeks",
    totalTopics: 12
  },
  "android-development": {
    name: "Android App Development",
    description: "Build modern Android applications with Kotlin",
    category: "Mobile Development",
    difficulty: "Beginner to Advanced",
    color: "#2ECC71",
    gradient: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
    duration: "10-12 weeks",
    totalTopics: 13
  },
  "interview-preparation": {
    name: "Interview Preparation Mastery",
    description: "Complete technical interview preparation for top tech companies",
    category: "Interview Prep",
    difficulty: "Intermediate to Advanced",
    color: "#FF1493",
    gradient: "linear-gradient(135deg, #ff1493 0%, #e91e63 100%)",
    duration: "12-16 weeks",
    totalTopics: 16
  }
};

const RoadmapDetails = () => {
  const navigate = useNavigate();
  const { roadmapId } = useParams();
  const { currentUser, isRegistered, getDisplayName } = useAuth();
  
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
      
      // Set current user for data service
      if (currentUser?.id) {
        dataService.setUser(currentUser.id);
      }
      
      // Load roadmap and topics
      const [roadmap, roadmapTopics, progress] = await Promise.all([
        dataService.getRoadmap(roadmapId),
        dataService.getRoadmapTopics(roadmapId),
        dataService.getUserProgress(roadmapId)
      ]);
      
      if (!roadmap) {
        setError('Roadmap not found');
        return;
      }
      
      setRoadmapData(roadmap);
      setTopics(roadmapTopics);
      
      // Convert Firebase progress format to component format
      const formattedProgress = {};
      if (progress.topics) {
        Object.entries(progress.topics).forEach(([topicId, data]) => {
          formattedProgress[topicId] = {
            completed: data.progress >= 100,
            progress: data.progress || 0,
            unlocked: data.unlocked !== false,
            started: data.progress > 0,
            canAdvance: data.canAdvance !== false
          };
        });
      } else {
        // Initialize default progress for anonymous users
        roadmapTopics.forEach((topic, index) => {
          formattedProgress[topic.id] = {
            completed: false,
            progress: index === 0 ? 75 : (index === 1 ? 35 : 0),
            unlocked: index < 3,
            started: index < 2,
            canAdvance: index === 0
          };
        });
      }
      
      setUserProgress(formattedProgress);
      
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
    console.log('Topic object:', topic);
    console.log('Topic icon specifically:', topic.icon);
    console.log('Roadmap object:', roadmapData);
    
    // Auto-enroll user in roadmap if registered
    if (isRegistered && currentUser?.id) {
      try {
        await dataService.enrollUserInRoadmap(roadmapId, currentUser.id);
      } catch (error) {
        console.log('Enrollment error (may already be enrolled):', error);
      }
    }
    
    // Update topic progress in Firebase when starting
    if (isRegistered && currentUser?.id && !topicProgress.started) {
      try {
        await dataService.updateTopicProgress(roadmapId, topic.id, {
          progress: topicProgress.progress || 0,
          unlocked: true,
          started: true,
          canAdvance: true
        });
      } catch (error) {
        console.error('Error updating topic progress:', error);
      }
    }
    
    // Determine initial difficulty based on progress
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

    // Create the comprehensive navigation state that LearningSession expects
    const navigationState = {
      isNewSession: true,
      roadmapId: roadmapId,
      learningPath: 'comprehensive',
      questioningStyle: questioningStyle,
      skipConfiguration: true,
      // Main topic data structure
      topicData: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        difficulty: topic.difficulty,
        duration: topic.duration,
        icon: topic.icon || '📚', // Ensure icon always exists
        roadmapId: roadmapId,
        roadmapName: roadmapData?.name || roadmapData?.title || 'Unknown Roadmap',
        currentProgress: topicProgress?.progress || 0,
        initialDifficulty: initialDifficulty,
        topicDescription: topic.description,
        estimatedTime: topic.duration,
        category: roadmapData?.category || 'General'
      },
      // Alternative data structure for compatibility
      selectedTopicData: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        difficulty: topic.difficulty,
        duration: topic.duration,
        icon: topic.icon || '📚',
        category: roadmapData?.category || 'General'
      }
    };

    console.log('Navigating to /learn with state:', navigationState);
    
    // Validate navigation state before navigating
    if (!navigationState.topicData || !navigationState.topicData.name) {
      console.error('❌ Invalid navigation state - missing topic data:', navigationState);
      alert('❌ Error: Invalid topic data. Please try again.');
      return;
    }
    
    // Ensure icon exists (add default if missing)
    if (!navigationState.topicData.icon) {
      console.log('⚠️ Missing icon, adding default');
      navigationState.topicData.icon = '📚';
      navigationState.selectedTopicData.icon = '📚';
    }

    // Start learning session directly
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '⏳';
      case 'available': return '🚀';
      case 'locked': return '🔒';
      default: return '🔒';
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
      {/* Header */}
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
          <div className="roadmap-icon-large">📚</div>
          <div className="roadmap-info">
              <h1 className="roadmap-title">{roadmapData.name || roadmapData.title}</h1>
              <p className="roadmap-description">{roadmapData.description}</p>
              <div className="roadmap-meta">
                <span className="meta-item">📚 {roadmapData.category}</span>
                <span className="meta-item">⏱️ {roadmapData.duration || roadmapData.estimatedTime}</span>
                <span className="meta-item">🎯 {roadmapData.difficulty}</span>
              </div>
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

      {/* Progress Statistics */}
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

      {/* Topics List */}
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
                {/* Topic Number */}
                <div 
                  className="topic-number" 
                  style={{ background: status === 'locked' ? '#9CA3AF' : getStatusColor(status) }}
                >
                  {status === 'locked' ? '🔒' : index + 1}
                </div>
                
                {/* Topic Icon */}
                <div className="topic-icon">📚</div>
                
                {/* Main Content */}
                <div className="topic-main">
                  <div className="topic-header">
                    <h3 className="topic-title">{topic.name}</h3>
                    <div className="topic-status">{getStatusIcon(status)}</div>
                  </div>
                  
                  <p className="topic-description">{topic.description}</p>
                  
                  {/* Progress Bar - only for unlocked topics */}
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
                  
                  {/* Meta Information */}
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
                
                {/* Enhanced Action Button */}
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

      {/* Progress encouragement section */}
      {overallProgress > 0 && (
        <div className="encouragement-section" style={{
          padding: '2rem',
          maxWidth: '1200px',
          margin: '2rem auto 0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            borderRadius: '1.5rem',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
              🎉 Great Progress! You're {overallProgress}% through this roadmap
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
