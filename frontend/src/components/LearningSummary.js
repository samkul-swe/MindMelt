// src/components/LearningSummary.js - Component to display AI-generated learning summary

import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import '../styles/components/learning-summary.css';

const LearningSummary = ({ 
  summary, 
  isLoading, 
  error, 
  lastUpdated, 
  onRefresh,
  hasData 
}) => {
  const formatLastUpdated = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="learning-summary">
        <div className="learning-summary__header">
          <h2>Your Learning Journey</h2>
        </div>
        <div className="learning-summary__loading">
          <LoadingSpinner />
          <p>Generating your personalized learning summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-summary">
        <div className="learning-summary__header">
          <h2>Your Learning Journey</h2>
          <button 
            onClick={onRefresh}
            className="learning-summary__refresh-btn"
            title="Refresh summary"
          >
            🔄
          </button>
        </div>
        <div className="learning-summary__error">
          <p>We couldn't generate your learning summary right now.</p>
          <button onClick={onRefresh} className="btn btn--secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-summary">
      <div className="learning-summary__header">
        <h2>Your Learning Journey</h2>
        {hasData && (
          <button 
            onClick={onRefresh}
            className="learning-summary__refresh-btn"
            title="Refresh summary"
          >
            🔄
          </button>
        )}
      </div>
      
      <div className="learning-summary__content">
        {!hasData ? (
          <div className="learning-summary__welcome">
            <div className="learning-summary__icon">🌟</div>
            <h3>Welcome to Your Learning Adventure!</h3>
            <p>
              Your personalized learning summary will appear here once you start answering questions. 
              Each question you tackle helps build a picture of your progress and achievements.
            </p>
            <p>Ready to begin? Start your first learning session!</p>
          </div>
        ) : (
          <>
            <div className="learning-summary__text">
              {summary.split('\n').map((paragraph, index) => 
                paragraph.trim() && (
                  <p key={index} className="learning-summary__paragraph">
                    {paragraph.trim()}
                  </p>
                )
              )}
            </div>
            
            {lastUpdated && (
              <div className="learning-summary__footer">
                <span className="learning-summary__timestamp">
                  Updated {formatLastUpdated(lastUpdated)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LearningSummary;