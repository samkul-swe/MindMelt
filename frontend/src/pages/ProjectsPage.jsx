import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Clock, Target, ArrowRight, CheckCircle, Loader } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/projects.css';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('Mobile Engineering'); // From learning path

  useEffect(() => {
    loadProjects();
    checkCurrentProject();
  }, []);

  const loadProjects = async () => {
    try {
      const result = await api.getProjects(domain);
      if (result.success) {
        setProjects(result.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentProject = async () => {
    try {
      const result = await api.getCurrentProject();
      if (result.success && result.hasProject) {
        setCurrentProject(result.project);
      }
    } catch (error) {
      console.error('Failed to check current project:', error);
    }
  };

  const handleStartProject = async (projectId) => {
    try {
      const result = await api.startProject(projectId);
      if (result.success) {
        navigate('/project-learning', { 
          state: { userProjectId: result.userProject.id } 
        });
      }
    } catch (error) {
      console.error('Failed to start project:', error);
      alert('Failed to start project. Please try again.');
    }
  };

  const handleContinueProject = () => {
    navigate('/project-learning', { 
      state: { userProjectId: currentProject.id } 
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'var(--success)',
      'Medium': 'var(--warning)',
      'Hard': 'var(--error)'
    };
    return colors[difficulty] || 'var(--gray-500)';
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="container">
          <div className="loading-state">
            <Loader size={48} className="spin" />
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="container">
        {/* Header */}
        <div className="projects-header">
          <Code size={40} className="header-icon" />
          <h1>{domain} Projects</h1>
          <p>Build 5 real-world projects with AI guidance</p>
        </div>

        {/* Continue Current Project */}
        {currentProject && (
          <div className="current-project-banner">
            <div className="banner-content">
              <div className="banner-icon">
                <Code size={24} />
              </div>
              <div className="banner-text">
                <h3>Continue: {currentProject.projectName}</h3>
                <p>Phase: {currentProject.phase} • {currentProject.project?.difficulty}</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="medium"
              icon={<ArrowRight size={18} />}
              onClick={handleContinueProject}
            >
              Continue Project
            </Button>
          </div>
        )}

        {/* Project Cards */}
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-number">Project {index + 1}</div>
                <div 
                  className="difficulty-badge"
                  style={{ background: getDifficultyColor(project.difficulty) }}
                >
                  {project.difficulty}
                </div>
              </div>

              <h3 className="project-title">{project.projectName}</h3>
              <p className="project-description">{project.description}</p>

              <div className="project-meta">
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{project.timeEstimate} hours</span>
                </div>
                <div className="meta-item">
                  <Target size={16} />
                  <span>{project.requirements?.length || 0} requirements</span>
                </div>
              </div>

              <div className="project-objectives">
                <h4>You'll Learn:</h4>
                <ul>
                  {project.learningObjectives?.slice(0, 3).map((obj, idx) => (
                    <li key={idx}>
                      <CheckCircle size={14} />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="project-footer">
                <Button
                  variant={index === 0 || currentProject ? 'primary' : 'outline'}
                  size="medium"
                  icon={<ArrowRight size={18} />}
                  onClick={() => handleStartProject(project.id)}
                  disabled={currentProject && currentProject.projectId !== project.id}
                >
                  {currentProject?.projectId === project.id
                    ? 'Continue'
                    : index === 0
                    ? 'Start Project'
                    : 'Locked'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="progress-summary">
          <h3>Your Progress</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: '0%' }}>
              0 / 5 Projects Complete
            </div>
          </div>
          <p className="progress-text">
            Complete all 5 projects to earn your certificate and download portfolio package
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;