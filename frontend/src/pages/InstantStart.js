// ============================================================================
// pages/InstantStart.js - Simplified Start Page
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Play,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/instant-start.css';

const InstantStart = () => {
  const navigate = useNavigate();
  const { createAnonymousUser, isRegistered } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');
  const [userName, setUserName] = useState('');
  const [showQuickStart, setShowQuickStart] = useState(false);

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

  const handleStartLearning = () => {
    if (isRegistered) {
      navigate('/dashboard');
    } else {
      setShowQuickStart(true);
    }
  };

  const predefinedTopics = [
    {
      id: 'algorithms',
      name: 'Algorithms & Data Structures',
      description: 'Core programming concepts and problem-solving',
      icon: '⚙️',
      category: 'Computer Science',
      difficulty: 'Intermediate'
    },
    {
      id: 'webdev',
      name: 'Web Development',
      description: 'Frontend, backend, and full-stack development',
      icon: '🌐',
      category: 'Programming',
      difficulty: 'Beginner'
    },
    {
      id: 'databases',
      name: 'Database Systems',
      description: 'SQL, NoSQL, and database design',
      icon: '🗄️',
      category: 'Data',
      difficulty: 'Intermediate'
    },
    {
      id: 'systems',
      name: 'System Design',
      description: 'Scalable architectures and distributed systems',
      icon: '🖥️',
      category: 'Architecture',
      difficulty: 'Advanced'
    }
  ];

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

  return (
    <div className="instant-start-container">
      {/* Main Hero Section */}
      <div className="hero-section">
        {/* Left Side - Introduction & Buttons */}
        <div className="hero-content">
          {/* Logo */}
          <div className="logo-container">
            <Brain className="logo-icon" />
            <h1>MindMelt</h1>
          </div>

          {/* Main Message */}
          <div className="hero-main">
            <h2>Stop Memorizing.</h2>
            <h2 className="hero-highlight">Start Thinking.</h2>
            
            <div className="hero-description">
              <p className="main-pitch">
                MindMelt uses AI to ask you the right questions at the right time. 
                No multiple choice. No passive reading. Just pure thinking.
              </p>
              
              <div className="value-points">
                <div className="value-point">
                  <span className="point-icon">🤔</span>
                  <span>Learn through questions, not answers</span>
                </div>
                <div className="value-point">
                  <span className="point-icon">🧠</span>
                  <span>AI adapts to how you think</span>
                </div>
                <div className="value-point">
                  <span className="point-icon">💡</span>
                  <span>Discover knowledge for yourself</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cta-section">
            <h3>Ready to think differently?</h3>
            
            <div className="cta-buttons">
              <button 
                onClick={handleStartLearning}
                className="btn btn-primary btn-large"
              >
                <Play size={20} />
                Start Learning Now
              </button>
              
              <div className="auth-buttons">
                <button 
                  onClick={() => navigate('/signup')}
                  className="btn btn-secondary"
                >
                  <UserPlus size={18} />
                  Sign Up
                </button>
                
                <button 
                  onClick={() => navigate('/login')}
                  className="btn btn-secondary"
                >
                  <LogIn size={18} />
                  Login
                </button>
              </div>
            </div>
            
            <p className="cta-note">
              Try it instantly - no account required
            </p>
          </div>
        </div>

        {/* Right Side - Large Brain Visual */}
        <div className="hero-visual">
          <div className="brain-visual">
            <div className="brain-half">
              <Brain size={280} />
            </div>
            <div className="thinking-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <div className="brain-caption">
              <p>Think. Question. Discover.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      {showQuickStart && (
        <div className="quick-start-section">
          <div className="section-header">
            <h3>Choose Your Learning Path</h3>
            <p>Pick a topic and approach to get started</p>
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
                Choose a Computer Science Topic
              </label>
              
              <div className="topic-grid">
                {predefinedTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`topic-option ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div className="topic-icon">{topic.icon}</div>
                    <div className="topic-content">
                      <h4>{topic.name}</h4>
                      <p>{topic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
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

            <div className="form-actions">
              <button
                onClick={() => setShowQuickStart(false)}
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
                Start Thinking!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <div className="footer-section">
        <div className="footer-content">
          <div className="footer-logo">
            <Brain size={20} />
            <span>MindMelt</span>
          </div>
          <p>&copy; 2024 MindMelt - Think, don't memorize.</p>
        </div>
      </div>
    </div>
  );
};

export default InstantStart;