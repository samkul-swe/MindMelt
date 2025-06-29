// ============================================================================
// pages/LoginPage.js - Enhanced Login Page Component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isFormFocused, setIsFormFocused] = useState(false);

  // Test account credentials for easy access
  const demoCredentials = {
    email: 'demo@mindmelt.com',
    password: 'demo123'
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(error.message);
    }
  };

  const fillDemoCredentials = () => {
    setFormData(demoCredentials);
    if (formError) setFormError('');
  };

  return (
    <div className="auth-page-container">


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
                <Brain size={24} />
              </div>
              <div className="feature-content">
                <h3>AI-Powered CS Learning</h3>
                <p>Deep computer science questions that challenge your thinking</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <BookOpen size={24} />
              </div>
              <div className="feature-content">
                <h3>Computer Science Focus</h3>
                <p>Algorithms, data structures, systems, and more</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Trophy size={24} />
              </div>
              <div className="feature-content">
                <h3>Beat the Clock</h3>
                <p>Think fast before your ice cream melts!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-form-container">
          <div className={`auth-form-card ${isFormFocused ? 'focused' : ''}`}>
            <div className="form-header">
              <h2>Ready to Melt Some Minds?</h2>
              <p>Jump into Computer Science challenges before the ice cream melts!</p>
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
                    placeholder="Enter your email address"
                    className="enhanced-form-input"
                    disabled={loading}
                    required
                  />
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="enhanced-form-group">
                <label htmlFor="password" className="enhanced-form-label">
                  <Lock size={18} />
                  Password
                </label>
                <div className="enhanced-input-container">
                  <div className="password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setIsFormFocused(true)}
                      onBlur={() => setIsFormFocused(false)}
                      placeholder="Enter your password"
                      className="enhanced-form-input"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="enhanced-password-toggle"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="input-highlight"></div>
                </div>
              </div>

              <button
                type="submit"
                className="enhanced-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="enhanced-spinner"></div>
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <Brain size={20} />
                    <span>Enter MindMelt</span>
                    <div className="btn-shine"></div>
                  </>
                )}
              </button>

              <div className="form-divider">
                <span>or</span>
              </div>

              <button
                type="button"
                onClick={fillDemoCredentials}
                className="demo-btn"
                disabled={loading}
              >
                <Sparkles size={18} />
                Quick Demo - Beat the Melt!
              </button>
            </form>

            <div className="auth-footer-enhanced">
              <p>
                New to MindMelt?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="auth-link-enhanced"
                  disabled={loading}
                >
                  Create your account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;