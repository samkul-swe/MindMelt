// App.js - Updated with CS Fundamental Topics
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, Sparkles, Clock, Play, Pause, RotateCcw, RefreshCw, Lightbulb, CheckCircle, MessageCircle, User, Bot } from 'lucide-react';
import { getSocraticResponse } from './openaiAPI';
import './App.css';

// Specific CS Concepts from Different Domains for Deep Learning
const csFundamentals = {
  processScheduling: {
    name: "Process Scheduling in OS",
    description: "How operating systems decide which process runs next",
    icon: "⚙️",
    details: "Understand FCFS, Round Robin, Priority scheduling, context switching, and why your computer feels responsive"
  },
  acidProperties: {
    name: "ACID Properties in Databases",
    description: "What makes database transactions reliable and consistent",
    icon: "🗄️",
    details: "Deep dive into Atomicity, Consistency, Isolation, Durability and how databases guarantee data integrity"
  },
  tcpHandshake: {
    name: "TCP Three-Way Handshake",
    description: "How reliable internet connections are established",
    icon: "🌐",
    details: "Understand SYN, SYN-ACK, ACK packets, connection states, and why web browsing works reliably"
  },
  solidPrinciples: {
    name: "SOLID Design Principles",
    description: "Five principles that make code maintainable and flexible",
    icon: "🏗️",
    details: "Master Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion"
  },
  cacheHierarchy: {
    name: "CPU Cache Hierarchy",
    description: "How computers achieve blazing fast memory access",
    icon: "💾",
    details: "Understand L1, L2, L3 caches, cache hits/misses, locality of reference, and why RAM isn't enough"
  }
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

const questioningStyles = {
  direct: { 
    name: "Direct Explanation", 
    description: "Clear, straightforward questioning",
    icon: "💭"
  },
  scenario: { 
    name: "Scenario-Based", 
    description: "Real-world problem scenarios",
    icon: "🌍"
  },
  puzzle: { 
    name: "Puzzle & Brain Teaser", 
    description: "Challenge-based learning",
    icon: "🧩"
  },
  analogy: { 
    name: "Analogy & Metaphor", 
    description: "Learn through comparisons",
    icon: "🔗"
  }
};

function App() {
  const [step, setStep] = useState('concept');
  const [selectedTopic, setSelectedTopic] = useState(''); // Changed from userConcept
  const [learningPath, setLearningPath] = useState('');
  const [questioningStyle, setQuestioningStyle] = useState('');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [progress, setProgress] = useState([]);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyLoaded, setIsApiKeyLoaded] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [apiKeySource, setApiKeySource] = useState('');
  const messageEndRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (timerActive && !timerPaused && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timerPaused, timeRemaining]);

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load API key from environment variable OR localStorage on component mount
  useEffect(() => {
    console.log('=== API KEY LOADING ===');
    
    const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    console.log('Environment API key available:', !!envApiKey);
    console.log('Environment API key length:', envApiKey?.length);
    
    const savedApiKey = localStorage.getItem('socratic_openai_key');
    console.log('Saved API key available:', !!savedApiKey);
    console.log('Saved API key length:', savedApiKey?.length);
    
    let finalKey = null;
    let source = '';
    
    if (envApiKey && envApiKey.trim() && envApiKey !== 'undefined') {
      finalKey = envApiKey.trim();
      source = 'environment';
    } else if (savedApiKey && savedApiKey.trim() && savedApiKey !== 'null' && savedApiKey !== 'undefined') {
      finalKey = savedApiKey.trim();
      source = 'localStorage';
    }
    
    if (finalKey) {
      setApiKey(finalKey);
      setApiKeySource(source);
      console.log('Using API key from:', source);
      console.log('Final API key length:', finalKey.length);
    } else {
      console.log('No API key found in environment or localStorage');
      setApiKeySource('none');
    }
    
    setIsApiKeyLoaded(true);
    console.log('=== END API KEY LOADING ===');
  }, []);

  // Save API key to localStorage
  const saveApiKey = (key) => {
    console.log('=== SAVING API KEY ===');
    console.log('Key to save length:', key?.length);
    
    try {
      localStorage.setItem('socratic_openai_key', key);
      console.log('Key saved to localStorage successfully');
      
      const verification = localStorage.getItem('socratic_openai_key');
      console.log('Verification - key exists after save:', !!verification);
      
      setApiKey(key);
      setApiKeySource('localStorage');
      console.log('Key set in React state');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Clear API key from localStorage
  const clearApiKey = () => {
    localStorage.removeItem('socratic_openai_key');
    
    const envKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (envKey && envKey.trim() && envKey !== 'undefined') {
      setApiKey(envKey.trim());
      setApiKeySource('environment');
    } else {
      setApiKey('');
      setApiKeySource('none');
      setShowApiSetup(true);
    }
  };

  // Get current API key from all sources
  const getCurrentApiKey = () => {
    return apiKey || 
           process.env.REACT_APP_OPENAI_API_KEY || 
           localStorage.getItem('socratic_openai_key') || 
           null;
  };

  // Get API key status for display
  const getApiKeyStatus = () => {
    const envKey = process.env.REACT_APP_OPENAI_API_KEY;
    const savedKey = localStorage.getItem('socratic_openai_key');
    
    if (envKey && envKey.trim() && envKey !== 'undefined') {
      return { 
        status: 'env', 
        message: '✅ API Key from Environment (.env file)',
        showChange: false
      };
    } else if (savedKey && savedKey.trim() && savedKey !== 'null' && savedKey !== 'undefined') {
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
  };

  const handleStart = () => {
    const finalApiKey = getCurrentApiKey();
    
    console.log('=== HANDLE START DEBUG ===');
    console.log('Current apiKey state:', !!apiKey);
    console.log('Environment key:', !!process.env.REACT_APP_OPENAI_API_KEY);
    console.log('LocalStorage key:', !!localStorage.getItem('socratic_openai_key'));
    console.log('Final API key available:', !!finalApiKey);
    
    if (!finalApiKey) {
      console.log('No API key found, showing setup modal');
      setShowApiSetup(true);
      return;
    }
    
    if (!apiKey && finalApiKey) {
      setApiKey(finalApiKey);
      
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        setApiKeySource('environment');
      } else {
        setApiKeySource('localStorage');
      }
    }
    
    setStep('learning');
    setTimerActive(true);
    
    // Get the selected topic details
    const topicDetails = csFundamentals[selectedTopic];
    const welcome = `🎓 Welcome! You've selected **${topicDetails.name}** with **${learningPaths[learningPath].name}** approach using **${questioningStyles[questioningStyle].name}** style.\n\n**Topic Focus:** ${topicDetails.description}\n\nI'm your Socratic tutor - I'll guide you to discover the answer through thoughtful questions rather than giving direct answers. Let's begin exploring ${topicDetails.name}!`;
    
    setMessages([{ 
      type: 'bot', 
      content: welcome, 
      timestamp: new Date(),
      isWelcome: true 
    }]);
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || isThinking || timeRemaining <= 0) return;
    
    const currentApiKey = getCurrentApiKey();
    
    console.log('=== HANDLE SUBMIT DEBUG ===');
    console.log('API Key from state:', !!apiKey);
    console.log('API Key from getCurrentApiKey():', !!currentApiKey);
    console.log('Final key to use:', !!currentApiKey);
    
    setIsThinking(true);
    const userMessage = { 
      type: 'user', 
      content: userInput, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Use the topic name instead of user concept
      const topicName = csFundamentals[selectedTopic].name;
      const botReply = await getSocraticResponse(
        topicName, 
        userInput, 
        learningPath, 
        questioningStyle,
        currentApiKey
      );
      
      const botMessage = { 
        type: 'bot', 
        content: botReply, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, botMessage]);
      setProgress(prev => [...prev, { 
        question: userInput, 
        answer: botReply, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      const errorMessage = {
        type: 'bot',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setUserInput('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setStep('concept');
    setMessages([]);
    setProgress([]);
    setTimeRemaining(20 * 60);
    setTimerActive(false);
    setTimerPaused(false);
    setUserInput('');
  };

  // API Key Setup Modal
  if (showApiSetup) {
    const handleSaveApiKey = () => {
      if (tempApiKey.trim()) {
        saveApiKey(tempApiKey.trim());
        setShowApiSetup(false);
        setTempApiKey('');
        if (step === 'concept' && selectedTopic && learningPath && questioningStyle) {
          handleStart();
        }
      }
    };

    return (
      <div className="app-container">
        <div className="setup-modal">
          <div className="setup-content">
            <h2>🔑 API Key Setup</h2>
            <p>To use the Socratic AI tutor, you need an OpenAI API key.</p>
            
            {process.env.REACT_APP_OPENAI_API_KEY ? (
              <div style={{ background: '#e8f5e8', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>📝 Note:</strong> You have an API key in your .env file, but it seems there might be an issue with it. 
                You can override it by entering a new key below.
              </div>
            ) : (
              <div style={{ background: '#f0f8ff', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>💡 Tip:</strong> For development, you can also add <code>REACT_APP_OPENAI_API_KEY=your-key</code> to your .env file 
                instead of entering it here each time.
              </div>
            )}
            
            <div className="setup-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div>
                  <strong>Get your API key</strong>
                  <p>Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a></p>
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
              placeholder="sk-..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="api-key-input"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
            
            <div className="setup-actions">
              <button 
                onClick={() => {
                  setShowApiSetup(false);
                  setTempApiKey('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
                className="btn btn-primary"
              >
                Save & Start Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Topic Selection Screen
  if (step === 'concept') {
    const apiStatus = getApiKeyStatus();
    
    return (
      <div className="app-container">
        <div className="setup-container">
          <div className="header">
            <Brain className="header-icon" />
            <h1>Socratic CS Tutor</h1>
            <p>Explore core concepts from Operating Systems, Databases, Networks, Software Engineering, and Computer Architecture</p>
            
            {isApiKeyLoaded && (
              <div className="api-status">
                {apiStatus.status === 'missing' ? (
                  <div className="api-status-missing">
                    {apiStatus.message}
                  </div>
                ) : (
                  <div className="api-status-good">
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
            )}
          </div>

          {/* CS Fundamentals Selection */}
          <div className="form-section">
            <label className="form-label">
              <Lightbulb size={18} />
              Choose a Core CS Concept from Different Domains
            </label>
            <div className="options-grid">
              {Object.entries(csFundamentals).map(([key, topic]) => (
                <div
                  key={key}
                  className={`option-card ${selectedTopic === key ? 'selected' : ''}`}
                  onClick={() => setSelectedTopic(key)}
                >
                  <span className="option-icon">{topic.icon}</span>
                  <h3>{topic.name}</h3>
                  <p>{topic.description}</p>
                  <small style={{ marginTop: '8px', display: 'block', fontStyle: 'italic' }}>
                    {topic.details}
                  </small>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Choose your learning path</label>
            <div className="options-grid">
              {Object.entries(learningPaths).map(([key, path]) => (
                <div
                  key={key}
                  className={`option-card ${learningPath === key ? 'selected' : ''}`}
                  onClick={() => setLearningPath(key)}
                >
                  <span className="option-icon">{path.icon}</span>
                  <h3>{path.name}</h3>
                  <p>{path.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Choose questioning style</label>
            <div className="options-grid">
              {Object.entries(questioningStyles).map(([key, style]) => (
                <div
                  key={key}
                  className={`option-card ${questioningStyle === key ? 'selected' : ''}`}
                  onClick={() => setQuestioningStyle(key)}
                >
                  <span className="option-icon">{style.icon}</span>
                  <h3>{style.name}</h3>
                  <p>{style.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={handleStart}
            disabled={!selectedTopic || !learningPath || !questioningStyle}
          >
            <Sparkles size={20} />
            Start Learning Journey
          </button>
        </div>
      </div>
    );
  }

  // Learning Session Screen
  return (
    <div className="app-container">
      <div className="learning-container">
        {/* Header */}
        <div className="learning-header">
          <div className="session-info">
            <h2>
              <Brain size={24} />
              Learning: {csFundamentals[selectedTopic]?.name}
            </h2>
            <div className="session-meta">
              <span className="path-badge">
                {learningPaths[learningPath].icon} {learningPaths[learningPath].name}
              </span>
              <span className="style-badge">
                {questioningStyles[questioningStyle].icon} {questioningStyles[questioningStyle].name}
              </span>
            </div>
          </div>
          
          <div className="timer-controls">
            <div className={`timer ${timeRemaining < 300 ? 'timer-warning' : ''}`}>
              <Clock size={18} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <button 
              onClick={() => setTimerPaused(!timerPaused)}
              className="timer-btn"
              title={timerPaused ? 'Resume' : 'Pause'}
            >
              {timerPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button 
              onClick={() => setTimeRemaining(20 * 60)}
              className="timer-btn"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? (
                  <User size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>
              <div className="message-content">
                <div className={`message-bubble ${message.isWelcome ? 'welcome' : ''} ${message.isError ? 'error' : ''}`}>
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
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

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <input
              className="message-input"
              placeholder="Type your response..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={timeRemaining <= 0 || isThinking}
            />
            <button 
              className="send-btn"
              onClick={handleSubmit}
              disabled={timeRemaining <= 0 || isThinking || !userInput.trim()}
            >
              <MessageCircle size={20} />
            </button>
          </div>
          
          <div className="session-controls">
            <div className="progress-info">
              <CheckCircle size={16} className="progress-icon" />
              <span>{progress.length} exchanges • {progress.filter(p => p.answer).length} AI responses</span>
            </div>
            
            <button
              onClick={resetSession}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw size={16} />
              New Session
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
}

export default App;