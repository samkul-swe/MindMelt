// ============================================================================
// pages/InstantStart.js - Instant Learning Entry Point
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  BookOpen,
  Target,
  Users,
  Star,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTopicSearch } from '../hooks/useTopicSearch';
import { useApiKey } from '../hooks/useApiKey';
import SearchBar from '../components/SearchBar';
import '../styles/pages/instant-start.css';

const InstantStart = () => {
  const navigate = useNavigate();
  const { createAnonymousUser, isRegistered } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const apiKeyManager = useApiKey();
  const topicSearch = useTopicSearch(apiKeyManager);

  const startLearningSession = () => {
    if (!selectedTopic || !learningPath) return;

    // Create anonymous user if not registered
    if (!isRegistered) {
      createAnonymousUser(userName || null);
    }

    // Navigate to learning session
    navigate('/learn', {
      state: {
        isNewSession: true,
        topicData: selectedTopic,
        learningPath: learningPath,
        questioningStyle: 'socratic',
        fromInstantStart: true
      }
    });
  };

  const handleGetStarted = () => {
    if (isRegistered) {
      navigate('/dashboard');
    } else {
      setShowNameInput(true);
    }
  };

  const learningPaths = {
    conceptual: { 
      name: "Conceptual Track", 
      description: "Deep understanding of core concepts",
      icon: "🧠",
      time: "8-15 min"
    },
    applied: { 
      name: "Applied Track", 
      description: "Practical implementation and examples",
      icon: "⚡",
      time: "10-20 min"
    },
    comprehensive: { 
      name: "Comprehensive Track", 
      description: "Complete mastery with theory and practice",
      icon: "🎯",
      time: "15-25 min"
    }
  };

  const features = [
    {
      icon: <Brain size={24} />,
      title: "AI-Powered Socratic Learning",
      description: "Discover knowledge through intelligent questioning, not passive reading"
    },
    {
      icon: <Zap size={24} />,
      title: "Adaptive Timer System",
      description: "Earn more learning time with correct answers - up to 25 minutes per session"
    },
    {
      icon: <Target size={24} />,
      title: "Personalized Progression",
      description: "AI adapts to your understanding level and guides you to mastery"
    },
    {
      icon: <BookOpen size={24} />,
      title: "Comprehensive CS Curriculum",
      description: "From algorithms to system design - all based on industry-proven learning paths"
    }
  ];

  const testimonials = [
    {
      text: "Finally, a learning platform that actually makes me think!",
      author: "Sarah Chen",
      role: "CS Student"
    },
    {
      text: "The Socratic method + AI is a game-changer for understanding complex topics.",
      author: "Alex Rodriguez",
      role: "Software Engineer"
    },
    {
      text: "I love how it adapts to my pace and doesn't let me move on until I truly get it.",
      author: "Jordan Kim",
      role: "Bootcamp Graduate"
    }
  ];

  return (
    <div className="instant-start-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-header">
            <div className="logo-container">
              <Brain className="logo-icon" />
              <h1>MindMelt</h1>
            </div>
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>AI-Powered Learning</span>
            </div>
          </div>

          <div className="hero-main">
            <h2>Learn Computer Science Through</h2>
            <h2 className="hero-highlight">Intelligent Questioning</h2>
            <p className="hero-description">
              Experience the Socratic method powered by AI. No multiple choice, no passive reading - 
              just deep, personalized learning that adapts to your understanding.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">8-25</span>
                <span className="stat-label">Min Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">19+</span>
                <span className="stat-label">CS Topics</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">AI</span>
                <span className="stat-label">Personalized</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <button 
              onClick={handleGetStarted}
              className="btn btn-primary btn-large"
            >
              <Play size={20} />
              Start Learning Now
              <ArrowRight size={16} />
            </button>
            
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-secondary"
            >
              Already have an account?
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-container">
            <div className="floating-elements">
              <div className="floating-element">
                <Brain size={32} />
                <span>AI Tutor</span>
              </div>
              <div className="floating-element">
                <Target size={32} />
                <span>Adaptive</span>
              </div>
              <div className="floating-element">
                <Zap size={32} />
                <span>Dynamic</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h3>Why MindMelt Works</h3>
          <p>Traditional learning platforms make you passive. We make you think.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Section */}
      {showNameInput && (
        <div className="quick-start-section">
          <div className="section-header">
            <h3>Ready to Start Learning?</h3>
            <p>Choose a topic and learning style to begin your first session</p>
          </div>

          <div className="quick-start-form">
            <div className="form-section">
              <label className="form-label">
                What should we call you? (optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="form-input"
              />
            </div>

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
                      <span className="path-time">{path.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={() => setShowNameInput(false)}
                className="btn btn-secondary"
              >
                Back
              </button>
              <button
                onClick={startLearningSession}
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

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="section-header">
          <h3>What Learners Say</h3>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-content">
                <Star size={16} className="testimonial-icon" />
                <p>"{testimonial.text}"</p>
              </div>
              <div className="testimonial-author">
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="footer-section">
        <div className="footer-content">
          <div className="footer-logo">
            <Brain size={24} />
            <span>MindMelt</span>
          </div>
          <div className="footer-links">
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 MindMelt. Transforming education through AI-powered Socratic learning.</p>
        </div>
      </div>
    </div>
  );
};

export default InstantStart;