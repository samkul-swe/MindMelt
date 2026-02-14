import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/components/skill-test.css';

const SkillTestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { targetRole, learningPathId } = location.state || {};

  const [testStarted, setTestStarted] = useState(false);
  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleStartTest = async () => {
    try {
      setLoading(true);
      
      const result = await api.startTest(targetRole);
      
      if (result.success) {
        setTestId(result.testId);
        setQuestions(result.questions);
        setTestStarted(true);
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      alert('Failed to start test. Try skipping to projects instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Format answers for submission
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        selectedOption: answers[q.id]
      }));

      const result = await api.submitTest(testId, formattedAnswers);

      if (result.success) {
        navigate('/test-results', { 
          state: { 
            results: result.results,
            targetRole,
            learningPathId
          } 
        });
      }
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = answers[currentQuestion?.id];
  const allAnswered = questions.every(q => answers[q.id]);

  // Introduction Screen
  if (!testStarted) {
    return (
      <div className="skill-test-page">
        <div className="container">
          <div className="test-intro">
            <div className="intro-icon">
              <Target size={64} />
            </div>
            
            <h1>{targetRole} Skill Assessment</h1>
            <p className="intro-subtitle">
              Test your expertise with 10 carefully designed questions
            </p>

            <div className="test-overview">
              <h3>What we'll assess:</h3>
              <div className="assessment-areas">
                <div className="area-item">
                  <CheckCircle size={20} />
                  <span>Architecture & Design (3 questions)</span>
                </div>
                <div className="area-item">
                  <CheckCircle size={20} />
                  <span>Performance Optimization (2 questions)</span>
                </div>
                <div className="area-item">
                  <CheckCircle size={20} />
                  <span>Mobile-Specific Patterns (2 questions)</span>
                </div>
                <div className="area-item">
                  <CheckCircle size={20} />
                  <span>Best Practices (2 questions)</span>
                </div>
                <div className="area-item">
                  <CheckCircle size={20} />
                  <span>Real-World Scenarios (1 question)</span>
                </div>
              </div>

              <div className="test-details">
                <div className="detail">
                  <span className="detail-label">⏱️ Duration:</span>
                  <span className="detail-value">~10 minutes</span>
                </div>
                <div className="detail">
                  <span className="detail-label">📊 Format:</span>
                  <span className="detail-value">Multiple choice</span>
                </div>
                <div className="detail">
                  <span className="detail-label">🎯 Purpose:</span>
                  <span className="detail-value">Personalize your learning</span>
                </div>
              </div>
            </div>

            <div className="intro-actions">
              <Button
                variant="primary"
                size="large"
                loading={loading}
                icon={<ArrowRight size={20} />}
                onClick={handleStartTest}
              >
                Start Assessment
              </Button>
              <Button
                variant="outline"
                size="large"
                onClick={() => navigate('/projects', { state: { targetRole } })}
              >
                Skip to Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Questions Screen
  return (
    <div className="skill-test-page">
      <div className="container">
        <div className="test-container">
          {/* Progress Header */}
          <div className="test-header">
            <div className="progress-info">
              <span className="question-number">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="category-badge">{currentQuestion?.category}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="question-card">
            <h2 className="question-text">{currentQuestion?.question}</h2>

            <div className="options-list">
              {currentQuestion?.options.map((option) => (
                <div
                  key={option.id}
                  className={`option-item ${
                    answers[currentQuestion.id] === option.id ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                >
                  <div className="option-radio">
                    {answers[currentQuestion.id] === option.id && (
                      <div className="radio-selected" />
                    )}
                  </div>
                  <div className="option-content">
                    <span className="option-letter">{option.id})</span>
                    <span className="option-text">{option.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="test-navigation">
            <Button
              variant="outline"
              size="medium"
              icon={<ArrowLeft size={18} />}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="answered-indicator">
              {Object.keys(answers).length} / {questions.length} answered
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                variant="primary"
                size="medium"
                icon={<CheckCircle size={18} />}
                onClick={handleSubmit}
                disabled={!allAnswered}
                loading={loading}
              >
                Submit Test
              </Button>
            ) : (
              <Button
                variant="primary"
                size="medium"
                icon={<ArrowRight size={18} />}
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTestPage;