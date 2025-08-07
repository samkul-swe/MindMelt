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
  Code
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authAPI';
import aiAPI from '../services/aiAPI';
import { useApiKey } from '../hooks/useApiKey';
import LoadingSpinner from '../components/LoadingSpinner';

import '../styles/pages/learning-session.css';
import '../styles/components/buttons.css';
import '../styles/components/modals.css';

const TIMER_CONSTANTS = {
  INITIAL_TIME: 8 * 60, // 8 minutes
  MAX_TIME: 25 * 60, // 25 minutes
  TIME_BONUS: 180, // 3 minutes
  WARNING_THRESHOLD: 300 // 5 minutes
};

const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  HINT: 'hint'
};

const HINT_CONSTANTS = {
  MAX_HINTS: 3,
  RESET_ON_NEW_TOPIC: true
};

const learningPaths = {
  conceptual: { 
    name: "Conceptual Track", 
    description: "Deep understanding of core concepts - focus on the 'why'"
  },
  applied: { 
    name: "Applied Track", 
    description: "Practical implementation and real-world examples"
  },
  comprehensive: { 
    name: "Comprehensive Track", 
    description: "Complete mastery with theory and practice combined"
  }
};

const questioningStyles = {
  socratic: { 
    name: "Socratic Method", 
    description: "Guided discovery through strategic questions that build understanding step by step"
  },
  scenario: { 
    name: "Scenario-Based", 
    description: "Real-world problem scenarios and practical use cases to explore concepts"
  },
  puzzle: { 
    name: "Puzzle & Brain Teaser", 
    description: "Challenge-based learning with creative problem solving and logic puzzles"
  },
  analogy: { 
    name: "Analogy & Metaphor", 
    description: "Learn through comparisons, analogies, and familiar everyday examples"
  }
};

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

      const coneGradient = ctx.createLinearGradient(0, 50, 0, 80);
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

      if (percentage > -10) {
        const opacity = Math.max(0.3, percentage / 100);
        ctx.globalAlpha = opacity;
        drawMeltingScoop(30, 32 + meltSag, 13, 
          { light: '#FF8A56', dark: '#FF6B35' }, meltLevel);
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

const Message = React.memo(({ message }) => (
  <div className={`message ${message.type}`}>
    <div className="message-avatar">
      {message.type === MESSAGE_TYPES.USER ? <User size={20} /> : 
       message.type === MESSAGE_TYPES.HINT ? <Lightbulb size={20} /> :
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
  return classes.join(' ');
};

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

const LearningSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [sessionData, setSessionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [progress, setProgress] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [currentQuestioningStyle, setCurrentQuestioningStyle] = useState('socratic');
  const [currentLearningPath, setCurrentLearningPath] = useState('comprehensive');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [isLoadingFirstQuestion, setIsLoadingFirstQuestion] = useState(true);
  const [sessionStartTime] = useState(Date.now());
  const [isRestartingPath, setIsRestartingPath] = useState(false);
  const [isRestartingStyle, setIsRestartingStyle] = useState(false);

  const timer = useTimer();
  const hints = useHints();
  const apiKeyManager = useApiKey();
  const messageEndRef = useRef(null);

  const styleDropdownRef = useRef(null);
  const styleBadgeRef = useRef(null);
  const pathDropdownRef = useRef(null);
  const pathBadgeRef = useRef(null);

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

      if (
        showPathSelector &&
        pathDropdownRef.current &&
        pathBadgeRef.current &&
        !pathDropdownRef.current.contains(event.target) &&
        !pathBadgeRef.current.contains(event.target)
      ) {
        setShowPathSelector(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowStyleSelector(false);
        setShowPathSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showStyleSelector, showPathSelector]);

  useEffect(() => {
    initializeSession();
  }, [sessionId, location.state]);

  const initializeSession = async () => {
    try {
      let sessionInfo = null;

      if (sessionId && sessionId !== 'new') {
        try {
          sessionInfo = await authAPI.getLearningSession(sessionId);
          setMessages(sessionInfo.messages || []);
          setProgress(sessionInfo.progress || []);
          setCorrectStreak(sessionInfo.correctStreak || 0);
          setCurrentQuestioningStyle(sessionInfo.questioningStyle || 'socratic');
          setCurrentLearningPath(sessionInfo.learningPath || 'comprehensive');

          if (sessionInfo.hintsRemaining !== undefined) {
            hints.setHintsRemaining(sessionInfo.hintsRemaining);
          }

          if (sessionInfo.timerRemaining) {
            timer.setTimeRemaining(sessionInfo.timerRemaining);
          }
        } catch (error) {
          console.error('Failed to load session:', error);
          navigate('/', { replace: true });
          return;
        }
      } else {
        sessionInfo = location.state;
        if (!sessionInfo?.isNewSession || !sessionInfo?.topicData) {
          navigate('/', { replace: true });
          return;
        }

        try {
          const newSession = await authAPI.createLearningSession({
            topicName: sessionInfo.topicData.name,
            topicData: sessionInfo.topicData,
            learningPath: sessionInfo.learningPath || 'comprehensive',
            questioningStyle: sessionInfo.questioningStyle || 'socratic',
            hintsRemaining: HINT_CONSTANTS.MAX_HINTS
          });

          navigate(`/learn/${newSession.id}`, { replace: true, state: null });
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      }

      setSessionData(sessionInfo);
      setCurrentQuestioningStyle(sessionInfo.questioningStyle || 'socratic');
      setCurrentLearningPath(sessionInfo.learningPath || 'comprehensive');

      timer.setTimerActive(true);

      if (!sessionId || sessionId === 'new') {
        await getFirstQuestion(sessionInfo);
      } else {
        setIsLoadingFirstQuestion(false);
      }

    } catch (error) {
      console.error('Failed to initialize session:', error);
      navigate('/', { replace: true });
    }
  };

  const getFirstQuestion = useCallback(async (sessionInfo) => {
    try {
      setIsLoadingFirstQuestion(true);
      
      const topicName = sessionInfo.topicData?.name || sessionInfo.selectedTopicData?.name;
      const learningPathName = learningPaths[sessionInfo.learningPath].name;

      const initialResponse = `I'm ready to learn about ${topicName} using the ${learningPathName} approach. I'm excited to explore this topic through ${questioningStyles[sessionInfo.questioningStyle || 'socratic'].name.toLowerCase()}. Let's begin!`;
      
      const firstQuestion = await aiAPI.getSocraticResponse(
        topicName,
        initialResponse,
        sessionInfo.learningPath || 'comprehensive',
        sessionInfo.questioningStyle || 'socratic'
      );

      const displayText = typeof firstQuestion === 'string' ? firstQuestion : 
                         (firstQuestion?.displayText || firstQuestion?.pun + '\n\n' + firstQuestion?.question || 'Let\'s begin learning!');
      
      const firstMessage = createMessage(MESSAGE_TYPES.BOT, displayText);
      setMessages([firstMessage]);
      
    } catch (error) {
      console.error('Failed to get first question:', error);
      const fallbackQuestion = `Welcome to learning ${sessionInfo.topicData?.name || 'this topic'}! 🧠 What would you like to explore first?`;
      const fallbackMessage = createMessage(MESSAGE_TYPES.BOT, fallbackQuestion);
      setMessages([fallbackMessage]);
    } finally {
      setIsLoadingFirstQuestion(false);
    }
  }, []);

  const handleHintRequest = useCallback(async () => {
    if (!hints.canUseHint || !sessionData) return;
    
    hints.setIsRequestingHint(true);
    
    try {
      const topicName = sessionData.topicData?.name || sessionData.selectedTopicData?.name;
      const recentMessages = messages.slice(-6); // Get last 6 messages for context
      const conversationContext = recentMessages.map(msg => 
        `${msg.type === MESSAGE_TYPES.USER ? 'Student' : 'Tutor'}: ${msg.content}`
      ).join('\n');
      
      console.log('💡 Frontend: Requesting hint with context:', conversationContext);
      
      const hintResponse = await aiAPI.getHintResponse(
        topicName,
        conversationContext,
        currentLearningPath,
        currentQuestioningStyle
      );

      const displayHint = typeof hintResponse === 'string' ? hintResponse : 
                         (hintResponse?.displayText || hintResponse?.content || 'Here\'s a hint to help you!');
      
      const hintMessage = createMessage(MESSAGE_TYPES.HINT, displayHint, { isHint: true });
      setMessages(prev => [...prev, hintMessage]);
      
      hints.useHint();
      
    } catch (error) {
      console.error('❌ Frontend: Error getting hint:', error);
      const errorMessage = createMessage(MESSAGE_TYPES.BOT,
        `❌ Hint Error: ${error.message}`,
        { isError: true }
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      hints.setIsRequestingHint(false);
    }
  }, [hints, sessionData, messages, currentQuestioningStyle, currentLearningPath]);

  const handleVisualize = useCallback(() => {
    const visualizationMessage = createMessage(MESSAGE_TYPES.BOT,
      "🎨 Let's create a visualization! Try writing some code to represent what you've learned about this topic. You can use pseudocode, diagrams, or actual code snippets.",
      { isBonus: true }
    );
    setMessages(prev => [...prev, visualizationMessage]);
  }, []);

  const handleTakeBreak = useCallback(() => {
    timer.togglePause();
    const breakMessage = createMessage(MESSAGE_TYPES.BOT,
      "☕ Taking a break is important for learning! Your timer is paused. When you're ready, feel free to continue our discussion or return to the dashboard.",
      { isBonus: true }
    );
    setMessages(prev => [...prev, breakMessage]);
  }, [timer]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  useEffect(() => {
    if (!sessionData || !sessionId || sessionId === 'new') return;

    const saveSession = async () => {
      try {
        await authAPI.updateLearningSession(sessionId, {
          messages,
          progress,
          correctStreak,
          questioningStyle: currentQuestioningStyle,
          learningPath: currentLearningPath,
          timerRemaining: timer.timeRemaining,
          hintsRemaining: hints.hintsRemaining,
          duration: Math.floor((Date.now() - sessionStartTime) / 1000),
          lastActivity: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    };

    const saveInterval = setInterval(saveSession, 30000);
    return () => clearInterval(saveInterval);
  }, [sessionData, sessionId, messages, progress, correctStreak, currentQuestioningStyle, currentLearningPath, timer.timeRemaining, hints.hintsRemaining, sessionStartTime]);

  const handleSubmit = useCallback(async () => {
    if (!userInput.trim() || isThinking || timer.timeRemaining <= 0 || !sessionData) return;
    
    setIsThinking(true);
    
    const userMessage = createMessage(MESSAGE_TYPES.USER, userInput);
    setMessages(prev => [...prev, userMessage]);
    
    const currentUserInput = userInput;
    setUserInput('');
    
    try {
      const topicName = sessionData.topicData?.name || sessionData.selectedTopicData?.name;
      
      console.log('💬 Frontend: Sending user response to AI:', currentUserInput);
      
      const botReply = await aiAPI.getSocraticResponse(
        topicName, 
        currentUserInput,
        currentLearningPath, 
        currentQuestioningStyle
      );
      
      console.log('🤖 Frontend: Received bot reply:', typeof botReply, botReply);

      const displayText = typeof botReply === 'string' ? botReply : 
                         (botReply?.displayText || botReply?.pun + '\n\n' + botReply?.question || 'Response received');
      
      const botMessage = createMessage(MESSAGE_TYPES.BOT, displayText);
      setMessages(prev => [...prev, botMessage]);
      
      setProgress(prev => [...prev, { 
        question: currentUserInput, 
        answer: displayText, 
        timestamp: new Date() 
      }]);

      if (currentUserInput.length > 30 && progress.length % 3 === 2) {
        timer.increaseTimer();
        setCorrectStreak(prev => prev + 1);
        setMessages(prev => [...prev, createMessage(MESSAGE_TYPES.BOT,
          "🍦✨ Great progress! Your ice cream is refreezing - you've earned more focus time!",
          { isBonus: true }
        )]);
      }
      
    } catch (error) {
      console.error('❌ Frontend: Error getting AI response:', error);
      const errorMessage = createMessage(MESSAGE_TYPES.BOT,
        `❌ Error: ${error.message}`,
        { isError: true }
      );
      setMessages(prev => [...prev, errorMessage]);
      setUserInput(currentUserInput);
    } finally {
      setIsThinking(false);
    }
  }, [userInput, isThinking, timer, sessionData, progress, currentQuestioningStyle, currentLearningPath]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

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

  const restartWithNewLearningPath = useCallback(async (newLearningPath) => {
    if (!sessionData || isRestartingPath) return;
    
    setIsRestartingPath(true);
    
    try {
      const updatedSessionData = {
        ...sessionData,
        learningPath: newLearningPath
      };
      
      setSessionData(updatedSessionData);
      setCurrentLearningPath(newLearningPath);
      setMessages([]);
      setProgress([]);
      setCorrectStreak(0);
      setUserInput('');
      setIsThinking(false);
      
      hints.resetHints();
      
      timer.setTimeRemaining(TIMER_CONSTANTS.INITIAL_TIME);
      timer.setTimerActive(true);
      
      const restartMessage = createMessage(MESSAGE_TYPES.BOT, 
        `🎯 Learning path changed to ${learningPaths[newLearningPath].name}! Starting fresh with new questions and full hints restored.`, 
        { isBonus: true }
      );
      setMessages([restartMessage]);

      setTimeout(() => {
        getFirstQuestion(updatedSessionData);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to restart with new learning path:', error);
    } finally {
      setIsRestartingPath(false);
    }
  }, [sessionData, timer, hints, getFirstQuestion, isRestartingPath]);

  const restartWithNewQuestioningStyle = useCallback(async (newQuestioningStyle) => {
    if (!sessionData || isRestartingStyle) return;
    
    setIsRestartingStyle(true);
    
    try {
      const updatedSessionData = {
        ...sessionData,
        questioningStyle: newQuestioningStyle
      };
      
      setSessionData(updatedSessionData);
      setCurrentQuestioningStyle(newQuestioningStyle);
      setMessages([]);
      setProgress([]);
      setCorrectStreak(0);
      setUserInput('');
      setIsThinking(false);

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
      
    } catch (error) {
      console.error('Failed to restart with new questioning style:', error);
    } finally {
      setIsRestartingStyle(false);
    }
  }, [sessionData, timer, hints, getFirstQuestion, isRestartingStyle]);

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
                <h2>
                  {topicName}
                </h2>
              </div>
              <div className="session-meta">
                <div className="style-selector-container">
                  <button 
                    ref={pathBadgeRef}
                    className={`path-badge clickable enhanced ${showPathSelector ? 'dropdown-open' : ''}`}
                    onClick={() => {
                      setShowPathSelector(!showPathSelector);
                      setShowStyleSelector(false);
                    }}
                    title="Click to change track (restarts session)"
                    aria-expanded={showPathSelector}
                    aria-haspopup="true"
                  >
                    {learningPaths[currentLearningPath].name}
                  </button>
                  
                  {showPathSelector && (
                    <>
                      <div 
                        className="dropdown-overlay" 
                        onClick={() => setShowPathSelector(false)}
                        aria-hidden="true"
                      />
                      <div 
                        ref={pathDropdownRef} 
                        className="style-dropdown enhanced"
                        role="menu"
                        aria-labelledby="path-selector"
                      >
                        {Object.entries(learningPaths).map(([key, path]) => (
                          <button
                            key={key}
                            className={`style-option concise ${currentLearningPath === key ? 'active' : ''} ${isRestartingPath ? 'loading' : ''}`}
                            onClick={() => {
                              if (key !== currentLearningPath && !isRestartingPath) {
                                restartWithNewLearningPath(key);
                              }
                              setShowPathSelector(false);
                            }}
                            role="menuitem"
                            aria-current={currentLearningPath === key ? 'true' : 'false'}
                            disabled={isRestartingPath}
                          >
                            <span className="style-option-name">{path.name}</span>
                            {currentLearningPath === key && (
                              <span className="current-badge">Current</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="style-selector-container">
                  <button 
                    ref={styleBadgeRef}
                    className={`style-badge clickable enhanced ${showStyleSelector ? 'dropdown-open' : ''}`}
                    onClick={() => {
                      setShowStyleSelector(!showStyleSelector);
                      setShowPathSelector(false);
                    }}
                    title="Click to change questioning style (restarts session)"
                    aria-expanded={showStyleSelector}
                    aria-haspopup="true"
                  >
                    {questioningStyles[currentQuestioningStyle].name}
                  </button>
                  
                  {showStyleSelector && (
                    <>
                      <div 
                        className="dropdown-overlay" 
                        onClick={() => setShowStyleSelector(false)}
                        aria-hidden="true"
                      />
                      <div 
                        ref={styleDropdownRef} 
                        className="style-dropdown enhanced"
                        role="menu"
                        aria-labelledby="style-selector"
                      >
                        {Object.entries(questioningStyles).map(([key, style]) => (
                          <button
                            key={key}
                            className={`style-option concise ${currentQuestioningStyle === key ? 'active' : ''} ${isRestartingStyle ? 'loading' : ''}`}
                            onClick={() => {
                              if (key !== currentQuestioningStyle && !isRestartingStyle) {
                                restartWithNewQuestioningStyle(key);
                              }
                              setShowStyleSelector(false);
                            }}
                            role="menuitem"
                            aria-current={currentQuestioningStyle === key ? 'true' : 'false'}
                            disabled={isRestartingStyle}
                          >
                            <span className="style-option-name">{style.name}</span>
                            {currentQuestioningStyle === key && (
                              <span className="current-badge">Current</span>
                            )}
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
              <textarea
                className="message-input"
                placeholder={
                  isLoadingFirstQuestion ? "Loading your first question..." :
                  timer.timeRemaining <= 0 ? "Time's up! Your ice cream melted 🍦💧" : 
                  "Type your response... (Press Enter to send)"
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
                rows={1}
                style={{
                  resize: 'none',
                  height: 'auto',
                  minHeight: '24px',
                  maxHeight: '120px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <button 
                className="send-btn"
                onClick={handleSubmit}
                disabled={timer.timeRemaining <= 0 || isThinking || !userInput.trim() || isLoadingFirstQuestion}
                title="Send message (Enter)"
              >
                <MessageCircle size={20} />
              </button>
            </div>

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
                <span>{progress.length} exchanges • Streak: {correctStreak} 🔥</span>
              </div>
              
              <button onClick={handleBackToDashboard} className="btn btn-secondary btn-sm">
                <Home size={16} />
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {showInfo && (
          <div className="modal-overlay info-modal-overlay" onClick={handleInfoClose}>
            <div className="modal-content info-modal simplified" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header simplified">
                <div className="modal-title">
                  <div>
                    <h2>Learning Session Info</h2>
                    <div className="modal-badges">
                      <span className="timer-badge">⏸️ Timer Paused</span>
                    </div>
                  </div>
                </div>
                <button className="modal-close simplified" onClick={handleInfoClose}>
                  <span>✕</span>
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
                  </div>
                  
                  <div className="current-session-info">
                    <h3>📚 Current Session</h3>
                    <div className="session-summary">
                      <div className="summary-item">
                        <strong>Topic:</strong> {topicName}
                      </div>
                      <div className="summary-item">
                        <strong>Learning Path:</strong> {learningPaths[currentLearningPath].name}
                      </div>
                      <div className="summary-item">
                        <strong>Question Style:</strong> {questioningStyles[currentQuestioningStyle].name}
                      </div>
                      <div className="summary-item">
                        <strong>Progress:</strong> {progress.length} exchanges completed
                      </div>
                      <div className="summary-item">
                        <strong>Hints:</strong> {hints.hintsRemaining} remaining
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
                            <span className="style-info-name">{style.name}</span>
                            {currentQuestioningStyle === key && <span className="current-indicator">Current</span>}
                          </div>
                          <p className="style-info-desc">{style.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="questioning-styles-info">
                    <h3>💭 Available Learning Paths</h3>
                    <p className="styles-intro">You can change your learning path anytime. Each path offers a different approach:</p>
                    
                    <div className="styles-info-list">
                      {Object.entries(learningPaths).map(([key, path]) => (
                        <div key={key} className={`style-info-item ${currentLearningPath === key ? 'current' : ''}`}>
                          <div className="style-info-header">
                            <span className="style-info-name">{path.name}</span>
                            {currentLearningPath === key && <span className="current-indicator">Current</span>}
                          </div>
                          <p className="style-info-desc">{path.description}</p>
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