import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Target, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/selectpath.css';

const SelectPathPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { targetRole, currentMatch, gaps, strengths } = location.state || {};

  const [timeline, setTimeline] = useState(30);
  const [motivation, setMotivation] = useState('');
  const [takeTest, setTakeTest] = useState(null); // null = not chosen, true = take test, false = skip
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate achievable outcomes based on timeline
  const calculateOutcomes = (days) => {
    const hoursPerDay = 2;
    const totalHours = days * hoursPerDay;

    if (days <= 30) {
      return {
        label: '30-Day Sprint',
        outcome: Math.min(currentMatch + 30, 90),
        level: 'Junior',
        topics: 3,
        projects: 2,
        hours: totalHours
      };
    } else if (days <= 60) {
      return {
        label: '60-Day Mastery',
        outcome: Math.min(currentMatch + 50, 95),
        level: 'Mid-Level',
        topics: 6,
        projects: 5,
        hours: totalHours
      };
    } else {
      return {
        label: '90-Day Expert Track',
        outcome: 95,
        level: 'Senior',
        topics: 10,
        projects: 8,
        hours: totalHours
      };
    }
  };

  const outcome = calculateOutcomes(timeline);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.selectRole({
        targetRole,
        currentMatch,
        timeline,
        motivation,
        takeTest
      });

      if (result.success) {
        // Navigate based on test choice
        if (takeTest) {
          navigate('/skill-test', { 
            state: { 
              targetRole,
              learningPathId: result.learningPath.id
            } 
          });
        } else {
          navigate('/projects', { 
            state: { 
              message: `Learning path created for ${targetRole}!`,
              targetRole 
            } 
          });
        }
      } else {
        setError(result.message || 'Failed to create learning path');
      }
    } catch (err) {
      console.error('Path creation error:', err);
      setError(err.message || 'Failed to create learning path');
    } finally {
      setLoading(false);
    }
  };

  const timelineOptions = [
    { days: 30, label: '1 Month', description: '2 hours/day' },
    { days: 60, label: '2 Months', description: '2 hours/day' },
    { days: 90, label: '3 Months', description: '2 hours/day' }
  ];

  return (
    <div className="selectpath-page">
      <div className="container">
        {/* Header */}
        <div className="selectpath-header">
          <Target size={40} className="header-icon" />
          <h1>Your Learning Plan: {targetRole}</h1>
          <p>Let's create a realistic path to get you job-ready</p>
        </div>

        {/* Current Status */}
        <div className="current-status">
          <div className="status-item">
            <span className="status-label">Current Match</span>
            <span className="status-value">{currentMatch}%</span>
          </div>
          <div className="status-arrow">→</div>
          <div className="status-item">
            <span className="status-label">Target Match</span>
            <span className="status-value target">{outcome.outcome}%</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="path-form">
          {/* Timeline Selection */}
          <div className="form-section">
            <h3>
              <Calendar size={24} />
              Choose Your Timeline
            </h3>
            <p className="section-desc">How much time can you dedicate to learning?</p>

            <div className="timeline-options">
              {timelineOptions.map((option) => (
                <div
                  key={option.days}
                  className={`timeline-card ${timeline === option.days ? 'selected' : ''}`}
                  onClick={() => setTimeline(option.days)}
                >
                  <div className="timeline-label">{option.label}</div>
                  <div className="timeline-desc">{option.description}</div>
                  <div className="timeline-hours">{option.days * 2} total hours</div>
                </div>
              ))}
            </div>

            {/* Custom Timeline */}
            <div className="custom-timeline">
              <label htmlFor="custom-days">Or set custom timeline (days):</label>
              <input
                type="number"
                id="custom-days"
                min="7"
                max="365"
                value={timeline}
                onChange={(e) => setTimeline(parseInt(e.target.value))}
                className="timeline-input"
              />
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="form-section">
            <h3>Expected Outcomes ({timeline} days)</h3>
            <div className="outcomes-card">
              <div className="outcome-header">
                <span className="outcome-badge">{outcome.label}</span>
                <span className="outcome-match">{outcome.outcome}% Match</span>
              </div>

              <div className="outcome-details">
                <div className="outcome-item">
                  <CheckCircle size={20} />
                  <span>{outcome.topics} key topics mastered</span>
                </div>
                <div className="outcome-item">
                  <CheckCircle size={20} />
                  <span>{outcome.projects} portfolio projects built</span>
                </div>
                <div className="outcome-item">
                  <CheckCircle size={20} />
                  <span>{outcome.hours} hours total investment</span>
                </div>
                <div className="outcome-item">
                  <CheckCircle size={20} />
                  <span>Ready for {outcome.level} {targetRole} roles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="form-section">
            <h3>What motivates you? (Optional)</h3>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="e.g., Want to transition to mobile development, specific company requires React Native, better job opportunities..."
              rows={3}
              className="motivation-input"
            />
          </div>

          {/* NEW: Optional Skill Test */}
          <div className="form-section">
            <h3>🎯 Skill Validation Test (Optional)</h3>
            <p className="section-desc">
              Take a quick test to validate your current skills for {targetRole}. 
              We'll identify specific areas to focus on and customize your learning path.
            </p>

            <div className="test-options">
              <div 
                className={`test-option ${takeTest === true ? 'selected' : ''}`}
                onClick={() => setTakeTest(true)}
              >
                <div className="option-header">
                  <CheckCircle size={24} />
                  <h4>Take Skill Test</h4>
                </div>
                <p>15-20 minutes to assess your current level</p>
                <ul className="option-benefits">
                  <li>✓ Get personalized gap analysis</li>
                  <li>✓ Skip topics you already know</li>
                  <li>✓ Focus on your weak areas</li>
                </ul>
              </div>

              <div 
                className={`test-option ${takeTest === false ? 'selected' : ''}`}
                onClick={() => setTakeTest(false)}
              >
                <div className="option-header">
                  <ArrowRight size={24} />
                  <h4>Start Projects Directly</h4>
                </div>
                <p>Jump straight into building projects</p>
                <ul className="option-benefits">
                  <li>✓ Start learning immediately</li>
                  <li>✓ Learn by doing</li>
                  <li>✓ Can take test later if needed</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            icon={<ArrowRight size={20} />}
            className="submit-btn"
            disabled={takeTest === null}
          >
            {takeTest ? 'Start Skill Test' : 'Start Learning Journey'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SelectPathPage;