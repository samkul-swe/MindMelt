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
  Save,
  ArrowLeft,
  ArrowRight,
  Star,
  Play,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/authAPI';
import { useTopicSearch } from '../hooks/useTopicSearch';
import { useApiKey } from '../hooks/useApiKey';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/dashboard.css';

// Mock user progress data - this would come from your API
const getUserProgress = (roadmapId) => {
  // This is mock data - replace with actual API call
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
  const [showRoadmapTopics, setShowRoadmapTopics] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  const apiKeyManager = useApiKey();
  const topicSearch = useTopicSearch();

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
    
    // Initialize user progress for all roadmaps
    const allProgress = {};
    Object.keys(roadmapTopics).forEach(roadmapId => {
      allProgress[roadmapId] = getUserProgress(roadmapId);
    });
    setUserProgress(allProgress);
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

  const handleRoadmapClick = (roadmapData) => {
    // Navigate to dedicated roadmap details page
    navigate(`/roadmap/${roadmapData.roadmapId}`);
  };

  const startNewSession = () => {
    if (selectedTopic?.roadmapId) {
      navigate('/learn', {
        state: {
          isNewSession: true,
          roadmapId: selectedTopic.roadmapId,
          topicData: selectedTopic,
          learningPath: learningPath || 'comprehensive',
          questioningStyle: 'socratic',
          skipConfiguration: true
        }
      });
      setShowNewSession(false);
    }
  };

  const handleTopicSelect = (topic) => {
    const roadmapProgress = userProgress[selectedRoadmap?.roadmapId] || {};
    const topicProgress = roadmapProgress[topic.id];
    
    // Check if topic is unlocked
    if (!topicProgress?.unlocked) {
      alert("This topic is locked. Complete previous topics to unlock it!");
      return;
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

    // Start learning session directly
    navigate('/learn', {
      state: {
        isNewSession: true,
        roadmapId: selectedRoadmap.roadmapId,
        topicData: {
          ...topic,
          roadmapName: selectedRoadmap.name,
          currentProgress: topicProgress?.progress || 0,
          initialDifficulty: initialDifficulty
        },
        learningPath: 'comprehensive', // Default to comprehensive for roadmap topics
        questioningStyle: questioningStyle,
        skipConfiguration: true // Skip the configuration modal
      }
    });
  };

  const getTopicStatus = (topic, roadmapProgress) => {
    const topicProgress = roadmapProgress[topic.id];
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
            {isRegistered && (
              <button
                onClick={generateDailySummary}
                className="summary-btn-compact"
                title="View Yesterday's Summary"
              >
                <Calendar size={20} />
                <span>Yesterday</span>
              </button>
            )}
          </div>
        </div>

        {/* New User Guidance - Show for users with no sessions */}
        {(!isRegistered || (isRegistered && learningSessions.length === 0)) && (
          <div className="activity-overview">
            <h3>🚀 Choose Your Learning Roadmap</h3>
            <div className="simple-activity">
              <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--gray-800)', marginBottom: '1rem', fontSize: '1.1rem' }}>Select a structured learning path based on GeeksforGeeks roadmaps:</h4>
                <div className="roadmap-grid">
                  
                  {/* DSA Fundamentals Roadmap */}
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

                  {/* Web Development Roadmap */}
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

                  {/* Machine Learning Roadmap */}
                  <div 
                    className="roadmap-card machine-learning"
                    onClick={() => {
                      handleRoadmapClick({
                        name: "Machine Learning Mastery",
                        description: "Complete journey from ML basics to deep learning",
                        category: "Artificial Intelligence",
                        difficulty: "Intermediate to Advanced",
                        roadmapId: "machine-learning"
                      });
                    }}
                  >
                    <div className="roadmap-card-header">
                      <div className="roadmap-icon-container">
                        <span className="roadmap-icon">ML</span>
                      </div>
                      <div className="roadmap-title-section">
                        <h5 className="roadmap-title">Machine Learning</h5>
                        <p className="roadmap-category">Artificial Intelligence</p>
                      </div>
                      <div className="roadmap-action">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                    <p className="roadmap-description">Complete journey from ML basics to deep learning and neural networks</p>
                    <div className="roadmap-meta">
                      <span className="meta-item">
                        <BookOpen size={14} />
                        12 Topics
                      </span>
                      <span className="meta-item">
                        <Clock size={14} />
                        10-14 weeks
                      </span>
                    </div>
                    <div className="difficulty-badge">
                      <Target size={12} />
                      Intermediate to Advanced
                    </div>
                  </div>

                  {/* System Design Roadmap */}
                  <div 
                    className="roadmap-card system-design"
                    onClick={() => {
                      handleRoadmapClick({
                        name: "System Design Interview Prep",
                        description: "Master large-scale system design for tech interviews",
                        category: "System Architecture",
                        difficulty: "Advanced",
                        roadmapId: "system-design"
                      });
                    }}
                  >
                    <div className="roadmap-card-header">
                      <div className="roadmap-icon-container">
                        <span className="roadmap-icon">SYS</span>
                      </div>
                      <div className="roadmap-title-section">
                        <h5 className="roadmap-title">System Design</h5>
                        <p className="roadmap-category">System Architecture</p>
                      </div>
                      <div className="roadmap-action">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                    <p className="roadmap-description">Master large-scale system design for technical interviews</p>
                    <div className="roadmap-meta">
                      <span className="meta-item">
                        <BookOpen size={14} />
                        12 Topics
                      </span>
                      <span className="meta-item">
                        <Clock size={14} />
                        8-10 weeks
                      </span>
                    </div>
                    <div className="difficulty-badge">
                      <Target size={12} />
                      Advanced
                    </div>
                  </div>

                  {/* Android Development Roadmap */}
                  <div 
                    className="roadmap-card android-development"
                    onClick={() => {
                      handleRoadmapClick({
                        name: "Android App Development",
                        description: "Build modern Android applications with Kotlin",
                        category: "Mobile Development",
                        difficulty: "Beginner to Advanced",
                        roadmapId: "android-development"
                      });
                    }}
                  >
                    <div className="roadmap-card-header">
                      <div className="roadmap-icon-container">
                        <span className="roadmap-icon">AND</span>
                      </div>
                      <div className="roadmap-title-section">
                        <h5 className="roadmap-title">Android Development</h5>
                        <p className="roadmap-category">Mobile Development</p>
                      </div>
                      <div className="roadmap-action">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                    <p className="roadmap-description">Build modern Android applications with Kotlin and Android SDK</p>
                    <div className="roadmap-meta">
                      <span className="meta-item">
                        <BookOpen size={14} />
                        13 Topics
                      </span>
                      <span className="meta-item">
                        <Clock size={14} />
                        10-12 weeks
                      </span>
                    </div>
                    <div className="difficulty-badge">
                      <Target size={12} />
                      Beginner to Advanced
                    </div>
                  </div>

                  {/* Interview Preparation Roadmap */}
                  <div 
                    className="roadmap-card interview-preparation"
                    onClick={() => {
                      handleRoadmapClick({
                        name: "Interview Preparation Mastery",
                        description: "Complete technical interview preparation for top tech companies",
                        category: "Interview Prep",
                        difficulty: "Intermediate to Advanced",
                        roadmapId: "interview-preparation"
                      });
                    }}
                  >
                    <div className="roadmap-card-header">
                      <div className="roadmap-icon-container">
                        <span className="roadmap-icon">INT</span>
                      </div>
                      <div className="roadmap-title-section">
                        <h5 className="roadmap-title">Interview Preparation</h5>
                        <p className="roadmap-category">Interview Prep</p>
                      </div>
                      <div className="roadmap-action">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                    <p className="roadmap-description">Complete technical interview preparation for FAANG and top tech companies</p>
                    <div className="roadmap-meta">
                      <span className="meta-item">
                        <BookOpen size={14} />
                        16 Topics
                      </span>
                      <span className="meta-item">
                        <Clock size={14} />
                        12-16 weeks
                      </span>
                    </div>
                    <div className="difficulty-badge">
                      <Target size={12} />
                      Intermediate to Advanced
                    </div>
                  </div>
                  
                </div>
              </div>
              
              {!isRegistered && (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'linear-gradient(135deg, #FFF4E6 0%, #FFE4B5 100%)', borderRadius: '0.75rem', border: '2px solid var(--accent-light)' }}>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                    💡 <strong>Pro tip:</strong> Create an account to save your progress and track your learning journey across topics!
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowUpgradePrompt(true)}
                    style={{ minWidth: '180px' }}
                  >
                    <User size={16} />
                    Create Account
                  </button>
                </div>
              )}
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
                {selectedTopic?.roadmapId ? (
                  <div className="selected-topic-preview">
                    <div className="topic-preview-header">
                      <span className="topic-icon">{selectedTopic.icon}</span>
                      <div className="topic-info">
                        <h4>{selectedTopic.name}</h4>
                        <p>{selectedTopic.description}</p>
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', background: 'var(--gray-100)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', marginRight: '0.5rem' }}>
                            {selectedTopic.category}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', background: 'linear-gradient(135deg, #FFF4E6 0%, #FFE4B5 100%)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>
                            {selectedTopic.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '2px solid var(--gray-200)' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-800)' }}>📚 Structured Learning Path</h5>
                      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                        This roadmap contains multiple topics that you'll learn step by step. Each session will focus on one topic, 
                        and you can track your progress as you complete each one.
                      </p>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: '600' }}>
                        🎯 You'll start with the first topic and progress through the roadmap systematically
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-600)' }}>
                    <Brain size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
                    <h4>Please select a roadmap from the dashboard</h4>
                    <p>Choose one of the structured learning paths to get started with your journey.</p>
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
                disabled={!selectedTopic?.roadmapId || !learningPath}
              >
                <Sparkles size={16} />
                Start Roadmap Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Selection Modal */}
      {showRoadmapTopics && selectedRoadmap && (
        <div className="modal-overlay" onClick={() => setShowRoadmapTopics(false)}>
          <div className="modal-content topics-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button 
                className="back-btn"
                onClick={() => setShowRoadmapTopics(false)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="modal-title">
                <span className="modal-icon">{selectedRoadmap.icon}</span>
                <div>
                  <h2>{selectedRoadmap.name}</h2>
                  <p>Choose a topic to start learning</p>
                </div>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="roadmap-progress-overview">
                <div className="progress-stats">
                  <div className="stat-item">
                    <span className="stat-number">{Object.values(userProgress[selectedRoadmap?.roadmapId] || {}).filter(p => p.completed).length}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{Object.values(userProgress[selectedRoadmap?.roadmapId] || {}).filter(p => p.progress > 0 && !p.completed).length}</span>
                    <span className="stat-label">In Progress</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{Object.values(userProgress[selectedRoadmap?.roadmapId] || {}).filter(p => p.unlocked).length}</span>
                    <span className="stat-label">Unlocked</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{roadmapTopics[selectedRoadmap.roadmapId]?.length || 0}</span>
                    <span className="stat-label">Total Topics</span>
                  </div>
                </div>
              </div>
              
              <div className="topics-list">
                {roadmapTopics[selectedRoadmap.roadmapId]?.map((topic, index) => {
                  const roadmapProgress = userProgress[selectedRoadmap?.roadmapId] || {};
                  const status = getTopicStatus(topic, roadmapProgress);
                  const topicProgress = roadmapProgress[topic.id];
                  const isClickable = status !== 'locked';
                  
                  return (
                    <div
                      key={topic.id}
                      className={`topic-item ${status}`}
                      onClick={() => isClickable && handleTopicSelect(topic)}
                    >
                      {/* Topic Number */}
                      <div 
                        className="topic-number" 
                        style={{ background: status === 'locked' ? '#9CA3AF' : getStatusColor(status) }}
                      >
                        {status === 'locked' ? '🔒' : index + 1}
                      </div>
                      
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
                            <Clock size={12} />
                            {topic.duration}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="topic-action">
                        {status === 'locked' ? 'Locked' :
                         status === 'completed' ? 'Review' :
                         status === 'in-progress' ? 'Continue' :
                         'Start'}
                      </div>
                    </div>
                  );
                })}
              </div>
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