import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Code, MessageCircle, CheckCircle, ArrowRight, Download } from 'lucide-react';
import SocraticChat from '../components/SocraticChat';
import CodeEditor from '../components/CodeEditor';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/project-learning.css';

const ProjectLearningPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProjectId } = location.state || {};

  const [userProject, setUserProject] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('design'); // design → implementation → debugging → completed

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      // In real implementation, fetch from API
      // For now, using mock data
      setLoading(false);
    } catch (error) {
      console.error('Failed to load project:', error);
      setLoading(false);
    }
  };

  const handlePhaseComplete = (nextPhase) => {
    setCurrentPhase(nextPhase);
  };

  if (loading) {
    return <div className="loading-screen">Loading project...</div>;
  }

  return (
    <div className="project-learning-page">
      {/* Header with Progress */}
      <div className="learning-header">
        <div className="container">
          <div className="header-content">
            <div className="project-info">
              <h1>Project 1: Todo List App</h1>
              <p className="project-meta">Easy • 6 hours • Mobile Engineering</p>
            </div>

            {/* Phase Progress */}
            <div className="phase-progress">
              <div className={`phase-step ${currentPhase === 'design' ? 'active' : 'completed'}`}>
                <div className="step-number">1</div>
                <span>Design</span>
              </div>
              <div className="phase-line" />
              <div className={`phase-step ${currentPhase === 'implementation' ? 'active' : currentPhase === 'debugging' || currentPhase === 'completed' ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <span>Implement</span>
              </div>
              <div className="phase-line" />
              <div className={`phase-step ${currentPhase === 'debugging' ? 'active' : currentPhase === 'completed' ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <span>Debug</span>
              </div>
              <div className="phase-line" />
              <div className={`phase-step ${currentPhase === 'completed' ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <span>Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="learning-content">
        <div className="container">
          <div className="content-grid">
            {/* Left Side - Requirements/Info */}
            <div className="project-sidebar">
              <div className="sidebar-section">
                <h3>📋 Requirements</h3>
                <ul className="requirements-list">
                  <li><CheckCircle size={16} /> Add new todos with text input</li>
                  <li><CheckCircle size={16} /> Mark todos as complete/incomplete</li>
                  <li><CheckCircle size={16} /> Delete todos</li>
                  <li><CheckCircle size={16} /> Display list of all todos</li>
                  <li><CheckCircle size={16} /> Persist todos (survive app restart)</li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h3>🎯 Learning Objectives</h3>
                <ul className="objectives-list">
                  <li>React Native component architecture</li>
                  <li>AsyncStorage for persistence</li>
                  <li>State management with useState</li>
                  <li>List rendering and optimization</li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h3>⏱️ Time Tracker</h3>
                <div className="time-display">
                  <span className="time-spent">0:00</span>
                  <span className="time-estimate">/ 6:00 hours</span>
                </div>
                <div className="progress-bar-small">
                  <div className="progress-fill" style={{ width: '0%' }} />
                </div>
              </div>

              <div className="sidebar-section ice-cream-section">
                <h3>🍦 Progress Reward</h3>
                <div className="ice-cream-tracker">
                  <div className="ice-cream-cone">
                    <div className="scoop vanilla" />
                  </div>
                  <p className="ice-cream-text">1/5 Flavors</p>
                </div>
              </div>
            </div>

            {/* Right Side - Interactive Area */}
            <div className="project-workspace">
              {/* Design Phase */}
              {currentPhase === 'design' && (
                <div className="phase-container fade-in">
                  <div className="phase-header">
                    <MessageCircle size={32} />
                    <div>
                      <h2>Design Phase</h2>
                      <p>Let's think through the architecture before writing code</p>
                    </div>
                  </div>

                  <SocraticChat 
                    userProjectId={userProjectId}
                    onComplete={() => handlePhaseComplete('implementation')}
                  />
                </div>
              )}

              {/* Implementation Phase */}
              {currentPhase === 'implementation' && (
                <div className="phase-container fade-in">
                  <div className="phase-header">
                    <Code size={32} />
                    <div>
                      <h2>Implementation Phase</h2>
                      <p>Implement the TODOs in the scaffolded code below</p>
                    </div>
                  </div>

                  <CodeEditor 
                    initialCode={`// Scaffold code here`}
                    language="javascript"
                    onSubmit={(code) => handleCodeSubmit(code)}
                  />
                </div>
              )}

              {/* Debugging Phase */}
              {currentPhase === 'debugging' && (
                <div className="phase-container fade-in">
                  <div className="phase-header">
                    <h2>🐛 Debugging Phase</h2>
                    <p>Let's walk through your code and find issues together</p>
                  </div>

                  <SocraticChat 
                    userProjectId={userProjectId}
                    phase="debugging"
                    onComplete={() => handlePhaseComplete('completed')}
                  />
                </div>
              )}

              {/* Completion */}
              {currentPhase === 'completed' && (
                <div className="phase-container fade-in">
                  <div className="completion-content">
                    <div className="success-icon">
                      <CheckCircle size={64} />
                    </div>
                    <h2>🎉 Project Complete!</h2>
                    <p>Congratulations! You've built a working Todo List App</p>

                    <div className="completion-stats">
                      <div className="stat">
                        <span className="stat-label">Time Spent</span>
                        <span className="stat-value">5.5 hours</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Your Score</span>
                        <span className="stat-value">85/100</span>
                      </div>
                    </div>

                    <div className="completion-actions">
                      <Button
                        variant="primary"
                        size="large"
                        icon={<Download size={20} />}
                      >
                        Download Project Code
                      </Button>
                      <Button
                        variant="outline"
                        size="large"
                        icon={<ArrowRight size={20} />}
                        onClick={() => navigate('/projects')}
                      >
                        Next Project
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function handleCodeSubmit(code) {
    console.log('Code submitted:', code);
    // Move to debugging phase
    handlePhaseComplete('debugging');
  }
};

export default ProjectLearningPage;