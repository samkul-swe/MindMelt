// ============================================================================
// pages/SignupPage.js - Signup Page Component
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, User, Sparkles } from 'lucide-react';
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
    <div className="app-container">
      <div className="auth-container signup-container">
        <div className="auth-header">
          <div className="auth-icon-container">
            <Brain className="auth-icon" />
          </div>
          <h1>Join MindMelt</h1>
          <p className="auth-subtitle">Create your account and start learning</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(formError || error) && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {formError || error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={18} />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="form-input"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="form-input"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={18} />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password (min 6 characters)"
                className="form-input"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock size={18} />
              Confirm Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="form-input"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Creating account...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Create MindMelt Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="auth-link"
              disabled={loading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;