// ============================================================================
// CLEAN APP.JS - Fixed all ESLint errors and warnings
// ============================================================================

// App.js - MindMelt with React Router for separate pages
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Play, Pause, RotateCcw, RefreshCw, Lightbulb, CheckCircle, MessageCircle, User, Bot } from 'lucide-react';
import { getSocraticResponse, getTopicDetails, searchCSTopics } from './aiService';
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

// CS Fundamentals data - Keep existing data structure
const csFundamentals = {
  variables: {
    name: "Variables & Memory",
    description: "How computers store and manage data",
    icon: "📦",
    category: "Programming Basics",
    difficulty: "Beginner",
    keywords: ["variables", "memory", "storage", "data", "assignment", "scope", "stack", "heap"]
  },
  // ... keep rest of your existing csFundamentals data
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
      console.log('✅ Session saved:', data);
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
      
      console.log('✅ Session loaded:', data);
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
      console.log('✅ Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  static isValid(data) {
    const isValid = data && 
           data.selectedTopicData && 
           data.selectedTopicData.name &&
           data.learningPath && 
           data.timestamp;
    
    console.log('🔍 Session validation:', { isValid, data });
    return isValid;
  }
}

// CLEANED: Manual search only hook - removed unused functions
const useTopicSearch = (apiKeyManager) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);
    setShowSuggestions(false);

    try {
      const apiKey = apiKeyManager?.getCurrentApiKey();
      
      if (!apiKey) {
        throw new Error('🔑 AI API key not found. Please set your API key in MindMelt settings to search for topics!');
      }

      console.log('🔍 Manual AI Search for:', searchQuery.trim());
      
      const results = await searchCSTopics(searchQuery.trim(), apiKey);
      
      if (results && results.length > 0) {
        setSearchResults(results);
        setShowSuggestions(true);
        setSearchError('');
        console.log(`✅ Found ${results.length} topics for "${searchQuery.trim()}"`);
      } else {
        setSearchResults([]);
        setSearchError(`No CS topics found for "${searchQuery.trim()}". Try terms like: React, Python, Machine Learning, etc.`);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
      setSearchError(error.message || 'Search failed. Please try again.');
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, apiKeyManager]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setHasSearched(false);
    setSearchError('');
  }, []);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    showSuggestions,
    setShowSuggestions,
    isSearching,
    searchError,
    hasSearched,
    performSearch,
    clearSearch,
    hideSuggestions
  };
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

// Ice Cream Timer Component - FIXED: Optimized for performance
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
      // Throttle updates to 30fps for better performance
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

// FIXED: SearchBar component with proper showSuggestions handling
const SearchBar = React.memo(({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  onSelectTopic, 
  selectedTopic,
  isSearching,
  searchError,
  hasSearched,
  performSearch,
  clearSearch,
  hideSuggestions,
  showSuggestions // FIXED: Added missing prop
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        onSelectTopic(searchResults[selectedIndex]);
        hideSuggestions();
        setSelectedIndex(-1);
      } else {
        performSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1);
      hideSuggestions();
    }
  }, [selectedIndex, searchResults, onSelectTopic, performSearch, hideSuggestions]);

  const handleSearchClick = useCallback(() => {
    performSearch();
  }, [performSearch]);

  const handleTopicSelect = useCallback((topic) => {
    onSelectTopic(topic);
    hideSuggestions();
    setSelectedIndex(-1);
  }, [onSelectTopic, hideSuggestions]);

  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
  }, [setSearchQuery]);

  return (
    <div className="search-container">
      <div className="search-input-container">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          className="search-input"
          placeholder="Enter CS topic: React, Python, Machine Learning, Blockchain..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
        />
        
        {isSearching && (
          <div className="search-loading">
            <div className="search-spinner"></div>
          </div>
        )}
        
        {searchQuery && !isSearching && (
          <button 
            className="clear-search"
            onClick={clearSearch}
            title="Clear search"
          >
            ✕
          </button>
        )}
        
        {searchQuery.trim() && !isSearching && (
          <button 
            className="search-btn"
            onClick={handleSearchClick}
            title="Search for CS topics"
          >
            Search
          </button>
        )}
      </div>

      {hasSearched && showSuggestions && (
        <div className="search-results-container">
          {searchError ? (
            <div className="search-error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{searchError}</div>
              {!searchError.includes('API key') && (
                <div className="error-suggestions">
                  <strong>Try these CS topics:</strong> React, Python, Machine Learning, JavaScript, Docker, AWS, MongoDB, TypeScript, Flutter, Cybersecurity
                </div>
              )}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="search-results-section">
              <div className="results-header">
                <h3>🎯 CS Topics for "{searchQuery}"</h3>
                <p>Found {searchResults.length} topics - Select one to start learning</p>
              </div>
              <div className="results-list">
                {searchResults.map((topic, index) => (
                  <div
                    key={`${topic.name}-${index}`}
                    className={`topic-result-card ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleTopicSelect(topic)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="topic-icon">{topic.icon}</div>
                    <div className="topic-info">
                      <div className="topic-name">{topic.name}</div>
                      <div className="topic-description">{topic.description}</div>
                      <div className="topic-tags">
                        <span className="topic-category">{topic.category}</span>
                        <span className="topic-difficulty">{topic.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {!hasSearched && searchQuery.trim() && (
        <div className="search-help">
          <p className="search-help-text">
            💡 Press <strong>Enter</strong> or click <strong>Search</strong> to find CS topics
          </p>
        </div>
      )}
    </div>
  );
});

// Memoized components for better performance
const OptionCard = React.memo(({ item, isSelected, onSelect, className = "" }) => (
  <div
    className={`option-card ${isSelected ? 'selected' : ''} ${className}`}
    onClick={onSelect}
  >
    <span className="option-icon">{item.icon}</span>
    <h3>{item.name}</h3>
    <p>{item.description}</p>
  </div>
));

const Message = React.memo(({ message, index }) => (
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
));

const getMessageBubbleClass = (message) => {
  const classes = [];
  if (message.isWelcome) classes.push('welcome');
  if (message.isError) classes.push('error');
  if (message.isBonus) classes.push('bonus');
  if (message.isTimeUp) classes.push('time-up');
  return classes.join(' ');
};

const TopicDetailsModal = React.memo(({ topic, onClose, onSelect, apiKeyManager }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(async () => {
    if (!topic || !apiKeyManager) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const apiKey = apiKeyManager.getCurrentApiKey();
      if (!apiKey) {
        setError('API key required to fetch topic details');
        return;
      }
      
      const topicDetails = await getTopicDetails(topic.name, apiKey);
      setDetails(topicDetails);
    } catch (err) {
      console.error('Failed to fetch topic details:', err);
      setError('Failed to load topic details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKeyManager]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSelect = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!topic) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
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
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {isLoading ? (
            <div className="loading-details">
              <div className="loading-spinner"></div>
              <p>Loading topic details...</p>
            </div>
          ) : error ? (
            <div className="error-details">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
            </div>
          ) : details ? (
            <>
              <div className="detail-section">
                <h3>🎯 What is it?</h3>
                <p>{details.concept}</p>
              </div>
              
              <div className="detail-section">
                <h3>💡 Why is it important?</h3>
                <p>{details.whyImportant}</p>
              </div>
              
              {details.prerequisites && details.prerequisites.length > 0 && (
                <div className="detail-section">
                  <h3>📚 Prerequisites</h3>
                  <ul>
                    {details.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="detail-section">
                <h3>🏗️ Key Building Blocks</h3>
                <ul>
                  {details.buildingBlocks.map((block, index) => (
                    <li key={index}>{block}</li>
                  ))}
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>🌍 Real-World Connection</h3>
                <p>{details.realWorldConnection}</p>
              </div>
              
              <div className="detail-section">
                <h3>🚀 Next Steps</h3>
                <div className="next-steps">
                  {details.nextSteps.map((step, index) => (
                    <span key={index} className="next-step-chip">{step}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="detail-section">
              <p>{topic.description}</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button onClick={handleSelect} className="btn btn-primary">
            Select This Topic
          </button>
        </div>
      </div>
    </div>
  );
});

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

// Setup Page Component - FIXED: All dependencies and unused variables
const SetupPage = React.memo(() => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicDetails, setShowTopicDetails] = useState(false);
  const [detailsTopic, setDetailsTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const apiKeyManager = useApiKey();
  const topicSearch = useTopicSearch(apiKeyManager);

  const showDetails = useCallback((topic) => {
    setDetailsTopic(topic);
    setShowTopicDetails(true);
  }, []);

  const handleSelectTopic = useCallback((topic) => {
    setSelectedTopic(topic);
    topicSearch.hideSuggestions();
  }, [topicSearch]);

  const handleStart = useCallback(() => {
    if (!selectedTopic || !learningPath) return;
    
    const finalApiKey = apiKeyManager.getCurrentApiKey();
    if (!finalApiKey) {
      setShowApiSetup(true);
      return;
    }
    
    const sessionData = {
      selectedTopicData: selectedTopic,
      learningPath,
      questioningStyle: 'socratic'
    };
    
    SessionState.save(sessionData);
    navigate('/learn');
  }, [apiKeyManager, selectedTopic, learningPath, navigate]);

  const handleApiKeySave = useCallback((key) => {
    apiKeyManager.saveApiKey(key);
    setShowApiSetup(false);
    if (selectedTopic && learningPath) {
      setTimeout(() => handleStart(), 100);
    }
  }, [apiKeyManager, selectedTopic, learningPath, handleStart]);

  const apiStatus = useMemo(() => apiKeyManager.getApiKeyStatus(), [apiKeyManager]);

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
      <div className="setup-container">
        <div className="header">
          <div className="header-icon-container">
            <Brain className="header-icon" />
          </div>
          <h1>MindMelt</h1>
          <p className="main-tagline">Master computer science concepts through adaptive questioning</p>
          <p className="sub-tagline">🧠 Train your brain before your ice cream melts! 🍦</p>
          <p className="description">Search and explore any CS concept with AI-powered personalized Socratic learning</p>
          
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
            Search for any Computer Science Topic
          </label>
          
          <SearchBar
            searchQuery={topicSearch.searchQuery}
            setSearchQuery={topicSearch.setSearchQuery}
            searchResults={topicSearch.searchResults}
            onSelectTopic={handleSelectTopic}
            selectedTopic={selectedTopic}
            isSearching={topicSearch.isSearching}
            searchError={topicSearch.searchError}
            hasSearched={topicSearch.hasSearched}
            performSearch={topicSearch.performSearch}
            clearSearch={topicSearch.clearSearch}
            hideSuggestions={topicSearch.hideSuggestions}
            showSuggestions={topicSearch.showSuggestions} // FIXED: Added missing prop
          />

          <div className="search-help">
            <p className="search-help-text">
              💡 <strong>Search for ANY computer science topic:</strong> React, Docker, Machine Learning, Blockchain, Quantum Computing, iOS Development, Cybersecurity, TensorFlow, Kubernetes, GraphQL, Redis, MongoDB, Swift, Rust, Go, TypeScript, and thousands more!
            </p>
          </div>

          {selectedTopic && (
            <div className="selected-topic-card">
              <div className="selected-topic-header">
                <span className="selected-topic-icon">{selectedTopic.icon}</span>
                <div className="selected-topic-info">
                  <h3>{selectedTopic.name}</h3>
                  <p>{selectedTopic.description}</p>
                  <div className="selected-topic-meta">
                    <span className="category-badge">
                      {selectedTopic.category}
                    </span>
                    <span className="difficulty-badge">
                      {selectedTopic.difficulty}
                    </span>
                  </div>
                </div>
                <button 
                  className="topic-details-btn"
                  onClick={() => showDetails(selectedTopic)}
                >
                  <Lightbulb size={16} />
                  Details
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <label className="form-label">Choose your learning approach</label>
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

        <button 
          className="btn btn-primary btn-large"
          onClick={handleStart}
          disabled={!selectedTopic || !learningPath}
        >
          <Sparkles size={20} />
          Start MindMelt Session 🍦
          {!selectedTopic && <span className="btn-hint"> (Select a topic first)</span>}
          {selectedTopic && !learningPath && <span className="btn-hint"> (Choose learning path)</span>}
        </button>

        {showTopicDetails && (
          <TopicDetailsModal 
            topic={detailsTopic} 
            onClose={() => setShowTopicDetails(false)}
            onSelect={() => {
              setSelectedTopic(detailsTopic);
              setShowTopicDetails(false);
              topicSearch.hideSuggestions();
            }}
            apiKeyManager={apiKeyManager}
          />
        )}
      </div>
    </div>
  );
});

// Learning Session Page Component - FIXED: Timer dependencies
const LearningPage = () => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [progress, setProgress] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [currentQuestioningStyle, setCurrentQuestioningStyle] = useState('socratic');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const messageEndRef = useRef(null);

  const timer = useTimer();
  const apiKeyManager = useApiKey();

  // FIXED: Load session data with proper dependencies
  useEffect(() => {
    const saved = SessionState.load();
    if (!saved || !SessionState.isValid(saved)) {
      navigate('/', { replace: true });
      return;
    }
    
    setSessionData(saved);
    setCurrentQuestioningStyle(saved.questioningStyle || 'socratic');
    
    const welcome = `🧠 Welcome to MindMelt! You've selected ${saved.selectedTopicData.name} with ${learningPaths[saved.learningPath].name} approach using ${questioningStyles[saved.questioningStyle || 'socratic'].name} style.\n\n🍦 Your Ice Cream Timer: Watch your ice cream melt as time passes! Answer well to refreeze it and gain more focus time.\n\nTopic Focus: ${saved.selectedTopicData.description}\n\nI'm your Socratic tutor - I'll guide you to discover the answer through thoughtful questions rather than giving direct answers. Let's begin exploring ${saved.selectedTopicData.name} before your ice cream melts!`;
    
    setMessages([createMessage(MESSAGE_TYPES.BOT, welcome, { isWelcome: true })]);
    timer.setTimerActive(true);
  }, [navigate, timer.setTimerActive]);

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // FIXED: Timer countdown with proper dependencies
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
      const topicName = sessionData.selectedTopicData.name;
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

  const resetSession = useCallback(() => {
    SessionState.clear();
    navigate('/', { replace: true });
  }, [navigate]);

  const handleApiKeySave = useCallback((key) => {
    apiKeyManager.saveApiKey(key);
    setShowApiSetup(false);
  }, [apiKeyManager]);

  if (!sessionData || !sessionData.selectedTopicData) {
    return (
      <div className="app-container">
        <div className="learning-container">
          <div className="loading-session">
            <div className="loading-spinner"></div>
            <p>Loading your MindMelt session...</p>
          </div>
        </div>
      </div>
    );
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
              MindMelt: {sessionData?.selectedTopicData?.name || 'Loading...'}
            </h2>
            <div className="session-meta">
              <span className="path-badge">
                {learningPaths[sessionData.learningPath].icon} {learningPaths[sessionData.learningPath].name}
              </span>
              <div className="style-selector-container">
                <button 
                  className="style-badge clickable"
                  onClick={() => setShowStyleSelector(!showStyleSelector)}
                  title="Click to change questioning style"
                >
                  {questioningStyles[currentQuestioningStyle].icon} {questioningStyles[currentQuestioningStyle].name}
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showStyleSelector && (
                  <div className="style-dropdown">
                    {Object.entries(questioningStyles).map(([key, style]) => (
                      <button
                        key={key}
                        className={`style-option ${currentQuestioningStyle === key ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentQuestioningStyle(key);
                          setShowStyleSelector(false);
                          setMessages(prev => [...prev, createMessage(MESSAGE_TYPES.BOT,
                            `🎯 Questioning style changed to ${style.name}. ${style.description}`,
                            { isBonus: true }
                          )]);
                        }}
                      >
                        <span className="style-option-icon">{style.icon}</span>
                        <div className="style-option-content">
                          <div className="style-option-name">{style.name}</div>
                          <div className="style-option-desc">{style.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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