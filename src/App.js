import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import TopicSelection from './components/TopicSelection';
import ChatInterface from './components/ChatInterface';
import BreakScreen from './components/BreakScreen';
import './styles/App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing, topics, learning, break
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [learningStyle, setLearningStyle] = useState('conceptual');
  const [learningProgress, setLearningProgress] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const handleStartLearning = () => {
    setCurrentScreen('topics');
  };

  const handleTopicSelected = (topic, style) => {
    setSelectedTopic(topic);
    setLearningStyle(style);
    setCurrentScreen('learning');
    setSessionStartTime(new Date());
    setLearningProgress([]);
  };

  const handleIceCreamMelted = (progress) => {
    setLearningProgress(progress);
    setCurrentScreen('break');
  };

  const handleStartNewSession = () => {
    setCurrentScreen('topics');
    setLearningProgress([]);
    setSessionStartTime(null);
  };

  const handleBackToHome = () => {
    setCurrentScreen('landing');
    setSelectedTopic(null);
    setLearningProgress([]);
  };

  return (
    <div className="App">
      {currentScreen === 'landing' && (
        <LandingPage onStartLearning={handleStartLearning} />
      )}
      
      {currentScreen === 'topics' && (
        <TopicSelection 
          onTopicSelected={handleTopicSelected}
          onBack={handleBackToHome}
        />
      )}
      
      {currentScreen === 'learning' && (
        <ChatInterface
          topic={selectedTopic}
          learningStyle={learningStyle}
          onIceCreamMelted={handleIceCreamMelted}
          onProgressUpdate={setLearningProgress}
        />
      )}
      
      {currentScreen === 'break' && (
        <BreakScreen
          progress={learningProgress}
          topic={selectedTopic}
          sessionDuration={sessionStartTime ? (new Date() - sessionStartTime) / 1000 / 60 : 0}
          onNewSession={handleStartNewSession}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;