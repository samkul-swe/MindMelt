import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Code, Clock, Target, ArrowRight, CheckCircle, Loader } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/projects.css';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState('Mobile Engineering');

  useEffect(() => {
    const role = location.state?.targetRole || 'Mobile Engineering';
    setTargetRole(role);
    loadProjects(role);
    checkCurrentProject();
    loadCompletedProjects();
  }, []);

  const loadProjects = async (role) => {
    try {
      const domainMap = {
        'Mobile Engineer': 'Mobile Engineering',
        'Full-Stack Engineer': 'Full-Stack Engineering',
        'Backend Engineer': 'Backend Engineering',
        'Frontend Engineer': 'Frontend Engineering'
      };

      const domain = domainMap[role] || role;
      
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

  const loadCompletedProjects = async () => {
    try {
      const result = await api.getCompletedProjects();
      if (result.success) {
        setCompletedProjects(result.projects || []);
      }
    } catch (error) {
      console.error('Failed to load completed projects:', error);
    }
  };

  const isProjectUnlocked = (projectIndex) => {
    if (projectIndex === 0) return true;
    
    if (currentProject) {
      const currentProjectIndex = projects.findIndex(p => p.id === currentProject.projectId);
      return projectIndex <= currentProjectIndex;
    }
    
    return completedProjects.length >= projectIndex;
  };

  const getProjectStatus = (project, index) => {
    const isCompleted = completedProjects.some(p => p.projectId === project.id);
    const isCurrent = currentProject?.projectId === project.id;
    const isUnlocked = isProjectUnlocked(index);

    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    if (isUnlocked) return 'unlocked';
    return 'locked';
  };

  const handleStartProject = async (projectId, status) => {
    if (status === 'locked') {
      alert('Complete previous projects first to unlock this one!');
      return;
    }

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
          <h1>{targetRole} Learning Path</h1>
          <p>Build 5 curated projects designed specifically for {targetRole} roles</p>
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
          {projects.map((project, index) => {
            const status = getProjectStatus(project, index);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <div 
                key={project.id} 
                className={`project-card ${status}`}
              >
                <div className="project-header">
                  <div className="project-number">
                    {isCompleted && '✓ '}Project {index + 1}
                  </div>
                  <div 
                    className="difficulty-badge"
                    style={{ background: getDifficultyColor(project.difficulty) }}
                  >
                    {project.difficulty}
                  </div>
                </div>

                {isLocked && (
                  <div className="locked-overlay">
                    <div className="lock-icon">🔒</div>
                    <p>Complete Project {index} first</p>
                  </div>
                )}

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
                    variant={isCurrent ? 'primary' : isCompleted ? 'outline' : isLocked ? 'ghost' : 'primary'}
                    size="medium"
                    icon={isCompleted ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
                    onClick={() => handleStartProject(project.id, status)}
                    disabled={isLocked}
                  >
                    {isCompleted ? 'Completed ✓' : isCurrent ? 'Continue' : isLocked ? '🔒 Locked' : 'Start Project'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="progress-summary">
          <h3>Your Progress</h3>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${(completedProjects.length / projects.length) * 100}%` }}
            >
              {completedProjects.length} / {projects.length} Projects Complete
            </div>
          </div>
          <p className="progress-text">
            Complete all {projects.length} projects to earn your {targetRole} certificate
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;