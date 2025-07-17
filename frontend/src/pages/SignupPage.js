// ============================================================================
// pages/SignupPage.js - Progressive Signup Page
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Brain, Mail, User, Sparkles, ArrowRight, Zap, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signupWithEmail, loading, error, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [isFormFocused, setIsFormFocused] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!formData.email) {
      return 'Please enter your email address';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      await signupWithEmail(formData.email, formData.name);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleTryFirst = () => {
    navigate('/start');
  };

  return (
    <div className="auth-page-container signup">
      {/* Clean Background */}
      <div className="auth-background-clean">
        <div className="background-gradient"></div>
        <div className="background-pattern"></div>
      </div>

      {/* Main Content */}
      <div className="auth-content-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-header">
            <div className="brand-icon-container">
              <Brain className="brand-icon" />
              <div className="brand-glow"></div>
            </div>
            <div className="brand-text">
              <h1>MindMelt</h1>
              <p>Think Fast, Learn CS!</p>
            </div>
          </div>
          
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">
                <Sparkles size={24} />
              </div>
              <div className="feature-content">
                <h3>Start Learning Instantly</h3>
                <p>Jump right into AI-powered CS learning with no barriers</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Zap size={24} />
              </div>
              <div className="feature-content">
                <h3>Save Your Progress</h3>
                <p>Keep track of your learning journey and build your CS skills</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Star size={24} />
              </div>
              <div className="feature-content">
                <h3>Personalized Learning</h3>
                <p>AI adapts to your pace and learning style for maximum growth</p>
              </div>
            </div>
          </div>

          <div className="brand-stats">
            <div className="stat">
              <span className="stat-number">0</span>
              <span className="stat-label">Setup Time</span>
            </div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Learning Topics</span>
            </div>
            <div className="stat">
              <span className="stat-number">AI</span>
              <span className="stat-label">Powered</span>
            </div>
          </div>

          <div className="brand-cta">
            <p>Want to try it first?</p>
            <button
              onClick={handleTryFirst}
              className="instant-start-btn"
            >
              <Sparkles size={18} />
              Try Learning First
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="auth-form-container">
          <div className={`auth-form-card ${isFormFocused ? 'focused' : ''}`}>
            <div className="form-header">
              <h2>Save Your Progress</h2>
              <p>Create an account to track your learning journey and unlock advanced features!</p>
            </div>

            <form onSubmit={handleSubmit} className="enhanced-auth-form">
              {(formError || error) && (
                <div className="enhanced-error-message">
                  <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{formError || error}</span>
                  </div>
                </div>
              )}

              <div className="enhanced-form-group">
                <label htmlFor="name" className="enhanced-form-label">
                  <User size={18} />
                  Your Name (optional)
                </label>
                <div className="enhanced-input-container">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                    placeholder="What should we call you?"
                    className="enhanced-form-input"
                    disabled={loading}
                  />
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="enhanced-form-group">
                <label htmlFor="email" className="enhanced-form-label">
                  <Mail size={18} />
                  Email Address
                </label>
                <div className="enhanced-input-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setIsFormFocused(true)}
                    onBlur={() => setIsFormFocused(false)}
                    placeholder="Enter your email to save progress"
                    className="enhanced-form-input"
                    disabled={loading}
                    required
                  />
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="signup-benefits">
                <h4>What you'll get:</h4>
                <ul>
                  <li>✨ Progress tracking across all sessions</li>
                  <li>📊 Detailed learning analytics</li>
                  <li>🎯 Personalized learning paths</li>
                  <li>🏆 Achievement badges and streaks</li>
                </ul>
              </div>

              <button
                type="submit"
                className="enhanced-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="enhanced-spinner"></div>
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Start Saving My Progress</span>
                    <div className="btn-shine"></div>
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-enhanced">
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="auth-link-enhanced"
                  disabled={loading}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* No Password Notice */}
          <div className="no-password-notice">
            <div className="notice-header">
              <Zap size={18} />
              <span>No Password Required</span>
            </div>
            <p>We'll send you a secure link to access your account. No passwords to remember!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;