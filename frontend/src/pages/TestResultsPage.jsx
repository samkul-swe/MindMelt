import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, TrendingUp, ArrowRight, Award } from 'lucide-react';
import Button from '../components/common/Button';
import '../styles/components/test-results.css';

const TestResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { results, targetRole } = location.state || {};

  if (!results) {
    return (
      <div className="test-results-page">
        <div className="container">
          <p>No test results found.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const passed = results.percentage >= 70;

  const getCategoryIcon = (percentage) => {
    if (percentage >= 80) return { icon: CheckCircle, color: 'var(--success)', label: 'Excellent!' };
    if (percentage >= 60) return { icon: TrendingUp, color: 'var(--warning)', label: 'Good' };
    return { icon: XCircle, color: 'var(--error)', label: 'Needs work' };
  };

  return (
    <div className="test-results-page">
      <div className="container">
        <div className="results-container">
          {/* Header */}
          <div className="results-header">
            <div className={`score-circle ${passed ? 'passed' : 'needs-work'}`}>
              <Award size={48} />
              <div className="score-text">
                <div className="score-number">{results.score}/{results.totalQuestions}</div>
                <div className="score-percentage">{results.percentage}%</div>
              </div>
            </div>
            
            <h1>{passed ? '🎉 Assessment Complete!' : '📊 Assessment Complete'}</h1>
            <p className="results-subtitle">
              {passed 
                ? 'Great job! You have a solid foundation.'
                : 'You have room to grow - that\'s why you\'re here!'}
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="category-breakdown">
            <h2>📊 Results by Category</h2>
            
            <div className="categories-list">
              {Object.entries(results.categoryScores).map(([category, scores]) => {
                const { icon: Icon, color, label } = getCategoryIcon(scores.percentage);
                
                return (
                  <div key={category} className="category-item">
                    <div className="category-header">
                      <div className="category-info">
                        <Icon size={24} style={{ color }} />
                        <span className="category-name">{category}</span>
                      </div>
                      <div className="category-score">
                        <span className="score">{scores.correct}/{scores.total}</span>
                        <span className="label" style={{ color }}>{label}</span>
                      </div>
                    </div>
                    
                    <div className="category-progress">
                      <div 
                        className="category-bar" 
                        style={{ 
                          width: `${scores.percentage}%`,
                          background: color
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths */}
          {results.strengths?.length > 0 && (
            <div className="results-section strengths">
              <h2>💪 Your Strengths</h2>
              <ul>
                {results.strengths.map((strength, idx) => (
                  <li key={idx}>
                    <CheckCircle size={20} />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to Improve */}
          {results.weakAreas?.length > 0 && (
            <div className="results-section weak-areas">
              <h2>📚 Areas to Improve</h2>
              <ul>
                {results.weakAreas.map((area, idx) => (
                  <li key={idx}>
                    <TrendingUp size={20} />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations?.length > 0 && (
            <div className="results-section recommendations">
              <h2>💡 What You Need Help With</h2>
              <ul>
                {results.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Call to Action */}
          <div className="cta-section">
            <div className="cta-content">
              <h3>🎓 Ready to Master These Skills?</h3>
              <p>
                We have <strong>project-based learning</strong> designed specifically 
                for {targetRole} that focuses on your weak areas.
              </p>
              <p>
                You'll build <strong>5 real-world projects</strong> with AI guidance, 
                emphasizing {results.weakAreas?.join(', ') || 'your improvement areas'}.
              </p>
            </div>

            <div className="cta-actions">
              <Button
                variant="primary"
                size="large"
                icon={<ArrowRight size={20} />}
                onClick={() => navigate('/projects', { 
                  state: { 
                    targetRole,
                    testResults: results 
                  } 
                })}
              >
                Start Project-Based Learning
              </Button>
            </div>
          </div>

          {/* Review Answers */}
          <div className="review-section">
            <h3>Review Your Answers</h3>
            <div className="answers-review">
              {results.answers?.map((answer, idx) => (
                <div 
                  key={answer.questionId} 
                  className={`answer-review ${answer.correct ? 'correct' : 'incorrect'}`}
                >
                  <div className="answer-header">
                    <span className="question-num">Q{idx + 1}</span>
                    <span className="answer-status">
                      {answer.correct ? (
                        <>✓ Correct</>
                      ) : (
                        <>✗ Incorrect - Correct: {answer.correctAnswer}</>
                      )}
                    </span>
                  </div>
                  <p className="answer-explanation">{answer.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultsPage;