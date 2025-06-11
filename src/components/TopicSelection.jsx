import React, { useState } from 'react';

const TopicSelection = ({ onTopicSelected, onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('conceptual');

  const topics = [
    {
      id: 'euclidean',
      name: 'Euclidean Algorithm',
      description: 'Learn to find the Greatest Common Divisor (GCD) through discovery',
      difficulty: 'Beginner',
      icon: '🔢'
    },
    {
      id: 'binary_search',
      name: 'Binary Search',
      description: 'Master the divide-and-conquer approach to searching',
      difficulty: 'Beginner',
      icon: '🔍'
    }
  ];

  const learningStyles = [
    {
      id: 'conceptual',
      name: 'Conceptual Focus',
      description: 'Understand the "why" behind algorithms',
      icon: '🤔'
    },
    {
      id: 'applied',
      name: 'Applied Focus', 
      description: 'Focus on implementation and practical use',
      icon: '💻'
    },
    {
      id: 'both',
      name: 'Comprehensive',
      description: 'Theory, applications, and everything in between',
      icon: '🚀'
    }
  ];

  const handleStartLearning = () => {
    if (selectedTopic && selectedStyle) {
      onTopicSelected(selectedTopic, selectedStyle);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '10px' }}>
            🚀 Choose Your Learning Path
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Pick a topic and your preferred learning style
          </p>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '20px' }}>
            📚 Algorithm Topics
          </h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {topics.map(topic => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                style={{
                  border: selectedTopic === topic.id ? '3px solid #667eea' : '2px solid #eee',
                  borderRadius: '15px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: selectedTopic === topic.id ? '#f0f4ff' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '2rem' }}>{topic.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      {topic.name}
                    </h3>
                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                      {topic.description}
                    </p>
                    <span style={{
                      fontSize: '0.8rem',
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {topic.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '20px' }}>
            🎯 Learning Style
          </h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {learningStyles.map(style => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                style={{
                  border: selectedStyle === style.id ? '3px solid #667eea' : '2px solid #eee',
                  borderRadius: '15px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: selectedStyle === style.id ? '#f0f4ff' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      {style.name}
                    </h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                      {style.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: '2px solid #ccc',
              background: 'white',
              color: '#666',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back
          </button>
          
          <button
            onClick={handleStartLearning}
            disabled={!selectedTopic}
            style={{
              padding: '12px 32px',
              borderRadius: '25px',
              border: 'none',
              background: selectedTopic ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#ccc',
              color: 'white',
              cursor: selectedTopic ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Start Learning! 🍦
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;