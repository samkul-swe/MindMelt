import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  MessageCircle, 
  User, 
  Bot,
  Home,
  Info,
  Lightbulb,
  Coffee,
  Code,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/learning-session.css'

// Timer Constants
const TIMER_CONSTANTS = {
  INITIAL_TIME: 8 * 60, // 8 minutes
  MAX_TIME: 25 * 60, // 25 minutes
  TIME_BONUS: 180, // 3 minutes
  WARNING_THRESHOLD: 300 // 5 minutes
};

const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  HINT: 'hint',
  SYSTEM: 'system'
};

const HINT_CONSTANTS = {
  MAX_HINTS: 3,
  RESET_ON_NEW_TOPIC: true
};

const learningPaths = {
  conceptual: { 
    name: "Conceptual Track", 
    description: "Deep understanding of core concepts - focus on the 'why'",
    icon: "Brain"
  },
  applied: { 
    name: "Applied Track", 
    description: "Practical implementation and real-world examples",
    icon: "Zap"
  },
  comprehensive: { 
    name: "Comprehensive Track", 
    description: "Complete mastery with theory and practice combined",
    icon: "Target"
  }
};

const questioningStyles = {
  socratic: { 
    name: "Socratic Method", 
    description: "Guided discovery through strategic questions that build understanding step by step",
    icon: "MessageCircle"
  },
  scenario: { 
    name: "Scenario-Based", 
    description: "Real-world problem scenarios and practical use cases to explore concepts",
    icon: "Globe"
  },
  puzzle: { 
    name: "Puzzle & Brain Teaser", 
    description: "Challenge-based learning with creative problem solving and logic puzzles",
    icon: "Puzzle"
  },
  analogy: { 
    name: "Analogy & Metaphor", 
    description: "Learn through comparisons, analogies, and familiar everyday examples",
    icon: "Link"
  }
};

// Timer Hook
const useTimer = (initialTime = TIMER_CONSTANTS.INITIAL_TIME) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [maxTime, setMaxTime] = useState(initialTime);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);

  const increaseTimer = useCallback(() => {
    const newTime = Math.min(maxTime + TIMER_CONSTANTS.TIME_BONUS, TIMER_CONSTANTS.MAX_TIME);
    setMaxTime(newTime);
    setTimeRemaining(prev => Math.min(prev + TIMER_CONSTANTS.TIME_BONUS, newTime));
  }, [maxTime]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(maxTime);
    setTimerActive(true);
    setTimerPaused(false);
  }, [maxTime]);

  const togglePause = useCallback(() => {
    setTimerPaused(prev => !prev);
  }, []);

  return {
    timeRemaining,
    maxTime,
    timerActive, 
    timerPaused,
    setTimeRemaining,
    setTimerActive,
    increaseTimer,
    resetTimer,
    togglePause
  };
};

// Hints Hook
const useHints = (initialCount = HINT_CONSTANTS.MAX_HINTS) => {
  const [hintsRemaining, setHintsRemaining] = useState(initialCount);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [hintsExhausted, setHintsExhausted] = useState(false);

  const useHint = useCallback(() => {
    if (hintsRemaining > 0) {
      setHintsRemaining(prev => {
        const newCount = prev - 1;
        if (newCount === 0) {
          setHintsExhausted(true);
        }
        return newCount;
      });
    }
  }, [hintsRemaining]);

  const resetHints = useCallback(() => {
    setHintsRemaining(HINT_CONSTANTS.MAX_HINTS);
    setHintsExhausted(false);
  }, []);

  return {
    hintsRemaining,
    hintsExhausted,
    isRequestingHint,
    setIsRequestingHint,
    useHint,
    resetHints,
    canUseHint: hintsRemaining > 0 && !isRequestingHint
  };
};

// Ice Cream Timer Component (simplified)
const IceCreamTimer = React.memo(({ timeLeft, totalTime, isRunning }) => {
  const canvasRef = useRef(null);
  const percentage = useMemo(() => (timeLeft / totalTime) * 100, [timeLeft, totalTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = 60 * dpr;
    canvas.height = 80 * dpr;
    canvas.style.width = '60px';
    canvas.style.height = '80px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, 60, 80);
    
    // Draw simple ice cream cone
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(18, 40);
    ctx.lineTo(42, 40);
    ctx.lineTo(30, 70);
    ctx.closePath();
    ctx.fill();

    // Draw ice cream scoops based on time remaining
    if (percentage > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(30, 32, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (percentage > 33) {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(30, 22, 11, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (percentage > 66) {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(30, 14, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [percentage]);

  return (
    <canvas 
      ref={canvasRef}
      className="ice-cream-canvas"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
});

// Utility functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatMessageTime = (timestamp) => {
  return timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const createMessage = (type, content, options = {}) => ({
  type,
  content,
  timestamp: new Date(),
  ...options
});

// Message Component
const Message = React.memo(({ message }) => (
  <div className={`message ${message.type}`}>
    <div className="message-avatar">
      {message.type === MESSAGE_TYPES.USER ? <User size={20} /> : 
       message.type === MESSAGE_TYPES.HINT ? <Lightbulb size={20} /> :
       message.type === MESSAGE_TYPES.SYSTEM ? <Brain size={20} /> :
       <Bot size={20} />}
    </div>
    <div className="message-content">
      <div className={`message-bubble ${getMessageBubbleClass(message)}`}>
        {message.content}
      </div>
      <div className="message-time">
        {formatMessageTime(message.timestamp)}
      </div>
    </div>
  </div>
));

const getMessageBubbleClass = (message) => {
  const classes = [];
  if (message.isWelcome) classes.push('welcome');
  if (message.isError) classes.push('error');
  if (message.isBonus) classes.push('bonus');
  if (message.isTimeUp) classes.push('time-up');
  if (message.type === MESSAGE_TYPES.HINT) classes.push('hint');
  if (message.type === MESSAGE_TYPES.SYSTEM) classes.push('system');
  return classes.join(' ');
};

// Hint Counter Component
const HintCounter = React.memo(({ hintsRemaining, onHintRequest, canUseHint, isRequestingHint }) => (
  <div className="hint-counter">
    <div className="hint-info">
      <div className="hint-bulbs">
        {[...Array(3)].map((_, index) => (
          <Lightbulb
            key={index}
            size={16}
            className={`hint-bulb ${index < hintsRemaining ? 'active' : 'used'}`}
          />
        ))}
      </div>
      <span className="hint-text">
        {hintsRemaining} hint{hintsRemaining !== 1 ? 's' : ''} left
      </span>
    </div>
    <button
      className="hint-btn"
      onClick={onHintRequest}
      disabled={!canUseHint}
      title={canUseHint ? "Get a helpful hint" : "No hints remaining"}
    >
      {isRequestingHint ? (
        <div className="thinking-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <Lightbulb size={18} />
      )}
      Hint
    </button>
  </div>
));

// Main Learning Session Component
const LearningSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useAuth();

  // Session State
  const [sessionData, setSessionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [progress, setProgress] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [currentQuestioningStyle, setCurrentQuestioningStyle] = useState('socratic');
  const [isLoadingFirstQuestion, setIsLoadingFirstQuestion] = useState(true);
  const [sessionStartTime] = useState(Date.now());
  const [exchangeCount, setExchangeCount] = useState(0);

  const timer = useTimer();
  const hints = useHints();
  const messageEndRef = useRef(null);

  // Initialize session
  useEffect(() => {
    console.log('Initializing session with:', { sessionId, locationState: location.state });
    initializeSession();
  }, [sessionId, location.state]);

  const initializeSession = async () => {
    try {
      console.log('Starting initializeSession...', { sessionId, locationState: location.state });
      let sessionInfo = null;

      if (sessionId && sessionId !== 'new') {
        console.log('Loading existing session:', sessionId);
        if (isAuthenticated) {
          try {
            const sessions = await authAPI.getLearningHistory();
            sessionInfo = sessions.find(s => s.id === sessionId);
            
            if (sessionInfo) {
              console.log('Loaded existing session:', sessionInfo);
              setMessages(sessionInfo.messages || []);
              setProgress(sessionInfo.progress || []);
              setCorrectStreak(sessionInfo.correctStreak || 0);
              setCurrentQuestioningStyle(sessionInfo.questioningStyle || 'socratic');
              setExchangeCount(sessionInfo.exchangeCount || 0);
            }
          } catch (error) {
            console.error('Failed to load session:', error);
            sessionInfo = location.state;
          }
        } else {
          sessionInfo = location.state;
        }
      } else {
        console.log('Creating new session from location state');
        sessionInfo = location.state;
        
        if (!sessionInfo?.isNewSession) {
          console.error('Invalid session data for new session:', sessionInfo);
          const redirectPath = isAuthenticated ? '/dashboard' : '/start';
          navigate(redirectPath, { replace: true });
          return;
        }
      }

      if (!sessionInfo) {
        const redirectPath = isAuthenticated ? '/dashboard' : '/start';
        navigate(redirectPath, { replace: true });
        return;
      }

      console.log('Setting session data:', sessionInfo);
      setSessionData(sessionInfo);
      setCurrentQuestioningStyle(sessionInfo?.questioningStyle || 'socratic');
      
      timer.setTimerActive(true);

      if (!sessionId || sessionId === 'new') {
        console.log('Getting first question...');
        await getFirstQuestion(sessionInfo);
      } else {
        setIsLoadingFirstQuestion(false);
      }
      
      console.log('Session initialization complete!');

    } catch (error) {
      console.error('Failed to initialize session:', error);
      const redirectPath = isAuthenticated ? '/dashboard' : '/start';
      navigate(redirectPath, { replace: true });
    }
  };

  const getFirstQuestion = useCallback(async (sessionInfo) => {
    try {
      setIsLoadingFirstQuestion(true);
      
      const topicName = sessionInfo.topicData?.name || sessionInfo.selectedTopicData?.name || 'Unknown Topic';
      const learningPathName = learningPaths[sessionInfo.learningPath]?.name || 'Comprehensive Track';
      
      // Simulate AI response (replace with actual API call when backend AI is ready)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const firstQuestion = `Welcome to learning ${topicName}! Let's start with the ${learningPathName} approach. What's your current understanding of this topic?`;
      
      const firstMessage = createMessage(MESSAGE_TYPES.BOT, firstQuestion);
      setMessages([firstMessage]);
      
      // Add welcome message for non-authenticated users
      if (!isAuthenticated) {
        const welcomeMessage = createMessage(MESSAGE_TYPES.SYSTEM, 
          `Welcome to MindMelt! You're learning as a guest. Your progress will be saved locally, but you can create an account anytime to save it permanently.`,
          { isWelcome: true }
        );
        setMessages(prev => [welcomeMessage, ...prev]);
      }
      
    } catch (error) {
      console.error('Failed to get first question:', error);
      const fallbackQuestion = `Welcome to learning ${sessionInfo?.topicData?.name || 'this topic'}! What would you like to explore first?`;
      const fallbackMessage = createMessage(MESSAGE_TYPES.BOT, fallbackQuestion);
      setMessages([fallbackMessage]);
    } finally {
      setIsLoadingFirstQuestion(false);
    }
  }, [isAuthenticated]);

  // Request hint function
  const handleHintRequest = useCallback(async () => {
    if (!hints.canUseHint || !sessionData) return;
    
    hints.setIsRequestingHint(true);
    
    try {
      // Simulate hint response (replace with actual API call when backend AI is ready)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const hintResponse = "Think about the fundamental concepts we've discussed. What patterns do you notice?";
      
      const hintMessage = createMessage(MESSAGE_TYPES.HINT, hintResponse, { isHint: true });
      setMessages(prev => [...prev, hintMessage]);
      
      hints.useHint();
      
    } catch (error) {
      const errorMessage = createMessage(MESSAGE_TYPES.BOT,
        `Hint Error: ${error.message}`,
        { isError: true }
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      hints.setIsRequestingHint(false);
    }
  }, [hints, sessionData]);

  // Handle visualization action
  const handleVisualize = useCallback(() => {
    const visualizationMessage = createMessage(MESSAGE_TYPES.BOT,
      "Let's create a visualization! Try writing some code to represent what you've learned about this topic.",
      { isBonus: true }
    );
    setMessages(prev => [...prev, visualizationMessage]);
  }, []);

  // Handle take break action
  const handleTakeBreak = useCallback(() => {
    timer.togglePause();
    const breakMessage = createMessage(MESSAGE_TYPES.BOT,
      "Taking a break is important for learning! Your timer is paused. When you're ready, feel free to continue our discussion.",
      { isBonus: true }
    );
    setMessages(prev => [...prev, breakMessage]);
  }, [timer]);

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer countdown effect
  useEffect(() => {
    if (timer.timerActive && !timer.timerPaused && timer.timeRemaining > 0) {
      const interval = setInterval(() => {
        timer.setTimeRemaining(t => {
          if (t <= 1) {
            clearInterval(interval);
            setMessages(prev => [...prev, createMessage(MESSAGE_TYPES.BOT,
              "Time's up! Your ice cream has melted. Great learning session though!",
              { isTimeUp: true }
            )]);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer.timerActive, timer.timerPaused, timer.timeRemaining, timer.setTimeRemaining]);

  const handleSubmit = useCallback(async () => {
    if (!userInput.trim() || isThinking || timer.timeRemaining <= 0 || !sessionData) return;
    
    setIsThinking(true);
    
    const userMessage = createMessage(MESSAGE_TYPES.USER, userInput);
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Simulate AI response (replace with actual API call when backend AI is ready)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const topicName = sessionData?.topicData?.name || sessionData?.selectedTopicData?.name || 'Unknown Topic';
      const botReply = `That's an interesting perspective on ${topicName}! Can you elaborate on what you think happens next?`;
      
      const botMessage = createMessage(MESSAGE_TYPES.BOT, botReply);
      setMessages(prev => [...prev, botMessage]);
      
      setProgress(prev => [...prev, { 
        question: userInput, 
        answer: botReply, 
        timestamp: new Date() 
      }]);

      // Increment exchange count
      setExchangeCount(prev => prev + 1);

      // Progress-based timer bonus
      if (userInput.length > 30 && progress.length % 3 === 2) {
        timer.increaseTimer();
        setCorrectStreak(prev => prev + 1);
        setMessages(prev => [...prev, createMessage(MESSAGE_TYPES.BOT,
          "Great progress! Your ice cream is refreezing - you've earned more focus time!",
          { isBonus: true }
        )]);
        
        // Update progress in backend if authenticated
        if (isAuthenticated && sessionData.roadmapId) {
          try {
            const newProgress = Math.min(progress.length * 10, 100);
            await authAPI.updateUserProgress(
              sessionData.roadmapId,
              sessionData.topicData?.id || 'topic1',
              newProgress
            );
          } catch (error) {
            console.error('Error updating progress:', error);
          }
        }
      }
      
    } catch (error) {
      const errorMessage = createMessage(MESSAGE_TYPES.BOT,
        `Error: ${error.message}`,
        { isError: true }
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setUserInput('');
    }
  }, [userInput, isThinking, timer, sessionData, progress, isAuthenticated]);

  const handleBackToDashboard = useCallback(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/start', { replace: true });
    }
  }, [navigate, isAuthenticated]);

  const handleInfoClick = useCallback(() => {
    if (timer.timerActive && !timer.timerPaused) {
      timer.togglePause();
    }
    setShowInfo(true);
  }, [timer]);

  const handleInfoClose = useCallback(() => {
    setShowInfo(false);
    if (timer.timerActive && timer.timerPaused) {
      timer.togglePause();
    }
  }, [timer]);

  if (!sessionData) {
    return <LoadingSpinner message="Loading your learning session..." />;
  }
  
  if (!sessionData.topicData && !sessionData.selectedTopicData) {
    return (
      <div className="error-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Session Error</h2>
        <p>Topic data is missing. Please try starting a new session.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const topicName = sessionData?.topicData?.name || sessionData?.selectedTopicData?.name || 'Unknown Topic';

  return (
    <div className="learning-session-page">
      <div className="learning-session-container">
        <div className="learning-container">
          <div className="learning-header">
            <div className="session-info">
              <div className="session-title">
                <button
                  onClick={handleBackToDashboard}
                  className="back-btn"
                  title={isAuthenticated ? "Back to Dashboard" : "Back to Start"}
                >
                  <Home size={20} />
                </button>
                <h2>
                  <Brain size={24} />
                  {topicName}
                </h2>
              </div>
              <div className="session-meta">
                <div className="path-badge">
                  {learningPaths[sessionData.learningPath]?.name || 'Learning Path'}
                </div>

                <div className="style-badge">
                  {questioningStyles[currentQuestioningStyle]?.name || 'Questioning Style'}
                </div>

                <button 
                  className="info-btn"
                  onClick={handleInfoClick}
                  title="Session Information"
                >
                  <Info size={18} />
                  Info
                </button>
              </div>
            </div>
            
            <div className="timer-controls">
              <div className="ice-cream-timer-container">
                <IceCreamTimer 
                  timeLeft={timer.timeRemaining} 
                  totalTime={timer.maxTime} 
                  isRunning={timer.timerActive && !timer.timerPaused} 
                />
                <div className="timer-info">
                  <div className={`timer-display ${timer.timeRemaining < TIMER_CONSTANTS.WARNING_THRESHOLD ? 'timer-warning' : ''}`}>
                    {formatTime(timer.timeRemaining)}
                  </div>
                  <div className="timer-label">
                    Focus Time • Max: {Math.floor(timer.maxTime / 60)}min
                    {timer.timerPaused && <span className="paused-label"> • Paused</span>}
                  </div>
                </div>
              </div>
              
              <div className="timer-buttons">
                <button 
                  onClick={timer.togglePause}
                  className="timer-btn"
                  title={timer.timerPaused ? 'Resume' : 'Pause'}
                >
                  {timer.timerPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button 
                  onClick={timer.resetTimer}
                  className="timer-btn"
                  title="Reset Timer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="messages-container">
            {isLoadingFirstQuestion ? (
              <div className="loading-first-question">
                <div className="loading-spinner"></div>
                <p>Preparing your {learningPaths[sessionData.learningPath]?.name?.toLowerCase() || 'learning'} question...</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))}
                
                {isThinking && (
                  <div className="message bot">
                    <div className="message-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content">
                      <div className="thinking-bubble">
                        <div className="thinking-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div ref={messageEndRef} />
          </div>

          <div className="input-area">
            <div className="input-container">
              <input
                className="message-input"
                placeholder={
                  isLoadingFirstQuestion ? "Loading your first question..." :
                  timer.timeRemaining <= 0 ? "Time's up! Your ice cream melted" : 
                  "Type your response..."
                }
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={timer.timeRemaining <= 0 || isThinking || isLoadingFirstQuestion}
              />
              <button 
                className="send-btn"
                onClick={handleSubmit}
                disabled={timer.timeRemaining <= 0 || isThinking || !userInput.trim() || isLoadingFirstQuestion}
              >
                <MessageCircle size={20} />
              </button>
            </div>
            
            {/* Hint System */}
            <div className="hint-system">
              {!hints.hintsExhausted ? (
                <HintCounter
                  hintsRemaining={hints.hintsRemaining}
                  onHintRequest={handleHintRequest}
                  canUseHint={hints.canUseHint}
                  isRequestingHint={hints.isRequestingHint}
                />
              ) : (
                <div className="exhausted-hints-actions">
                  <div className="exhausted-message">
                    <Lightbulb size={20} />
                    <span>No more hints available! Choose your next step:</span>
                  </div>
                  <div className="action-buttons">
                    <button className="action-btn visualize-btn" onClick={handleVisualize}>
                      <Code size={18} />
                      Visualize with Code
                    </button>
                    <button className="action-btn break-btn" onClick={handleTakeBreak}>
                      <Coffee size={18} />
                      Take a Break
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="session-controls">
              <div className="progress-info">
                <CheckCircle size={16} className="progress-icon" />
                <span>{exchangeCount} exchanges • Streak: {correctStreak}</span>
                {!isAuthenticated && (
                  <>
                    <span className="separator">•</span>
                    <span className="anonymous-indicator">Guest Session</span>
                  </>
                )}
              </div>
              
              <button onClick={handleBackToDashboard} className="btn btn-secondary btn-sm">
                <Home size={16} />
                {isAuthenticated ? 'Dashboard' : 'Start Page'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="modal-overlay info-modal-overlay" onClick={handleInfoClose}>
            <div className="modal-content info-modal simplified" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header simplified">
                <div className="modal-title">
                  <span className="modal-icon">Learning Session Info</span>
                  <div>
                    <h2>Learning Session Info</h2>
                    <div className="modal-badges">
                      <span className="category-badge">{sessionData.topicData?.category || 'Computer Science'}</span>
                      <span className="difficulty-badge">{sessionData.topicData?.difficulty || 'Intermediate'}</span>
                      <span className="timer-badge">Timer Paused</span>
                      {!isAuthenticated && <span className="user-badge">Guest Session</span>}
                    </div>
                  </div>
                </div>
                <button className="modal-close simplified" onClick={handleInfoClose}>
                  <span>✕</span>
                  <span className="close-hint">Resume</span>
                </button>
              </div>
              
              <div className="modal-body simplified">
                <div className="info-content">
                  <div className="welcome-text">
                    <p>You're learning <strong>{topicName}</strong> with AI-powered Socratic tutoring.</p>
                    <p>Your Ice Cream Timer: Watch your ice cream melt as time passes! Answer thoughtfully to refreeze it and gain more focus time.</p>
                    <p>Hint System: You have {hints.hintsRemaining} hints remaining. Use them wisely when you get stuck!</p>
                    <p>I'm your Socratic tutor - I'll guide you to discover answers through strategic questions rather than giving direct answers.</p>
                    <p>Take your time to think through each question and explain your reasoning for the best learning experience!</p>
                    {!isAuthenticated && (
                      <p><strong>Guest Session:</strong> Your progress is saved locally. Create an account to save it permanently and unlock advanced features!</p>
                    )}
                  </div>
                  
                  <div className="current-session-info">
                    <h3>Current Session</h3>
                    <div className="session-summary">
                      <div className="summary-item">
                        <strong>Topic:</strong> {topicName}
                      </div>
                      <div className="summary-item">
                        <strong>Learning Path:</strong> {learningPaths[sessionData.learningPath]?.name || 'Unknown'}
                      </div>
                      <div className="summary-item">
                        <strong>Question Style:</strong> {questioningStyles[currentQuestioningStyle]?.name || 'Unknown'}
                      </div>
                      <div className="summary-item">
                        <strong>Progress:</strong> {exchangeCount} exchanges completed
                      </div>
                      <div className="summary-item">
                        <strong>Hints:</strong> {hints.hintsRemaining} remaining
                      </div>
                      <div className="summary-item">
                        <strong>User Type:</strong> {isAuthenticated ? 'Registered' : 'Guest'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer simplified">
                <button onClick={handleInfoClose} className="btn btn-primary">
                  <Play size={16} />
                  Resume Learning
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningSession;