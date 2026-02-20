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
  const [stats, setStats] = useState(null);

  useEffect(() => {
    checkResumeStatus();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const result = await api.getUserStats();
      if (result.success) {
        setStats(result);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sarcastic messages based on progress
  const getSarcasticMessage = () => {
    if (!stats) return "Ready to stop googling and start learning? 😏";
    
    const progress = stats.projectsCompleted;
    
    if (progress === 0) {
      return "Still pretending to know React? Let's see if you've learned anything yet 😏";
    } else if (progress < 3) {
      return "Making progress? Or just getting lucky? Keep going! 🚀";
    } else if (progress < 5) {
      return "Look at you, actually learning! Don't stop now 💪";
    } else {
      return "You actually did it! Now go build something real 🎉";
    }
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
            <p className="sarcastic-subtitle">
              {getSarcasticMessage()}
            </p>
            
            {/* Stats Grid */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.projectsCompleted}/{stats.totalProjects}</span>
                  <span className="stat-label">Projects Completed</span>
                </div>
                
                <div className="stat-card">
                  {stats.projectsCompleted > 0 ? (
                    <>
                      <span className="stat-value">+{stats.skillImprovement}%</span>
                      <span className="stat-label">Skill Growth</span>
                    </>
                  ) : (
                    <>
                      <span className="stat-value motivational">Let's Start! 🚀</span>
                      <span className="stat-label">Your Journey Awaits</span>
                    </>
                  )}
                </div>
                
                <div className="stat-card achievement">
                  <span className="stat-label">🏆 Last Achievement</span>
                  <span className="stat-value">{stats.lastAchievement || 'Journey Started'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Learning Options Grid */}
          <div className="options-grid">
            {/* Resume Validation Card */}
            <div 
              className="option-card"
              onClick={() => navigate('/resume-upload')}
              style={{ cursor: 'pointer' }}
            >
              <div className="option-icon">
                <Upload size={32} />
              </div>
              <h3>Resume Skill Validation</h3>
              <p>Upload your resume and discover which roles fit you best</p>
              {hasResume && (
                <div className="completed-badge">✓ Resume Uploaded</div>
              )}
              <Button variant={hasResume ? "outline" : "primary"} size="medium">
                {hasResume ? 'Update Resume' : 'Upload Resume'}
              </Button>
            </div>

            {/* Project Learning Card */}
            {hasResume && learningPath ? (
              <div 
                className="option-card highlight"
                onClick={() => navigate('/projects')}
                style={{ cursor: 'pointer' }}
              >
                <div className="option-icon">
                  <Code size={32} />
                </div>
                <h3>{learningPath.targetRole}</h3>
                <p>Build 5 projects with Socratic AI guidance</p>
                <div className="path-info">
                  <span>🎯 {learningPath.timeline} days</span>
                  <span>•</span>
                  <span>5 projects</span>
                  <span>•</span>
                  <span>{stats?.projectsCompleted || 0}/5 done</span>
                </div>
                <Button variant="primary" size="medium">
                  {stats?.projectsCompleted > 0 ? 'Continue Learning' : 'Start Projects'}
                </Button>
              </div>
            ) : hasResume ? (
              <div 
                className="option-card"
                onClick={() => navigate('/role-selection')}
                style={{ cursor: 'pointer' }}
              >
                <div className="option-icon">
                  <Code size={32} />
                </div>
                <h3>Choose Your Path</h3>
                <p>Select a target role and start your learning journey</p>
                <Button variant="primary" size="medium">
                  Select Role
                </Button>
              </div>
            ) : (
              <div className="option-card locked">
                <div className="option-icon locked-icon">
                  <Code size={32} />
                </div>
                <h3>Project-Based Learning</h3>
                <p>Upload your resume first to unlock personalized projects</p>
                <div className="lock-indicator">🔒 Upload resume to unlock</div>
              </div>
            )}

            {/* LeetCode Card - Phase 4 */}
            <div className="option-card coming-soon">
              <div className="option-icon">
                <Target size={32} />
              </div>
              <h3>LeetCode Mastery</h3>
              <p>Optimize solutions and master coding patterns</p>
              <div className="coming-soon-badge">Coming in Phase 4</div>
              <Button variant="outline" size="medium" disabled>
                Connect GitHub
              </Button>
            </div>
          </div>

          {/* Quick Actions / Help */}
          {!hasResume && (
            <div className="help-banner">
              <h3>👉 Start Here</h3>
              <p>Upload your resume to get personalized project recommendations based on your skills and target role</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;