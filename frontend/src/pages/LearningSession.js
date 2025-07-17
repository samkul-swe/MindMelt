// ============================================================================
// pages/LearningSession.js - Progressive Auth Support
// ============================================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Play, 
  Pause, 
  RotateCcw, 
  RefreshCw, 
  CheckCircle, 
  MessageCircle, 
  User, 
  Bot,
  Home,
  Info,
  Settings,
  Lightbulb,
  Coffee,
  Code,
  Mail,
  Sparkles,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/authAPI';
import { getSocraticResponse, getHintResponse, assessUnderstandingQuality } from '../services/aiService';
import { useApiKey } from '../hooks/useApiKey';
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

// Anonymous user prompts - show after certain milestones
const ANONYMOUS_PROMPTS = {
  AFTER_EXCHANGES: [3, 8, 15], // Show after 3, 8, and 15 exchanges
  SAVE_PROGRESS: {
    title: "Save Your Progress? 💾",
    message: "You're doing great! Want to save your learning progress and unlock advanced features?",
    benefits: [
      "📊 Track your learning analytics",
      "🎯 Get personalized recommendations", 
      "🏆 Earn achievement badges",
      "📱 Access from any device"
    ]
  },
  FINAL_REMINDER: {
    title: "Don't Lose Your Progress! ⚠️",
    message: "You've made excellent progress! Create an account to save everything you've learned.",
    urgent: true
  }
};

const learningPaths = {
  conceptual: { 
    name: "Conceptual Track", 
    description: "Deep understanding of core concepts - focus on the 'why'",
    icon: "🧠"
  },
  applied: { 
    name: "Applied Track", 
    description: "Practical implementation and real-world examples",
    icon: "⚡"
  },
  comprehensive: { 
    name: "Comprehensive Track", 
    description: "Complete mastery with theory and practice combined",
    icon: "🎯"
  }
};

const questioningStyles = {
  socratic: { 
    name: "Socratic Method", 
    description: "Guided discovery through strategic questions that build understanding step by step",
    icon: "💭"
  },
  scenario: { 
    name: "Scenario-Based", 
    description: "Real-world problem scenarios and practical use cases to explore concepts",
    icon: "🌍"
  },
  puzzle: { 
    name: "Puzzle & Brain Teaser", 
    description: "Challenge-based learning with creative problem solving and logic puzzles",
    icon: "🧩"
  },
  analogy: { 
    name: "Analogy & Metaphor", 
    description: "Learn through comparisons, analogies, and familiar everyday examples",
    icon: "🔗"
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

// Ice Cream Timer Component (keeping existing implementation)
const IceCreamTimer = React.memo(({ timeLeft, totalTime, isRunning }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dripsRef = useRef([]);
  const lastUpdateRef = useRef(0);
  
  const percentage = useMemo(() => (timeLeft / totalTime) * 100, [timeLeft, totalTime]);
  const meltLevel = useMemo(() => (100 - percentage) / 100, [percentage]);

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

    class Drip {
      constructor(x, y, color, size = 1.5) {
        this.x = x;
        this.y = y;
        this.originalY = y;
        this.color = color;
        this.size = size;
        this.speed = Math.random() * 0.4 + 0.2;
        this.opacity = 0.8;
        this.life = 1.0;
      }

      update() {
        this.y += this.speed;
        this.speed += 0.015;
        this.life -= 0.006;
        this.opacity = Math.max(0, this.life * 0.8);
        
        if (this.y > 75 || this.life <= 0) {
          this.y = this.originalY;
          this.life = 1.0;
          this.opacity = 0.8;
          this.speed = Math.random() * 0.4 + 0.2;
        }
      }

      draw(ctx) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const updateDrips = () => {
      const targetDripCount = Math.floor(meltLevel * 6);
      const colors = ['#fbbf24', '#f59e0b', '#f97316', '#ec4899'];
      
      while (dripsRef.current.length < targetDripCount) {
        dripsRef.current.push(new Drip(
          15 + Math.random() * 30,
          32 + Math.random() * 8,
          colors[Math.floor(Math.random() * colors.length)]
        ));
      }
      
      dripsRef.current = dripsRef.current.slice(0, targetDripCount);
    };

    const drawIceCream = (timestamp) => {
      if (timestamp - lastUpdateRef.current < 33) {
        if (isRunning || dripsRef.current.length > 0) {
          animationRef.current = requestAnimationFrame(drawIceCream);
        }
        return;
      }
      lastUpdateRef.current = timestamp;

      ctx.clearRect(0, 0, 60, 80);
      
      // Draw cone
      const coneGradient = ctx.createLinearGradient(0, 40, 0, 70);
      coneGradient.addColorStop(0, '#d97706');
      coneGradient.addColorStop(1, '#92400e');
      
      ctx.fillStyle = coneGradient;
      ctx.beginPath();
      ctx.moveTo(18, 40);
      ctx.lineTo(42, 40);
      ctx.lineTo(30, 70);
      ctx.closePath();
      ctx.fill();

      const meltSag = meltLevel * 10;
      
      const drawMeltingScoop = (centerX, centerY, radius, color, meltAmount) => {
        const gradient = ctx.createRadialGradient(centerX - 3, centerY - 3, 0, centerX, centerY, radius);
        gradient.addColorStop(0, color.light);
        gradient.addColorStop(1, color.dark);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY + meltAmount * 5, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Draw scoops with melting effects - always visible
      if (percentage > -10) {
        const opacity = Math.max(0.3, percentage / 100);
        ctx.globalAlpha = opacity;
        drawMeltingScoop(30, 32 + meltSag, 13, 
          { light: '#fef3c7', dark: '#f59e0b' }, meltLevel);
        ctx.globalAlpha = 1;
      }
      
      if (percentage > -40) {
        const opacity = Math.max(0.3, percentage / 100);
        ctx.globalAlpha = opacity;
        drawMeltingScoop(30, 22 + meltSag * 0.7, 11, 
          { light: '#fce7f3', dark: '#ec4899' }, meltLevel * 0.8);
        ctx.globalAlpha = 1;
      }
      
      if (percentage > -70) {
        const opacity = Math.max(0.3, percentage / 100);
        ctx.globalAlpha = opacity;
        drawMeltingScoop(30, 14 + meltSag * 0.5, 9, 
          { light: '#fed7aa', dark: '#ea580c' }, meltLevel * 0.6);
        ctx.globalAlpha = 1;
      }

      updateDrips();
      dripsRef.current.forEach(drip => {
        if (isRunning) drip.update();
        drip.draw(ctx);
      });

      if (isRunning || dripsRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(drawIceCream);
      }
    };

    animationRef.current = requestAnimationFrame(drawIceCream);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, meltLevel, isRunning]);

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

// Anonymous User Progress Prompt Component
const AnonymousProgressPrompt = React.memo(({ 
  prompt, 
  onSaveProgress, 
  onDismiss, 
  exchangeCount,
  isVisible,
  isUrgent = false
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveProgress(email, name);
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="anonymous-progress-prompt">
      <div className="prompt-overlay" onClick={onDismiss} />
      <div className={`prompt-card ${isUrgent ? 'urgent' : ''}`}>
        <div className="prompt-header">
          <div className="prompt-title">
            <Sparkles size={24} />
            <h3>{prompt.title}</h3>
          </div>
          <button 
            className="prompt-close"
            onClick={onDismiss}
            title="Continue without saving"
          >
            <X size={20} />
          </button>
        </div>

        <div className="prompt-body">
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-number">{exchangeCount}</span>
              <span className="stat-label">Questions Answered</span>
            </div>
            <div className="stat">
              <span className="stat-number">{Math.floor(exchangeCount * 1.5)}</span>
              <span className="stat-label">Minutes Learning</span>
            </div>
          </div>

          <p className="prompt-message">{prompt.message}</p>

          {prompt.benefits && (
            <div className="prompt-benefits">
              <h4>What you'll unlock:</h4>
              <ul>
                {prompt.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="prompt-form">
            <div className="form-group">
              <label htmlFor="prompt-name">
                <User size={16} />
                Your Name (optional)
              </label>
              <input
                type="text"
                id="prompt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prompt-email">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="prompt-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to save progress"
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="prompt-actions">
              <button
                type="button"
                onClick={onDismiss}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Continue Learning
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save My Progress
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
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

// Exhausted Hints Actions Component
const ExhaustedHintsActions = React.memo(({ onVisualize, onTakeBreak }) => (
  <div className="exhausted-hints-actions">
    <div className="exhausted-message">
      <Lightbulb size={20} />
      <span>No more hints available! Choose your next step:</span>
    </div>
    <div className="action-buttons">
      <button className="action-btn visualize-btn" onClick={onVisualize}>
        <Code size={18} />
        Visualize with Code
      </button>
      <button className="action-btn break-btn" onClick={onTakeBreak}>
        <Coffee size={18} />
        Take a Break
      </button>
    </div>
  </div>
));

// Main Learning Session Component
const LearningSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const { 
    currentUser, 
    isRegistered, 
    isAnonymous, 
    signupWithEmail, 
    updateAnonymousUser 
  } = useAuth();

  // Session State
  const [sessionData, setSessionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [progress, setProgress] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [currentQuestioningStyle, setCurrentQuestioningStyle] = useState('socratic');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isLoadingFirstQuestion, setIsLoadingFirstQuestion] = useState(true);
  const [sessionStartTime] = useState(Date.now());

  // Anonymous user progress tracking
  const [showProgressPrompt, setShowProgressPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);

  const timer = useTimer();
  const hints = useHints();
  const apiKeyManager = useApiKey();
  const messageEndRef = useRef(null);
  
  // Refs for click-outside detection
  const styleDropdownRef = useRef(null);
  const styleBadgeRef = useRef(null);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showStyleSelector &&
        styleDropdownRef.current &&
        styleBadgeRef.current &&
        !styleDropdownRef.current.contains(event.target) &&
        !styleBadgeRef.current.contains(event.target)
      ) {
        setShowStyleSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStyleSelector]);

  // Check if we should show progress prompt for anonymous users
  useEffect(() => {
    if (isAnonymous && !promptDismissed && !showProgressPrompt) {
      const shouldShowPrompt = ANONYMOUS_PROMPTS.AFTER_EXCHANGES.includes(exchangeCount);
      if (shouldShowPrompt) {
        setShowProgressPrompt(true);
      }
    }
  }, [exchangeCount, isAnonymous, promptDismissed, showProgressPrompt]);

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, [sessionId, location.state]);

  const initializeSession = async () => {
    try {
      let sessionInfo = null;

      if (sessionId && sessionId !== 'new') {
        // Load existing session (only for registered users)
        if (isRegistered) {
          try {
            sessionInfo = await api.getLearningSession(sessionId);
            setMessages(sessionInfo.messages || []);
            setProgress(sessionInfo.progress || []);
            setCorrectStreak(sessionInfo.correctStreak || 0);
            setCurrentQuestioningStyle(sessionInfo.questioningStyle || 'socratic');
            setExchangeCount(sessionInfo.exchangeCount || 0);
            
            // Restore hint state
            if (sessionInfo.hintsRemaining !== undefined) {
              hints.setHintsRemaining(sessionInfo.hintsRemaining);
            }
            
            // Restore timer state
            if (sessionInfo.timerRemaining) {
              timer.setTimeRemaining(sessionInfo.timerRemaining);
            }
          } catch (error) {
            console.error('Failed to load session:', error);
            navigate('/dashboard', { replace: true });
            return;
          }
        } else {
          // Anonymous users can't load existing sessions
          navigate('/start', { replace: true });
          return;
        }
      } else {
        // New session from location state
        sessionInfo = location.state;
        if (!sessionInfo?.isNewSession || !sessionInfo?.topicData) {
          navigate('/start', { replace: true });
          return;
        }

        // Create new session in backend only for registered users
        if (isRegistered) {
          try {
            const newSession = await api.createLearningSession({
              topicName: sessionInfo.topicData.name,
              topicData: sessionInfo.topicData,
              learningPath: sessionInfo.learningPath,
              questioningStyle: sessionInfo.questioningStyle || 'socratic',
              hintsRemaining: HINT_CONSTANTS.MAX_HINTS,
              exchangeCount: 0
            });
            
            // Update URL with new session ID
            navigate(`/learn/${newSession.id}`, { replace: true, state: null });
          } catch (error) {
            console.error('Failed to create session:', error);
            // Continue with local session
          }
        }
      }

      setSessionData(sessionInfo);
      setCurrentQuestioningStyle(sessionInfo.questioningStyle || 'socratic');
      
      // Start timer
      timer.setTimerActive(true);
      
      // Get first question if new session
      if (!sessionId || sessionId === 'new') {
        await getFirstQuestion(sessionInfo);
      } else {
        setIsLoadingFirstQuestion(false);
      }

    } catch (error) {
      console.error('Failed to initialize session:', error);
      navigate('/start', { replace: true });
    }
  };

  const getFirstQuestion = useCallback(async (sessionInfo) => {
    const apiKey = apiKeyManager.getCurrentApiKey();
    if (!apiKey) {
      setIsLoadingFirstQuestion(false);
      return;
    }

    try {
      setIsLoadingFirstQuestion(true);
      
      const topicName = sessionInfo.topicData?.name || sessionInfo.selectedTopicData?.name;
      const learningPathName = learningPaths[sessionInfo.learningPath].name;
      
      const firstQuestion = await getSocraticResponse(
        topicName,
        `I'm ready to learn about ${topicName} using the ${learningPathName} approach. Let's begin!`,
        sessionInfo.learningPath,
        sessionInfo.questioningStyle || 'socratic',
        apiKey
      );
      
      const firstMessage = createMessage(MESSAGE_TYPES.BOT, firstQuestion);
      setMessages([firstMessage]);
      
      // Add welcome message for anonymous users
      if (isAnonymous) {
        const welcomeMessage = createMessage(MESSAGE_TYPES.SYSTEM, 
          `🎉 Welcome to MindMelt! You're learning as an anonymous user. Your progress will be saved locally, but you can create an account anytime to save it permanently.`,
          { isWelcome: true }
        );
        setMessages(prev => [welcomeMessage, ...prev]);
      }
      
    } catch (error) {
      console.error('Failed to get first question:', error);
      const fallbackQuestion = `Welcome to learning ${sessionInfo.topicData?.name || 'this topic'}! 🧠 What would you like to explore first?`;
      const fallbackMessage = createMessage(MESSAGE_TYPES.BOT, fallbackQuestion);
      setMessages([fallbackMessage]);
    } finally {
      setIsLoadingFirstQuestion(false);
    }
  }, [apiKeyManager, isAnonymous]);

  // Handle anonymous user progress saving
  const handleSaveProgress = useCallback(async (email, name) => {
    try {
      await signupWithEmail(email, name);
      
      // Show success message
      const successMessage = createMessage(MESSAGE_TYPES.SYSTEM,
        `🎉 Account created successfully! Your progress is now saved. Welcome to MindMelt, ${name || 'learner'}!`,
        { isBonus: true }
      );
      setMessages(prev => [...prev, successMessage]);
      
      setShowProgressPrompt(false);
      setPromptDismissed(true);
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save progress:', error);
      const errorMessage = createMessage(MESSAGE_TYPES.SYSTEM,
        `❌ Failed to create account: ${error.message}`,
        { isError: true }
      );
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [signupWithEmail, navigate]);

  const handleDismissProgressPrompt = useCallback(() => {
    setShowProgressPrompt(false);
    setPromptDismissed(true);
  }, []);

  // Request hint function
  const handleHintRequest = useCallback(async () => {
    if (!hints.canUseHint || !sessionData) return;
    
    const currentApiKey = apiKeyManager.getCurrentApiKey();
    if (!currentApiKey) {
      return;
    }
    
    hints.setIsRequestingHint(true);
    
    try {
      const topicName = sessionData.topicData?.name || sessionData.selectedTopicData?.name;
      const recentMessages = messages.slice(-6); // Get last 6 messages for context
      const conversationContext = recentMessages.map(msg => 
        `${msg.type === MESSAGE_TYPES.USER ? 'Student' : 'Tutor'}: ${msg.content}`
      ).join('\n');
      
      const hintResponse = await getHintResponse(
        topicName,
        conversationContext,
        sessionData.learningPath,
        currentQuestioningStyle,
        currentApiKey
      );
      
      const hintMessage = createMessage(MESSAGE_TYPES.HINT, hintResponse, { isHint: true });
      setMessages(prev => [...prev, hintMessage]);
      
      hints.useHint();
      
    } catch (error) {
      const errorMessage = createMessage(MESSAGE_TYPES.BOT,
        `❌ Hint Error: ${error.message}`,
        { isError: true }
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      hints.setIsRequestingHint(false);
    }
  }, [hints, sessionData, apiKeyManager, messages, currentQuestioningStyle]);

  // Handle visualization action
  const handleVisualize = useCallback(() => {
    const visualizationMessage = createMessage(MESSAGE_TYPES.BOT,
      "🎨 Let's create a visualization! Try writing some code to represent what you've learned about this topic. You can use pseudocode, diagrams, or actual code snippets.",
      { isBonus: true }
    );
    setMessages(prev => [...prev, visualizationMessage]);
  }, []);

  // Handle take break action
  const handleTakeBreak = useCallback(() => {
    timer.togglePause();
    const breakMessage = createMessage(MESSAGE_TYPES.BOT,
      "☕ Taking a break is important for learning! Your timer is paused. When you're ready, feel free to continue our discussion or return to the dashboard.",
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
              "🍦💧 Time's up! Your ice cream has melted. Great learning session though!",
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

  // Save session periodically (only for registered users)
  useEffect(() => {
    if (!sessionData || !sessionId || sessionId === 'new' || !isRegistered) return;

    const saveSession = async () => {
      try {
        await api.updateLearningSession(sessionId, {
          messages,
          progress,
          correctStreak,
          questioningStyle: currentQuestioningStyle,
          timerRemaining: timer.timeRemaining,
          hintsRemaining: hints.hintsRemaining,
          exchangeCount,
          duration: Math.floor((Date.now() - sessionStartTime) / 1000),
          lastActivity: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    };

    const saveInterval = setInterval(saveSession, 30000); // Save every 30 seconds
    return () => clearInterval(saveInterval);
  }, [sessionData, sessionId, isRegistered, messages, progress, correctStreak, currentQuestioningStyle, timer.timeRemaining, hints.hintsRemaining, exchangeCount, sessionStartTime]);

  // Update anonymous user progress in localStorage
  useEffect(() => {
    if (isAnonymous && currentUser) {
      updateAnonymousUser({
        sessionCount: exchangeCount,
        lastActivity: new Date().toISOString(),
        totalQuestions: exchangeCount
      });
    }
  }, [exchangeCount, isAnonymous, currentUser, updateAnonymousUser]);

  const handleSubmit = useCallback(async () => {
    if (!userInput.trim() || isThinking || timer.timeRemaining <= 0 || !sessionData) return;
    
    const currentApiKey = apiKeyManager.getCurrentApiKey();
    if (!currentApiKey) {
      return;
    }
    
    setIsThinking(true);
    
    const userMessage = createMessage(MESSAGE_TYPES.USER, userInput);
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const topicName = sessionData.topicData?.name || sessionData.selectedTopicData?.name;
      const botReply = await getSocraticResponse(
        topicName, 
        userInput, 
        sessionData.learningPath, 
        currentQuestioningStyle,
        currentApiKey
      );
      
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
          "🍦✨ Great progress! Your ice cream is refreezing - you've earned more focus time!",
          { isBonus: true }
        )]);
      }
      
    } catch (error) {
      const errorMessage = createMessage(MESSAGE_TYPES.BOT,
        `❌ Error: ${error.message}`,
        { isError: true }
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setUserInput('');
    }
  }, [userInput, isThinking, timer, apiKeyManager, sessionData, progress, currentQuestioningStyle]);

  const handleBackToDashboard = useCallback(() => {
    if (isRegistered) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/start', { replace: true });
    }
  }, [navigate, isRegistered]);

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

  const restartWithNewQuestioningStyle = useCallback(async (newQuestioningStyle) => {
    if (!sessionData) return;
    
    const updatedSessionData = {
      ...sessionData,
      questioningStyle: newQuestioningStyle
    };
    
    setSessionData(updatedSessionData);
    setCurrentQuestioningStyle(newQuestioningStyle);
    setMessages([]);
    setProgress([]);
    setCorrectStreak(0);
    setExchangeCount(0);
    setUserInput('');
    setIsThinking(false);
    
    // Reset hints when restarting
    hints.resetHints();
    
    timer.setTimeRemaining(TIMER_CONSTANTS.INITIAL_TIME);
    timer.setTimerActive(true);
    
    const restartMessage = createMessage(MESSAGE_TYPES.BOT, 
      `🎯 Questioning style changed to ${questioningStyles[newQuestioningStyle].name}! Starting fresh with new questions and full hints restored.`, 
      { isBonus: true }
    );
    setMessages([restartMessage]);
    
    setTimeout(() => {
      getFirstQuestion(updatedSessionData);
    }, 1000);
    
  }, [sessionData, timer, hints, getFirstQuestion]);

  if (!sessionData) {
    return <LoadingSpinner message="Loading your learning session..." />;
  }

  const topicName = sessionData.topicData?.name || sessionData.selectedTopicData?.name || 'Unknown Topic';

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
                  title={isRegistered ? "Back to Dashboard" : "Back to Start"}
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
                  {learningPaths[sessionData.learningPath].icon} {learningPaths[sessionData.learningPath].name}
                </div>

                <div className="style-selector-container">
                  <button 
                    ref={styleBadgeRef}
                    className="style-badge clickable enhanced"
                    onClick={() => setShowStyleSelector(!showStyleSelector)}
                    title="Click to change questioning style (restarts session)"
                  >
                    {questioningStyles[currentQuestioningStyle].icon} {questioningStyles[currentQuestioningStyle].name}
                    <span className="dropdown-arrow">🔄</span>
                  </button>
                  
                  {showStyleSelector && (
                    <>
                      <div className="dropdown-overlay" />
                      <div ref={styleDropdownRef} className="style-dropdown enhanced">
                        <div className="dropdown-header enhanced">
                          <h4>💭 Change Questioning Style</h4>
                          <p>⚠️ This will restart your session with fresh questions</p>
                        </div>
                        {Object.entries(questioningStyles).map(([key, style]) => (
                          <button
                            key={key}
                            className={`style-option concise ${currentQuestioningStyle === key ? 'active' : ''}`}
                            onClick={() => {
                              if (key !== currentQuestioningStyle) {
                                restartWithNewQuestioningStyle(key);
                              }
                              setShowStyleSelector(false);
                            }}
                          >
                            <span className="style-option-icon">{style.icon}</span>
                            <span className="style-option-name">{style.name}</span>
                            {currentQuestioningStyle === key && <span className="current-badge">Current</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button 
                  className="info-btn enhanced"
                  onClick={handleInfoClick}
                  title="Session Information (Auto-pauses timer)"
                >
                  <Info size={18} />
                  <span className="info-text">Info</span>
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
                    {showInfo && <span className="paused-label"> • Paused</span>}
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
                <p>🧠 Preparing your {learningPaths[sessionData.learningPath].name.toLowerCase()} question...</p>
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
                timer.timeRemaining <= 0 ? "Time's up! Your ice cream melted 🍦💧" : 
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
              onPaste={(e) => {
                e.preventDefault();
                // Show a brief message to the user
                const pasteWarning = createMessage(MESSAGE_TYPES.BOT,
                  "🚫 Pasting is disabled to encourage authentic learning. Please type your thoughts and responses!",
                  { isError: true }
                );
                setMessages(prev => [...prev, pasteWarning]);
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
                <ExhaustedHintsActions
                  onVisualize={handleVisualize}
                  onTakeBreak={handleTakeBreak}
                />
              )}
            </div>
            
            <div className="session-controls">
              <div className="progress-info">
                <CheckCircle size={16} className="progress-icon" />
                <span>{exchangeCount} exchanges • Streak: {correctStreak} 🔥</span>
                {isAnonymous && (
                  <>
                    <span className="separator">•</span>
                    <span className="anonymous-indicator">Anonymous Session</span>
                  </>
                )}
              </div>
              
              <button onClick={handleBackToDashboard} className="btn btn-secondary btn-sm">
                <Home size={16} />
                {isRegistered ? 'Dashboard' : 'Start Page'}
              </button>
            </div>
          </div>
        </div>

        {/* Anonymous Progress Prompt */}
        {isAnonymous && (
          <AnonymousProgressPrompt
            prompt={
              exchangeCount >= 15 
                ? ANONYMOUS_PROMPTS.FINAL_REMINDER
                : ANONYMOUS_PROMPTS.SAVE_PROGRESS
            }
            onSaveProgress={handleSaveProgress}
            onDismiss={handleDismissProgressPrompt}
            exchangeCount={exchangeCount}
            isVisible={showProgressPrompt}
            isUrgent={exchangeCount >= 15}
          />
        )}

        {/* Info Modal - keeping existing implementation */}
        {showInfo && (
          <div className="modal-overlay info-modal-overlay" onClick={handleInfoClose}>
            <div className="modal-content info-modal simplified" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header simplified">
                <div className="modal-title">
                  <span className="modal-icon">🧠</span>
                  <div>
                    <h2>Learning Session Info</h2>
                    <div className="modal-badges">
                      <span className="category-badge">{sessionData.topicData?.category || 'Computer Science'}</span>
                      <span className="difficulty-badge">{sessionData.topicData?.difficulty || 'Intermediate'}</span>
                      <span className="timer-badge">⏸️ Timer Paused</span>
                      {isAnonymous && <span className="user-badge">👤 Anonymous</span>}
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
                    <p>🧠 You're learning <strong>{topicName}</strong> with AI-powered Socratic tutoring.</p>
                    <p>🍦 Your Ice Cream Timer: Watch your ice cream melt as time passes! Answer thoughtfully to refreeze it and gain more focus time.</p>
                    <p>💡 Hint System: You have {hints.hintsRemaining} hints remaining. Use them wisely when you get stuck!</p>
                    <p>🎯 I'm your Socratic tutor - I'll guide you to discover answers through strategic questions rather than giving direct answers.</p>
                    <p>💡 Take your time to think through each question and explain your reasoning for the best learning experience!</p>
                    {isAnonymous && (
                      <p>👤 <strong>Anonymous Session:</strong> Your progress is saved locally. Create an account to save it permanently and unlock advanced features!</p>
                    )}
                  </div>
                  
                  <div className="current-session-info">
                    <h3>📚 Current Session</h3>
                    <div className="session-summary">
                      <div className="summary-item">
                        <strong>Topic:</strong> {topicName}
                      </div>
                      <div className="summary-item">
                        <strong>Learning Path:</strong> {learningPaths[sessionData.learningPath].name}
                      </div>
                      <div className="summary-item">
                        <strong>Question Style:</strong> {questioningStyles[currentQuestioningStyle].name}
                      </div>
                      <div className="summary-item">
                        <strong>Progress:</strong> {exchangeCount} exchanges completed
                      </div>
                      <div className="summary-item">
                        <strong>Hints:</strong> {hints.hintsRemaining} remaining
                      </div>
                      <div className="summary-item">
                        <strong>User Type:</strong> {isAnonymous ? 'Anonymous' : 'Registered'}
                      </div>
                    </div>
                  </div>

                  <div className="questioning-styles-info">
                    <h3>💭 Available Questioning Styles</h3>
                    <p className="styles-intro">You can change your questioning style anytime. Each style offers a different approach:</p>
                    
                    <div className="styles-info-list">
                      {Object.entries(questioningStyles).map(([key, style]) => (
                        <div key={key} className={`style-info-item ${currentQuestioningStyle === key ? 'current' : ''}`}>
                          <div className="style-info-header">
                            <span className="style-info-icon">{style.icon}</span>
                            <span className="style-info-name">{style.name}</span>
                            {currentQuestioningStyle === key && <span className="current-indicator">Current</span>}
                          </div>
                          <p className="style-info-desc">{style.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer simplified">
                <button onClick={handleInfoClose} className="btn btn-primary">
                  <Play size={16} />
                  Resume Learning 🚀
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