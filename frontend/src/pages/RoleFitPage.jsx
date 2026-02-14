import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, CheckCircle, AlertCircle, XCircle, ArrowRight, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/rolefit.css';

const RoleFitPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [roleOverview, setRoleOverview] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);
  const [roleDetails, setRoleDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getRoleOverview();
  }, []);

  const getRoleOverview = async () => {
    try {
      setLoadingOverview(true);
      
      // IMPROVED: Single fast API call for overview
      const result = await api.getRoleOverview();
      
      if (result.success) {
        setRoleOverview(result.overview);
        setProfile(result.profile);
      } else {
        setError(result.message || 'Failed to get role overview');
      }
    } catch (err) {
      console.error('Role overview error:', err);
      setError(err.message || 'Failed to get role overview');
    } finally {
      setLoadingOverview(false);
    }
  };

  const handleExpandRole = async (roleName) => {
    // Toggle expansion
    if (expandedRole === roleName) {
      setExpandedRole(null);
      return;
    }

    setExpandedRole(roleName);

    // If we already have details, don't fetch again
    if (roleDetails[roleName]) {
      return;
    }

    // IMPROVED: Fetch details only when user clicks
    try {
      setLoadingDetails({ ...loadingDetails, [roleName]: true });
      
      const result = await api.getRoleDetails(roleName);
      
      if (result.success) {
        setRoleDetails({
          ...roleDetails,
          [roleName]: result.details
        });
      }
    } catch (err) {
      console.error(`Failed to get details for ${roleName}:`, err);
    } finally {
      setLoadingDetails({ ...loadingDetails, [roleName]: false });
    }
  };

  const handleSelectRole = (roleName) => {
    const matchPercent = roleOverview[roleName];
    const details = roleDetails[roleName];

    navigate('/select-path', {
      state: {
        targetRole: roleName,
        currentMatch: matchPercent,
        gaps: details?.gaps || [],
        strengths: details?.strengths || []
      }
    });
  };

  const getRoleIcon = (match) => {
    if (match >= 80) return { icon: CheckCircle, color: 'var(--success)' };
    if (match >= 60) return { icon: AlertCircle, color: 'var(--warning)' };
    return { icon: XCircle, color: 'var(--error)' };
  };

  const getRoleClass = (match) => {
    if (match >= 80) return 'ready';
    if (match >= 60) return 'close';
    return 'needs-work';
  };

  if (loadingOverview) {
    return (
      <div className="rolefit-page">
        <div className="container">
          <div className="analyzing-state">
            <Loader size={48} className="spin-slow" />
            <h2>Analyzing Your Role Fit...</h2>
            <p>Getting quick overview of all roles</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rolefit-page">
        <div className="container">
          <div className="error-state">
            <XCircle size={48} />
            <h2>Analysis Failed</h2>
            <p>{error}</p>
            <Button onClick={() => navigate('/resume-upload')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rolefit-page">
      <div className="container">
        <div className="rolefit-header">
          <Target size={40} className="header-icon" />
          <h1>Your Role Fit Analysis</h1>
          <p>Click any role to see detailed strengths and gaps</p>
        </div>

        {/* Skills Summary */}
        {profile && (
          <div className="skills-summary">
            <h3>Your Profile</h3>
            <div className="skills-list">
              {profile.skills?.slice(0, 12).map((skill, idx) => (
                <span key={idx} className="skill-badge">{skill}</span>
              ))}
            </div>
            <div className="experience-info">
              <span>{profile.experienceYears} years</span>
              <span>•</span>
              <span>{profile.experienceLevel}</span>
            </div>
          </div>
        )}

        {/* Role Cards */}
        {roleOverview && (
          <div className="roles-grid">
            {Object.entries(roleOverview).map(([roleName, matchPercent]) => {
              const { icon: Icon, color } = getRoleIcon(matchPercent);
              const roleClass = getRoleClass(matchPercent);
              const isExpanded = expandedRole === roleName;
              const details = roleDetails[roleName];
              const isLoadingDetails = loadingDetails[roleName];

              return (
                <div
                  key={roleName}
                  className={`role-card ${roleClass} ${isExpanded ? 'expanded' : ''}`}
                >
                  {/* Card Header - Always Visible */}
                  <div 
                    className="role-card-header"
                    onClick={() => handleExpandRole(roleName)}
                  >
                    <div className="role-header">
                      <div className="role-icon" style={{ background: color }}>
                        <Icon size={32} color="white" />
                      </div>
                      <div className="role-match">
                        <div className="match-percentage">{matchPercent}%</div>
                        <div className="match-label">Match</div>
                      </div>
                    </div>

                    <div className="role-title-row">
                      <h3 className="role-name">{roleName}</h3>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    <div className="role-status">
                      {matchPercent >= 80 ? (
                        <span className="status-badge ready">
                          <CheckCircle size={16} />
                          Ready to Apply
                        </span>
                      ) : matchPercent >= 60 ? (
                        <span className="status-badge close">
                          <AlertCircle size={16} />
                          Close - Needs Work
                        </span>
                      ) : (
                        <span className="status-badge needs-work">
                          <XCircle size={16} />
                          Needs Preparation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details - Load on Click */}
                  {isExpanded && (
                    <div className="role-details">
                      {isLoadingDetails ? (
                        <div className="details-loading">
                          <Loader size={24} className="spin" />
                          <p>Loading detailed analysis...</p>
                        </div>
                      ) : details ? (
                        <>
                          {/* Strengths */}
                          <div className="role-section">
                            <h4>✓ Your Strengths</h4>
                            <ul>
                              {details.strengths?.map((strength, idx) => (
                                <li key={idx}>{strength}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Gaps */}
                          {details.gaps?.length > 0 && (
                            <div className="role-section">
                              <h4>↗ Areas to Develop</h4>
                              <ul>
                                {details.gaps.map((gap, idx) => (
                                  <li key={idx}>{gap}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Recommendations */}
                          {details.recommendations?.length > 0 && (
                            <div className="role-section">
                              <h4>💡 Recommendations</h4>
                              <ul>
                                {details.recommendations.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="role-footer">
                            <Button
                              variant="primary"
                              size="medium"
                              icon={<ArrowRight size={18} />}
                              onClick={() => handleSelectRole(roleName)}
                            >
                              {matchPercent >= 80 ? 'Start Learning Path' : 'Bridge the Gap'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <p className="details-hint">Click to load detailed analysis</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleFitPage;