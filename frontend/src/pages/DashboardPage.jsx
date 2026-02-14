import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, LogOut, User, Upload, Code, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [hasResume, setHasResume] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkResumeStatus();
  }, []);

  const checkResumeStatus = async () => {
    try {
      const result = await api.getResumeStatus();
      if (result.success) {
        setHasResume(result.hasResume);
        setLearningPath(result.learningPath);
      }
    } catch (error) {
      console.error('Failed to check resume status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <Brain size={32} />
              <span>MindMelt</span>
            </div>

            <div className="nav-user">
              <div className="user-info">
                <User size={20} />
                <span>{currentUser?.name || currentUser?.username}</span>
              </div>
              <Button
                variant="ghost"
                size="small"
                icon={<LogOut size={18} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1>Welcome back, {currentUser?.name}! 👋</h1>
            <p>Choose how you want to start your learning journey</p>
          </div>

          {/* Learning Options Grid */}
          <div className="options-grid">
            {/* Resume Validation Card - Always visible */}
            <div 
              className="option-card"
              onClick={() => navigate('/resume-upload')}
              style={{ cursor: 'pointer' }}
            >
              <div className="option-icon">
                <Upload size={32} />
              </div>
              <h3>Resume Skill Validation</h3>
              <p>Upload your resume and validate your claimed skills through Socratic questioning</p>
              {hasResume && (
                <div className="completed-badge">✓ Completed</div>
              )}
              <Button variant={hasResume ? "outline" : "primary"} size="medium">
                {hasResume ? 'Update Resume' : 'Upload Resume'}
              </Button>
            </div>

            {/* Project Learning Card - Show only if resume uploaded */}
            {hasResume && learningPath && (
              <div 
                className="option-card"
                onClick={() => navigate('/projects')}
                style={{ cursor: 'pointer' }}
              >
                <div className="option-icon">
                  <Code size={32} />
                </div>
                <h3>{learningPath.targetRole} Projects</h3>
                <p>Build 5 curated projects for {learningPath.targetRole} with AI guidance</p>
                <div className="path-info">
                  <span>🎯 {learningPath.timeline} days</span>
                  <span>•</span>
                  <span>5 projects</span>
                </div>
                <Button variant="primary" size="medium">
                  Start Projects
                </Button>
              </div>
            )}

            {/* Locked state when no resume */}
            {!hasResume && (
              <div className="option-card locked">
                <div className="option-icon locked-icon">
                  <Code size={32} />
                </div>
                <h3>Project-Based Learning</h3>
                <p>Upload your resume first to unlock personalized projects</p>
                <div className="lock-indicator">🔒 Locked</div>
              </div>
            )}

            {/* LeetCode Mastery Card */}
            <div className="option-card coming-soon">
              <div className="option-icon">
                <Target size={32} />
              </div>
              <h3>LeetCode Pattern Mastery</h3>
              <p>Optimize existing solutions and learn missing patterns systematically</p>
              <div className="coming-soon-badge">Phase 4 - Coming Soon</div>
              <Button variant="outline" size="medium" disabled>
                Connect GitHub
              </Button>
            </div>
          </div>

          {/* Phase Progress Notice */}
          <div className="phase-notice">
            <h3>✅ Phase 2: Resume Analysis - Active!</h3>
            <p>Upload your resume to get started with personalized learning paths.</p>
            <p>Next: <strong>Phase 3 - Project-Based Learning</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;