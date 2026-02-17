import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Code, MessageCircle, CheckCircle, ArrowRight, Download, Lightbulb } from 'lucide-react';
import SocraticChat from '../components/SocraticChat';
import CodeEditor from '../components/CodeEditor';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/project-learning.css';

const ProjectLearningPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProjectId } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('design');
  const [mode, setMode] = useState('chat'); // NEW: 'chat' | 'editor'
  const [editorState, setEditorState] = useState(null); // NEW: Editor data
  const [performanceData, setPerformanceData] = useState(null);
  const [discoveredComponents, setDiscoveredComponents] = useState([]);

  const allComponents = [
    { name: 'App', description: 'Main container with state' },
    { name: 'AddTodo', description: 'Input field component' },
    { name: 'TodoList', description: 'Renders list of todos' },
    { name: 'TodoItem', description: 'Individual todo display' },
    { name: 'AsyncStorage', description: 'Data persistence' }
  ];

  const handleComponentDiscovered = (componentName) => {
    if (!discoveredComponents.includes(componentName)) {
      setDiscoveredComponents([...discoveredComponents, componentName]);
    }
  };

  const handlePhaseComplete = (nextPhase) => {
    setCurrentPhase(nextPhase);
    setMode('chat'); // Reset to chat when phase changes
  };

  // NEW: Handle editor opening from chat
  const handleOpenEditor = (editorData) => {
    console.log('📝 Opening editor:', editorData);
    setEditorState(editorData);
    setMode('editor');
  };

  // NEW: Handle code submission success
  const handleCodeSubmitSuccess = () => {
    // Code was accepted, back to chat
    setMode('chat');
    setEditorState(null);
    
    // If in design phase, might move to implementation
    // Backend will handle this through conversation
  };

  // NEW: Handle back to chat from editor
  const handleBackToChat = () => {
    setMode('chat');
    setEditorState(null);
  };

  const handleProjectComplete = async () => {
    try {
      setLoading(true);
      const result = await api.completeProject(userProjectId);
      
      if (result.success) {
        setPerformanceData(result.performance);
        handlePhaseComplete('completed');
      }
    } catch (error) {
      console.error('Failed to complete project:', error);
      alert('Failed to complete project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadProject = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
      const token = localStorage.getItem('mindmelt_token');
      
      const response = await fetch(`${API_BASE_URL}/api/projects/download/${userProjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : '1_mobile_engineer.zip';

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      console.log('Project downloaded as ZIP:', filename);
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Failed to download. Please try again.');
    }
  };

  // Show editor fullscreen when mode is 'editor'
  if (mode === 'editor' && editorState) {
    return (
      <div className="project-learning-page-fullscreen">
        <div className="learning-header-compact">
          <div className="container-wide">
            <div className="header-content-compact">
              <h1>Project 1: Todo List App - Code Editor</h1>
              <div className="phase-pills">
                <span className="phase-pill active">Implementation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="learning-content-fullscreen">
          <div className="container-wide">
            <div className="fullscreen-phase">
              <CodeEditor 
                userProjectId={userProjectId}
                file={editorState.file}
                initialCode={editorState.template}
                language="java"
                onSubmit={handleCodeSubmitSuccess}
                onBackToChat={handleBackToChat}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular chat phases
  return (
    <div className="project-learning-page-fullscreen">
      <div className="learning-header-compact">
        <div className="container-wide">
          <div className="header-content-compact">
            <h1>Project 1: Todo List App</h1>
            <div className="phase-pills">
              <span className={`phase-pill ${currentPhase === 'design' ? 'active' : 'completed'}`}>Design</span>
              <span className={`phase-pill ${currentPhase === 'implementation' ? 'active' : 'completed'}`}>Implement</span>
              <span className={`phase-pill ${currentPhase === 'debugging' ? 'active' : 'completed'}`}>Debug</span>
              <span className={`phase-pill ${currentPhase === 'completed' ? 'active' : ''}`}>Complete</span>
            </div>
          </div>
        </div>
      </div>

      {currentPhase === 'design' && (
        <div className="learning-content-fullscreen">
          <div className="container-wide">
            <div className="split-view">
              <div className="chat-panel">
                <div className="panel-header">
                  <MessageCircle size={24} />
                  <h2>Design Conversation</h2>
                  <p>Discuss the architecture with AI</p>
                </div>
                <SocraticChat 
                  userProjectId={userProjectId}
                  phase="design"
                  onComponentMentioned={handleComponentDiscovered}
                  onComplete={() => handlePhaseComplete('implementation')}
                  onOpenEditor={handleOpenEditor} // NEW: Pass handler
                />
              </div>

              <div className="architecture-panel">
                <div className="panel-header">
                  <Lightbulb size={24} />
                  <h2>Architecture Builder</h2>
                  <p>Components appear as you discover them</p>
                </div>
                
                <div className="architecture-diagram">
                  {discoveredComponents.length === 0 ? (
                    <div className="empty-diagram">
                      <Lightbulb size={48} />
                      <p>Start chatting to build your architecture!</p>
                      <p className="hint">Mention component names like "TodoList", "AddTodo"...</p>
                    </div>
                  ) : (
                    <div className="component-tree">
                      {allComponents.map((comp) => {
                        const isDiscovered = discoveredComponents.includes(comp.name);
                        return (
                          <div key={comp.name} className={`component-node ${isDiscovered ? 'discovered' : 'undiscovered'}`}>
                            <div className="component-icon">{isDiscovered ? '✓' : '?'}</div>
                            <div className="component-info">
                              <div className="component-name">{isDiscovered ? comp.name : '???'}</div>
                              <div className="component-desc">{isDiscovered ? comp.description : 'Keep chatting to discover'}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="architecture-progress">
                        <div className="progress-text">{discoveredComponents.length} / {allComponents.length} discovered</div>
                        <div className="mini-progress-bar">
                          <div className="mini-progress-fill" style={{ width: `${(discoveredComponents.length / allComponents.length) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPhase === 'implementation' && (
        <div className="learning-content-fullscreen">
          <div className="container-wide">
            <div className="fullscreen-phase">
              <div className="phase-header-minimal">
                <Code size={28} />
                <div>
                  <h2>Implementation Phase</h2>
                  <p>Continue the conversation - AI will guide you</p>
                </div>
              </div>
              <div className="fullscreen-chat">
                <SocraticChat 
                  userProjectId={userProjectId}
                  phase="implementation"
                  onComplete={() => handlePhaseComplete('debugging')}
                  onOpenEditor={handleOpenEditor} // NEW: Pass handler
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPhase === 'debugging' && (
        <div className="learning-content-fullscreen">
          <div className="container-wide">
            <div className="fullscreen-phase">
              <div className="phase-header-minimal">
                <MessageCircle size={28} />
                <div>
                  <h2>🐛 Debugging Phase</h2>
                  <p>Let's find and fix issues in your code</p>
                </div>
              </div>
              <div className="fullscreen-chat">
                <SocraticChat 
                  userProjectId={userProjectId}
                  phase="debugging"
                  onComplete={handleProjectComplete}
                  onOpenEditor={handleOpenEditor} // NEW: Pass handler
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPhase === 'completed' && (
        <div className="learning-content-fullscreen">
          <div className="container-wide">
            <div className="fullscreen-phase">
              <div className="completion-content">
                <div className="success-icon">
                  <CheckCircle size={64} />
                </div>
                <h2>🎉 Project Complete!</h2>
                <p>You've successfully built a Todo List App</p>

                {performanceData && (
                  <>
                    <div className="completion-stats">
                      <div className="stat">
                        <span className="stat-label">Time Spent</span>
                        <span className="stat-value">{performanceData.timeSpent || '5.5'}h</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{performanceData.overallScore}/100</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Architecture</span>
                        <span className="stat-value">{performanceData.scores?.architecture}/100</span>
                      </div>
                    </div>

                    <div className="what-you-learned">
                      <h3>💪 Your Strengths</h3>
                      <ul>
                        {performanceData.strengths?.map((s, i) => <li key={i}>✓ {s}</li>)}
                      </ul>
                    </div>

                    {performanceData.gaps?.length > 0 && (
                      <div className="what-you-learned">
                        <h3>📈 Areas You Improved</h3>
                        <ul>
                          {performanceData.gaps.map((g, i) => <li key={i}>↗ {g}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <div className="completion-actions">
                  <Button variant="primary" size="large" icon={<Download size={20} />} onClick={handleDownloadProject}>
                    Download Project Code
                  </Button>
                  <Button variant="outline" size="large" icon={<ArrowRight size={20} />} onClick={() => navigate('/projects')}>
                    Continue to Project 2
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectLearningPage;