import React, { useState, useEffect } from 'react';
import '../styles/BreakScreen.css';

const BreakScreen = ({ progress, topic, sessionDuration, onNewSession, onBackToHome }) => {
  const [breakTimer, setBreakTimer] = useState(300); // 5 minutes break
  const [showBreakTimer, setShowBreakTimer] = useState(false);

  useEffect(() => {
    let interval;
    if (showBreakTimer && breakTimer > 0) {
      interval = setInterval(() => {
        setBreakTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showBreakTimer, breakTimer]);

  const getTopicDisplayName = (topic) => {
    return topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProgressSummary = (progress, topic) => {
    const summaries = {
      'euclidean': [
        'Understanding what GCD (Greatest Common Divisor) means',
        'Recognizing the pattern: GCD(a,b) = GCD(b, a%b)',
        'Grasping why the algorithm terminates (base case)',
        'Connecting the math to practical coding implementation',
        'Seeing real-world applications in cryptography and fractions'
      ],
      'binary_search': [
        'Understanding the divide-and-conquer strategy',
        'Recognizing why the array must be sorted first',
        'Grasping the midpoint calculation logic',
        'Understanding how bounds narrow with each step',
        'Connecting to O(log n) time complexity'
      ]
    };

    const topicSummary = summaries[topic] || ['Key algorithmic concepts', 'Problem-solving strategies', 'Implementation techniques'];
    return topicSummary.slice(0, progress.length + 2); // Show learned concepts + a bit more
  };

  const getEncouragingMessage = (sessionDuration, progress) => {
    const messages = [
      "Your brain just did some serious work! 🧠💪",
      "These concepts will stick better after a break! 🌱",
      "Quality thinking takes time - you're doing great! ⭐",
      "Deep learning happens during rest periods! 💭",
      "Your future self will thank you for this solid foundation! 🚀"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const startBreakTimer = () => {
    setShowBreakTimer(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="break-screen">
      <div className="break-container">
        <div className="melted-ice-cream">
          <svg width="100" height="60" viewBox="0 0 100 60">
            <ellipse cx="50" cy="45" rx="35" ry="8" fill="#E6E6FA" opacity="0.8" />
            <ellipse cx="50" cy="42" rx="25" ry="5" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="50" cy="40" rx="15" ry="3" fill="#FFFFFF" opacity="0.4" />
          </svg>
        </div>

        <h1 className="break-title">🍦 Ice Cream Melted!</h1>
        <h2 className="break-subtitle">Time for a brain break! 🧠💤</h2>

        <div className="session-summary">
          <h3>Here's what you discovered in {Math.round(sessionDuration)} minutes:</h3>
          
          <div className="progress-list">
            {getProgressSummary(progress, topic).map((concept, index) => (
              <div key={index} className={`progress-item ${index < progress.length ? 'completed' : 'partial'}`}>
                <span className="progress-icon">
                  {index < progress.length ? '✅' : '🔄'}
                </span>
                <span className="progress-text">{concept}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="encouragement-message">
          <p>{getEncouragingMessage(sessionDuration, progress)}</p>
          <p>Learning <strong>{getTopicDisplayName(topic)}</strong> requires your brain to form new neural pathways. A short break helps consolidate these connections!</p>
        </div>

        <div className="break-actions">
          {!showBreakTimer ? (
            <>
              <button 
                className="action-button primary"
                onClick={startBreakTimer}
              >
                Take Recommended Break (5 min) ⏰
              </button>
              
              <button 
                className="action-button secondary"
                onClick={onNewSession}
              >
                New Fresh 🍦 (Continue Learning)
              </button>
              
              <button 
                className="action-button tertiary"
                onClick={onBackToHome}
              >
                Back to Topics
              </button>
            </>
          ) : (
            <div className="break-timer-container">
              <div className="break-timer">
                <h3>Break Time Remaining</h3>
                <div className="timer-display-large">
                  {formatTime(breakTimer)}
                </div>
                
                {breakTimer > 0 ? (
                  <p>Relax, stretch, hydrate! Your brain is processing... 🧘‍♀️</p>
                ) : (
                  <div className="break-complete">
                    <p>Break complete! Ready for a fresh ice cream? 🍦</p>
                    <button 
                      className="action-button primary"
                      onClick={onNewSession}
                    >
                      Start New Session
                    </button>
                  </div>
                )}
              </div>
              
              {breakTimer > 0 && (
                <button 
                  className="action-button secondary small"
                  onClick={onNewSession}
                >
                  Skip Break (Start Learning Now)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="break-tips">
          <h4>💡 Break Tips:</h4>
          <ul>
            <li>💧 Drink some water</li>
            <li>🚶‍♀️ Take a short walk</li>
            <li>👀 Look away from the screen</li>
            <li>🧘‍♂️ Do some deep breathing</li>
            <li>🎵 Listen to music</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BreakScreen;