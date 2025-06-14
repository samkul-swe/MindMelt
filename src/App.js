// App.js - MindMelt with React Router for separate pages
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Sparkles, Play, Pause, RotateCcw, RefreshCw, Lightbulb, CheckCircle, MessageCircle, User, Bot } from 'lucide-react';
import { getSocraticResponse } from './aiService';
import './App.css';

// Move constants to separate module or constants file in real app
const TIMER_CONSTANTS = {
  INITIAL_TIME: 8 * 60, // 8 minutes
  MAX_TIME: 25 * 60, // 25 minutes
  TIME_BONUS: 180, // 3 minutes
  WARNING_THRESHOLD: 300 // 5 minutes
};

const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot'
};

// CS Fundamentals data (shortened for artifact size - would include all topics)
const csFundamentals = {
  variables: {
    name: "Variables & Memory",
    description: "How computers store and manage data",
    icon: "📦",
    category: "Programming Basics",
    difficulty: "Beginner",
    details: {
      concept: "Variables are named containers that hold data in computer memory. Understanding how data is stored, accessed, and modified is fundamental to all programming.",
      whyImportant: "Every program manipulates data. Without understanding variables and memory, you can't understand how any software works.",
      buildingBlocks: [
        "What happens when you write: int x = 5",
        "Stack vs Heap memory allocation", 
        "Pass by value vs pass by reference",
        "Memory addresses and pointers",
        "Variable scope and lifetime"
      ],
      realWorldConnection: "When you save a file, change your profile picture, or add items to a shopping cart - all involve variables storing and updating data in memory.",
      nextSteps: ["Control Flow", "Functions", "Data Structures"]
    }
  },
  controlFlow: {
    name: "Control Flow",
    description: "How programs make decisions and repeat actions", 
    icon: "🔀",
    category: "Programming Basics",
    difficulty: "Beginner",
    details: {
      concept: "Control flow determines the order in which instructions execute. Programs aren't just linear lists - they branch, loop, and jump based on conditions.",
      whyImportant: "This is how computers make decisions and automate repetitive tasks. Every algorithm depends on control flow.",
      buildingBlocks: [
        "If-else statements: making decisions",
        "Loops: for, while, do-while patterns", 
        "Break and continue: controlling loop execution",
        "Switch statements: multiple choice decisions",
        "Function calls: jumping to different code sections"
      ],
      realWorldConnection: "When Netflix recommends movies (if-else), processes your entire playlist (loops), or handles user authentication (nested conditions).",
      nextSteps: ["Functions", "Algorithms", "Data Structures"]
    }
  },
  functions: {
    name: "Functions & Abstraction",
    description: "Breaking complex problems into smaller pieces",
    icon: "🔧",
    category: "Programming Basics",
    difficulty: "Beginner", 
    details: {
      concept: "Functions are reusable blocks of code that perform specific tasks. They're the building blocks that let us create complex programs from simple parts.",
      whyImportant: "Functions enable code reuse, testing, debugging, and team collaboration. Every major software system is built with functions.",
      buildingBlocks: [
        "Function definition vs function call",
        "Parameters and arguments: passing data in",
        "Return values: getting results back",
        "Local vs global scope",
        "Recursion: functions calling themselves"
      ],
      realWorldConnection: "Like a recipe that you can use multiple times, or a calculator function you can call whenever you need to add numbers.",
      nextSteps: ["Data Structures", "Algorithms", "Object-Oriented Programming"]
    }
  },
  arrays: {
    name: "Arrays & Lists",
    description: "Storing multiple items in order",
    icon: "📋",
    category: "Data Structures",
    difficulty: "Beginner",
    details: {
      concept: "Arrays store multiple values of the same type in a single variable, accessible by index. They're the simplest way to organize related data.",
      whyImportant: "Arrays are everywhere - your contacts list, game scores, pixels in an image. Understanding arrays is essential for handling collections of data.",
      buildingBlocks: [
        "Array indexing: accessing elements by position",
        "Array operations: insert, delete, search, update",
        "Static vs dynamic arrays",
        "Array iteration: processing all elements",
        "Multi-dimensional arrays: arrays of arrays"
      ],
      realWorldConnection: "Your photo gallery (array of images), music playlist (array of songs), or shopping cart (array of items).",
      nextSteps: ["Linked Lists", "Stacks & Queues", "Hash Tables"]
    }
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
    description: "Guided discovery through strategic questions",
    icon: "💭"
  },
  scenario: { 
    name: "Scenario-Based", 
    description: "Real-world problem scenarios and use cases",
    icon: "🌍"
  },
  puzzle: { 
    name: "Puzzle & Brain Teaser", 
    description: "Challenge-based learning with problem solving",
    icon: "🧩"
  },
  analogy: { 
    name: "Analogy & Metaphor", 
    description: "Learn through comparisons and analogies",
    icon: "🔗"
  }
};

// Session State Management
class SessionState {
  static save(data) {
    try {
      localStorage.setItem('mindmelt_session', JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  static load() {
    try {
      const saved = localStorage.getItem('mindmelt_session');
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      // Check if session is less than 24 hours old
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - data.timestamp > twentyFourHours) {
        SessionState.clear();
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to load session:', error);
      SessionState.clear();
      return null;
    }
  }

  static clear() {
    try {
      localStorage.removeItem('mindmelt_session');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  static isValid(data) {
    return data && 
           data.selectedTopic && 
           data.learningPath && 
           data.questioningStyle &&
           data.timestamp;
  }
}

// Custom hooks
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

const useApiKey = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySource, setApiKeySource] = useState('');
  const [isApiKeyLoaded, setIsApiKeyLoaded] = useState(false);

  const getCurrentApiKey = useCallback(() => {
    return apiKey || 
           process.env.REACT_APP_AI_API_KEY || 
           localStorage.getItem('mindmelt_ai_key') || 
           null;
  }, [apiKey]);

  const saveApiKey = useCallback((key) => {
    try {
      localStorage.setItem('mindmelt_ai_key', key);
      setApiKey(key);
      setApiKeySource('localStorage');
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  }, []);

  const getApiKeyStatus = useCallback(() => {
    const envKey = process.env.REACT_APP_AI_API_KEY;
    const savedKey = localStorage.getItem('mindmelt_ai_key');
    
    if (envKey?.trim() && envKey !== 'undefined') {
      return { 
        status: 'env', 
        message: '✅ API Key from Environment (.env file)',
        showChange: false
      };
    } else if (savedKey?.trim() && savedKey !== 'null' && savedKey !== 'undefined') {
      return { 
        status: 'saved', 
        message: '✅ API Key Configured (User Input)',
        showChange: true
      };
    } else {
      return { 
        status: 'missing', 
        message: '⚠️ API Key Required',
        showChange: false
      };
    }
  }, []);

  useEffect(() => {
    const envApiKey = process.env.REACT_APP_AI_API_KEY;
    const savedApiKey = localStorage.getItem('mindmelt_ai_key');
    
    let finalKey = null;
    let source = '';
    
    if (envApiKey?.trim() && envApiKey !== 'undefined') {
      finalKey = envApiKey.trim();
      source = 'environment';
    } else if (savedApiKey?.trim() && savedApiKey !== 'null' && savedApiKey !== 'undefined') {
      finalKey = savedApiKey.trim();
      source = 'localStorage';
    }
    
    if (finalKey) {
      setApiKey(finalKey);
      setApiKeySource(source);
    } else {
      setApiKeySource('none');
    }
    
    setIsApiKeyLoaded(true);
  }, []);

  return {
    apiKey,
    isApiKeyLoaded,
    apiKeySource,
    getCurrentApiKey,
    saveApiKey,
    getApiKeyStatus
  };
};

// Ice Cream Timer Component
const IceCreamTimer = React.memo(({ timeLeft, totalTime, isRunning }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dripsRef = useRef([]);
  
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

    const drawIceCream = () => {
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

      if (percentage > 10) {
        drawMeltingScoop(30, 32 + meltSag, 13, 
          { light: '#fef3c7', dark: '#f59e0b' }, meltLevel);
      }
      
      if (percentage > 40) {
        drawMeltingScoop(30, 22 + meltSag * 0.7, 11, 
          { light: '#fce7f3', dark: '#ec4899' }, meltLevel * 0.8);
      }
      
      if (percentage > 70) {
        drawMeltingScoop(30, 14 + meltSag * 0.5, 9, 
          { light: '#fed7aa', dark: '#ea580c' }, meltLevel * 0.6);
      }

      updateDrips();
      dripsRef.current.forEach(drip => {
        if (isRunning) drip.update();
        drip.draw(ctx);
      });
    };

    const animate = () => {
      drawIceCream();
      if (isRunning || dripsRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

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

// Reusable components
const OptionCard = ({ item, isSelected, onSelect, className = "" }) => (
  <div
    className={`option-card ${isSelected ? 'selected' : ''} ${className}`}
    onClick={onSelect}
  >
    <span className="option-icon">{item.icon}</span>
    <h3>{item.name}</h3>
    <p>{item.description}</p>
  </div>
);

const TopicCard = ({ topicKey, topic, isSelected, onSelect, onShowDetails }) => (
  <div className="topic-card-container">
    <div
      className={`option-card topic-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(topicKey)}
    >
      <span className="option-icon">{topic.icon}</span>
      <div className="topic-header">
        <h3>{topic.name}</h3>
        <div className="topic-meta">
          <span className="category-pill" style={{
            backgroundColor: getCategoryColor(topic.category)
          }}>
            {topic.category}
          </span>
        </div>
      </div>
      <p className="topic-description">{topic.description}</p>
    </div>
    <button 
      className="details-btn"
      onClick={(e) => {
        e.stopPropagation();
        onShowDetails(topicKey);
      }}
    >
      <Lightbulb size={14} />
      Details
    </button>
  </div>
);

const getCategoryColor = (category) => {
  const colors = {
    'Programming Basics': '#e0f2fe',
    'Data Structures': '#f3e5f5',
    'Algorithms': '#e8f5e8',
    'Computer Systems': '#fff3e0',
    'Networking': '#e3f2fd',
    'Databases': '#fce4ec'
  };
  return colors[category] || '#f1f5f9';
};

const Message = ({ message, index }) => (
  <div className={`message ${message.type}`}>
    <div className="message-avatar">
      {message.type === MESSAGE_TYPES.USER ? <User size={20} /> : <Bot size={20} />}
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
);

const getMessageBubbleClass = (message) => {
  const classes = [];
  if (message.isWelcome) classes.push('welcome');
  if (message.isError) classes.push('error');
  if (message.isBonus) classes.push('bonus');
  if (message.isTimeUp) classes.push('time-up');
  return classes.join(' ');
};

const TopicDetailsModal = ({ topic, onClose, onSelect }) => {
  if (!topic) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">{topic.icon}</span>
            <div>
              <h2>{topic.name}</h2>
              <div className="modal-badges">
                <span className="category-badge">{topic.category}</span>
                <span className="difficulty-badge">{topic.difficulty}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <h3>🎯 What is it?</h3>
            <p>{topic.details.concept}</p>
          </div>
          
          <div className="detail-section">
            <h3>💡 Why is it important?</h3>
            <p>{topic.details.whyImportant}</p>
          </div>
          
          <div className="detail-section">
            <h3>🏗️ Key Building Blocks</h3>
            <ul>
              {topic.details.buildingBlocks.map((block, index) => (
                <li key={index}>{block}</li>
              ))}
            </ul>
          </div>
          
          <div className="detail-section">
            <h3>🌍 Real-World Connection</h3>
            <p>{topic.details.realWorldConnection}</p>
          </div>
          
          <div className="detail-section">
            <h3>🚀 Next Steps</h3>
            <div className="next-steps">
              {topic.details.nextSteps.map((step, index) => (
                <span key={index} className="next-step-chip">{step}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onSelect} className="btn btn-primary">
            Select This Topic
          </button>
        </div>
      </div>
    </div>
  );
};

const ApiSetupModal = ({ onSave, onCancel }) => {
  const [tempApiKey, setTempApiKey] = useState('');

  const handleSave = () => {
    if (tempApiKey.trim()) {
      onSave(tempApiKey.trim());
    }
  };

  return (
    <div className="app-container">
      <div className="setup-modal">
        <div className="setup-content">
          <h2>🔑 API Key Setup</h2>
          <p>To use the MindMelt Socratic AI tutor, you need an AI API key.</p>
          
          <div className="setup-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div>
                <strong>Get your API key</strong>
                <p>Visit <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div>
                <strong>Create an account & get key</strong>
                <p>Sign up and create a new API key</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div>
                <strong>Enter your key below</strong>
                <p>Your key will be saved locally and securely</p>
              </div>
            </div>
          </div>

          <input
            type="password"
            placeholder="AIza..."
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            className="api-key-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          
          <div className="setup-actions">
            <button onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!tempApiKey.trim()}
              className="btn btn-primary"
            >
              Save & Start MindMelt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Setup Page Component
const SetupPage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicDetails, setShowTopicDetails] = useState(false);
  const [detailsTopic, setDetailsTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');
  const [questioningStyle, setQuestioningStyle] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const apiKeyManager = useApiKey();

  // Load saved selections on page load
  useEffect(() => {
    const saved = SessionState.load();
    if (saved && SessionState.isValid(saved)) {
      setSelectedTopic(saved.selectedTopic || '');
      setLearningPath(saved.learningPath || '');
      setQuestioningStyle(saved.questioningStyle || '');
    }
  }, []);

  const showDetails = useCallback((topicKey) => {
    setDetailsTopic(csFundamentals[topicKey]);
    setShowTopicDetails(true);
  }, []);

  const handleStart = useCallback(() => {
    const finalApiKey = apiKeyManager.getCurrentApiKey();
    
    if (!finalApiKey) {
      setShowApiSetup(true);
      return;
    }
    
    // Save session data
    const sessionData = {
      selectedTopic,
      learningPath,
      questioningStyle
    };
    
    SessionState.save(sessionData);
    
    // Navigate to learning session
    navigate('/learn');
  }, [apiKeyManager, selectedTopic, learningPath, questioningStyle, navigate]);

  const handleApiKeySave = useCallback((key) => {
    apiKeyManager.saveApiKey(key);
    setShowApiSetup(false);
    if (selectedTopic && learningPath && questioningStyle) {
      handleStart();
    }
  }, [apiKeyManager, selectedTopic, learningPath, questioningStyle, handleStart]);

  if (showApiSetup) {
    return (
      <ApiSetupModal 
        onSave={handleApiKeySave}
        onCancel={() => setShowApiSetup(false)}
      />
    );
  }

  const apiStatus = apiKeyManager.getApiKeyStatus();
  
  return (
    <div className="app-container">
      <div className="setup-container">
        <div className="header">
          <div className="header-icon-container">
            <Brain className="header-icon" />
          </div>
          <h1>MindMelt</h1>
          <p className="main-tagline">Master computer science concepts through adaptive questioning</p>
          <p className="sub-tagline">🧠 Train your brain before your ice cream melts! 🍦</p>
          <p className="description">Explore core concepts from Programming, Data Structures, Algorithms, and Computer Systems</p>
          
          {apiKeyManager.isApiKeyLoaded && (
            <div className={`api-status ${apiStatus.status === 'missing' ? 'api-status-missing' : 'api-status-good'}`}>
              {apiStatus.message}
              {apiStatus.showChange && (
                <button 
                  onClick={() => setShowApiSetup(true)}
                  className="change-key-btn"
                >
                  Change
                </button>
              )}
            </div>
          )}
        </div>

        <div className="form-section">
          <label className="form-label">
            <Lightbulb size={18} />
            Choose a CS Fundamental to Master
          </label>
          <div className="topics-grid">
            {Object.entries(csFundamentals).map(([key, topic]) => (
              <TopicCard
                key={key}
                topicKey={key}
                topic={topic}
                isSelected={selectedTopic === key}
                onSelect={setSelectedTopic}
                onShowDetails={showDetails}
              />
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Choose your learning path</label>
          <div className="options-grid">
            {Object.entries(learningPaths).map(([key, path]) => (
              <OptionCard
                key={key}
                item={path}
                isSelected={learningPath === key}
                onSelect={() => setLearningPath(key)}
              />
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Choose questioning style</label>
          <div className="options-grid">
            {Object.entries(questioningStyles).map(([key, style]) => (
              <OptionCard
                key={key}
                item={style}
                isSelected={questioningStyle === key}
                onSelect={() => setQuestioningStyle(key)}
              />
            ))}
          </div>
        </div>

        <button 
          className="btn btn-primary btn-large"
          onClick={handleStart}
          disabled={!selectedTopic || !learningPath || !questioningStyle}
        >
          <Sparkles size={20} />
          Start MindMelt Session 🍦
        </button>

        {showTopicDetails && (
          <TopicDetailsModal 
            topic={detailsTopic} 
            onClose={() => setShowTopicDetails(false)}
            onSelect={() => {
              setSelectedTopic(Object.keys(csFundamentals).find(key => csFundamentals[key] === detailsTopic));
              setShowTopicDetails(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Learning Session Page Component
const LearningPage = () => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [progress, setProgress] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const messageEndRef = useRef(null);

  const timer = useTimer();
  const apiKeyManager = useApiKey();

  // Load session data on page load
  useEffect(() => {
    const saved = SessionState.load();
    if (!saved || !SessionState.isValid(saved)) {
      // No valid session, redirect to setup
      navigate('/', { replace: true });
      return;
    }
    
    setSessionData(saved);
    
    // Initialize welcome message
    const topicDetails = csFundamentals[saved.selectedTopic];
    const welcome = `🧠 Welcome to MindMelt! You've selected ${topicDetails.name} with ${learningPaths[saved.learningPath].name} approach using ${questioningStyles[saved.questioningStyle].name} style.\n\n🍦 Your Ice Cream Timer: Watch your ice cream melt as time passes! Answer well to refreeze it and gain more focus time.\n\nTopic Focus: ${topicDetails.description}\n\nI'm your Socratic tutor - I'll guide you to discover the answer through thoughtful questions rather than giving direct answers. Let's begin exploring ${topicDetails.name} before your ice cream melts!`;
    
    setMessages([createMessage(MESSAGE_TYPES.BOT, welcome, { isWelcome: true })]);
    timer.setTimerActive(true);
  }, [navigate, timer.setTimerActive]);

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
              "🍦💧 Time's up! Your ice cream has melted. Take a break and come back when you're ready to refreeze your focus!",
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
    
    const currentApiKey = apiKeyManager.getCurrentApiKey();
    if (!currentApiKey) {
      setShowApiSetup(true);
      return;
    }
    
    setIsThinking(true);
    
    const userMessage = createMessage(MESSAGE_TYPES.USER, userInput);
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const topicName = csFundamentals[sessionData.selectedTopic].name;
      const botReply = await getSocraticResponse(
        topicName, 
        userInput, 
        sessionData.learningPath, 
        sessionData.questioningStyle,
        currentApiKey
      );
      
      const botMessage = createMessage(MESSAGE_TYPES.BOT, botReply);
      setMessages(prev => [...prev, botMessage]);
      
      setProgress(prev => [...prev, { 
        question: userInput, 
        answer: botReply, 
        timestamp: new Date() 
      }]);

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
  }, [userInput, isThinking, timer, apiKeyManager, sessionData, progress]);

  const resetSession = useCallback(() => {
    SessionState.clear();
    navigate('/', { replace: true });
  }, [navigate]);

  const handleApiKeySave = useCallback((key) => {
    apiKeyManager.saveApiKey(key);
    setShowApiSetup(false);
  }, [apiKeyManager]);

  if (!sessionData) {
    return <div>Loading...</div>;
  }

  if (showApiSetup) {
    return (
      <ApiSetupModal 
        onSave={handleApiKeySave}
        onCancel={() => setShowApiSetup(false)}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="learning-container">
        <div className="learning-header">
          <div className="session-info">
            <h2>
              <Brain size={24} />
              MindMelt: {csFundamentals[sessionData.selectedTopic]?.name}
            </h2>
            <div className="session-meta">
              <span className="path-badge">
                {learningPaths[sessionData.learningPath].icon} {learningPaths[sessionData.learningPath].name}
              </span>
              <span className="style-badge">
                {questioningStyles[sessionData.questioningStyle].icon} {questioningStyles[sessionData.questioningStyle].name}
              </span>
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
          {messages.map((message, index) => (
            <Message key={index} message={message} index={index} />
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
          
          <div ref={messageEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <input
              className="message-input"
              placeholder={timer.timeRemaining <= 0 ? "Time's up! Your ice cream melted 🍦💧" : "Type your response..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={timer.timeRemaining <= 0 || isThinking}
            />
            <button 
              className="send-btn"
              onClick={handleSubmit}
              disabled={timer.timeRemaining <= 0 || isThinking || !userInput.trim()}
            >
              <MessageCircle size={20} />
            </button>
          </div>
          
          <div className="session-controls">
            <div className="progress-info">
              <CheckCircle size={16} className="progress-icon" />
              <span>{progress.length} exchanges • Streak: {correctStreak} 🔥</span>
            </div>
            
            <button onClick={resetSession} className="btn btn-secondary btn-sm">
              <RefreshCw size={16} />
              New MindMelt
            </button>
            
            <button
              onClick={() => setShowApiSetup(true)}
              className="btn btn-secondary btn-sm"
              title="Change API Key"
            >
              🔑 API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/learn" element={<LearningPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;