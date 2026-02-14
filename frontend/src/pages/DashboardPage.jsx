import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, LogOut, User, Upload, Code, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import '../styles/components/dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

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
            {/* Resume Validation Card */}
            <div className="option-card coming-soon">
              <div className="option-icon">
                <Upload size={32} />
              </div>
              <h3>Resume Skill Validation</h3>
              <p>Upload your resume and validate your claimed skills through Socratic questioning</p>
              <div className="coming-soon-badge">Phase 2 - Coming Soon</div>
              <Button variant="outline" size="medium" disabled>
                Upload Resume
              </Button>
            </div>

            {/* Project Learning Card */}
            <div className="option-card coming-soon">
              <div className="option-icon">
                <Code size={32} />
              </div>
              <h3>Project-Based Learning</h3>
              <p>Build 5 real-world projects with AI guidance and add them to your portfolio</p>
              <div className="coming-soon-badge">Phase 3 - Coming Soon</div>
              <Button variant="outline" size="medium" disabled>
                Start Projects
              </Button>
            </div>

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

          {/* Phase 1 Complete Notice */}
          <div className="phase-notice">
            <h3>✅ Phase 1: Core Infrastructure Complete!</h3>
            <p>Authentication system is working. Backend and frontend are connected.</p>
            <p>Next up: <strong>Phase 2 - Resume Analysis & Role Fit</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;