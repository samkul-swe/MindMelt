// ============================================================================
// pages/SignupPage.js - Enhanced Signup Page Component with Theme
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, User, Sparkles, BookOpen, Users, Rocket, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isFormFocused, setIsFormFocused] = useState(false);

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

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }
    
    if (formData.name.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
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
      await signup(formData.email, formData.password, formData.name);
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <div className="auth-page-container signup">
      {/* Animated Background Elements - New journey focused */}
      <div className="auth-background">
        <div className="floating-element element-1">
          <Rocket size={60} />
        </div>
        <div className="floating-element element-2">
          <Star size={50} />
        </div>
        <div className="floating-element element-3">
          <Sparkles size={55} />
        </div>
        <div className="floating-element element-4">
          <Users size={45} />
        </div>
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
                <Rocket size={24} />
              </div>
              <div className="feature-content">
                <h3>Launch Your CS Journey</h3>
                <p>Start with challenging computer science problems tailored to your level</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <BookOpen size={24} />
              </div>
              <div className="feature-content">
                <h3>Comprehensive Learning</h3>
                <p>From basics to advanced topics in algorithms, data structures, and more</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Users size={24} />
              </div>
              <div className="feature-content">
                <h3>Join the Community</h3>
                <p>Connect with fellow CS learners and grow together</p>
              </div>
            </div>
          </div>

          <div className="brand-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">New Students</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">CS Topics</span>
            </div>
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Learn Rate</span>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="auth-form-container">
          <div className={`auth-form-card ${isFormFocused ? 'focused' : ''}`}>
            <div className="form-header">
              <h2>Start Your CS Journey</h2>
              <p>Create your account and begin melting minds with challenging CS problems!</p>
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
                  Full Name
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
                    placeholder="Enter your full name"
                    className="enhanced-form-input"
                    disabled={loading}
                    required
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
                      placeholder="Create a password (min 6 characters)"
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

              <div className="enhanced-form-group">
                <label htmlFor="confirmPassword" className="enhanced-form-label">
                  <Lock size={18} />
                  Confirm Password
                </label>
                <div className="enhanced-input-container">
                  <div className="password-field">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setIsFormFocused(true)}
                      onBlur={() => setIsFormFocused(false)}
                      placeholder="Confirm your password"
                      className="enhanced-form-input"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="enhanced-password-toggle"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                    <span>Creating your journey...</span>
                  </>
                ) : (
                  <>
                    <Rocket size={20} />
                    <span>Launch My CS Journey</span>
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
        </div>
      </div>
    </div>
  );
};

export default SignupPage;