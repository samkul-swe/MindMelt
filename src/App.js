import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, Play, Pause } from 'lucide-react';
import './App.css';

const CSLearningApp = () => {
  const [currentScreen, setCurrentScreen] = useState('setup');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(8); // Starting attention span
  const [timeLeft, setTimeLeft] = useState(8 * 60); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const topics = [
    { id: 'queues', name: 'Queues', description: 'FIFO data structures and variations' },
    { id: 'binary-trees', name: 'Binary Trees', description: 'Tree structures and traversals' },
    { id: 'sorting', name: 'Sorting Algorithms', description: 'Comparison and non-comparison sorts' },
    { id: 'networking', name: 'TCP/IP Basics', description: 'Network protocols and communication' },
    { id: 'os', name: 'Process Management', description: 'Operating system process concepts' }
  ];

  const tracks = [
    { id: 'conceptual', name: 'Conceptual Track', description: 'Focus on the "why" - understanding core principles' },
    { id: 'applied', name: 'Applied Track', description: 'Focus on implementation and practical usage' },
    { id: 'comprehensive', name: 'Comprehensive Track', description: 'Everything theoretical - deep dive into all aspects' }
  ];

  const questionTypes = [
    { id: 'socratic', name: 'Socratic Method', description: 'Guided discovery through strategic questions' },
    { id: 'puzzle', name: 'Puzzle-Based', description: 'Problem-solving challenges and brain teasers' },
    { id: 'roleplay', name: 'Role-Play', description: 'Real-world scenarios and use cases' }
  ];

  // Sample questions based on topic, track, and difficulty
  const getQuestion = (topic, track, difficulty, questionType) => {
    const questions = {
      queues: {
        conceptual: {
          1: { q: "Why would you choose a queue data structure over a stack for a task scheduling system?", type: "explanation" },
          2: { q: "Explain the trade-offs between using an array-based queue versus a linked-list-based queue.", type: "explanation" },
          3: { q: "How does a priority queue differ conceptually from a regular queue, and when would you use each?", type: "explanation" },
          4: { q: "Analyze the impact of different queue implementations on system performance in high-concurrency scenarios.", type: "explanation" },
          5: { q: "Design a queue system that can handle both FIFO and priority-based processing with optimal space-time complexity.", type: "explanation" }
        },
        applied: {
          1: { q: "Write pseudocode to implement the basic enqueue operation for a simple queue.", type: "pseudocode" },
          2: { q: "Write pseudocode to implement a circular queue with fixed size, including handling overflow.", type: "pseudocode" },
          3: { q: "Write pseudocode for a priority queue implementation using a heap structure.", type: "pseudocode" },
          4: { q: "Implement a thread-safe queue in pseudocode with proper synchronization mechanisms.", type: "pseudocode" },
          5: { q: "Design and implement a distributed queue system in pseudocode that handles node failures gracefully.", type: "pseudocode" }
        },
        comprehensive: {
          1: { q: "Describe the queue data structure, its operations, and write pseudocode for enqueue and dequeue.", type: "mixed" },
          2: { q: "Explain different types of queues, their use cases, and implement a double-ended queue in pseudocode.", type: "mixed" },
          3: { q: "Analyze the time complexity of various queue implementations and design a thread-safe queue in pseudocode.", type: "mixed" },
          4: { q: "Compare queue implementations across different programming paradigms and implement a lock-free queue design.", type: "mixed" },
          5: { q: "Research and design a queue system for a distributed microservices architecture, including fault tolerance and scalability considerations.", type: "mixed" }
        }
      },
      'binary-trees': {
        conceptual: {
          1: { q: "Why are binary trees useful, and how do they differ from linear data structures like arrays?", type: "explanation" },
          2: { q: "Explain the difference between a binary tree and a binary search tree.", type: "explanation" },
          3: { q: "When would you choose a balanced binary tree over an unbalanced one?", type: "explanation" }
        },
        applied: {
          1: { q: "Write pseudocode to insert a node into a binary search tree.", type: "pseudocode" },
          2: { q: "Write pseudocode for in-order traversal of a binary tree.", type: "pseudocode" },
          3: { q: "Implement a function in pseudocode to check if a binary tree is balanced.", type: "pseudocode" }
        },
        comprehensive: {
          1: { q: "Explain binary tree concepts and write pseudocode for basic insertion and traversal.", type: "mixed" },
          2: { q: "Describe different tree traversal methods and implement them with complexity analysis.", type: "mixed" },
          3: { q: "Design a self-balancing binary search tree and analyze its performance characteristics.", type: "mixed" }
        }
      }
    };

    const topicQuestions = questions[topic];
    if (!topicQuestions) {
      return { q: `Sample question for ${topic} not yet available. This will be added in the full version.`, type: "explanation" };
    }

    const trackQuestions = topicQuestions[track];
    if (!trackQuestions) {
      return { q: `${track} questions for ${topic} not yet available.`, type: "explanation" };
    }

    return trackQuestions[difficulty] || { q: "Advanced question not yet available.", type: "explanation" };
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      alert("Time's up! Take a break and return when ready.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startLearning = () => {
    if (selectedTopic && selectedTrack && selectedQuestionType) {
      setCurrentScreen('learning');
      setCurrentQuestion(getQuestion(selectedTopic, selectedTrack, difficultyLevel, selectedQuestionType));
      setTimeLeft(timerMinutes * 60);
      setIsTimerRunning(true);
    }
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;

    // Simple mock assessment - in real app, this would use ChatGPT API
    const isCorrect = userAnswer.length > 20; // Mock: longer answers are "better"
    
    if (isCorrect) {
      setCorrectStreak(correctStreak + 1);
      setWrongCount(0);
      setFeedback("Great work! Your logic is sound. Moving to the next level.");
      
      // Increase difficulty and timer
      if (correctStreak + 1 >= 2) { // Every 2 correct answers
        setDifficultyLevel(Math.min(difficultyLevel + 1, 5));
        setTimerMinutes(Math.min(timerMinutes + 3, 25));
        setTimeLeft(Math.min((timerMinutes + 3) * 60, 25 * 60));
      }
    } else {
      setWrongCount(wrongCount + 1);
      setCorrectStreak(0);
      setFeedback("Not quite right. Think about the core logic step by step. Try again!");
    }

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (isCorrect) {
        setCurrentQuestion(getQuestion(selectedTopic, selectedTrack, difficultyLevel, selectedQuestionType));
      }
      setUserAnswer('');
    }, 3000);
  };

  const resetProgress = () => {
    setDifficultyLevel(1);
    setCorrectStreak(0);
    setWrongCount(0);
    setTimerMinutes(8);
    setTimeLeft(8 * 60);
    setCurrentQuestion(getQuestion(selectedTopic, selectedTrack, 1, selectedQuestionType));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentScreen === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-900 mb-2">CS Interview Prep</h1>
            <p className="text-orange-700">Master computer science concepts through adaptive questioning</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-orange-900 mb-6">Choose Your Topic</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTopic === topic.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold text-orange-900 mb-6">Choose Your Learning Track</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {tracks.map(track => (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTrack === track.id
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{track.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold text-orange-900 mb-6">Choose Question Type</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {questionTypes.map(type => (
                <div
                  key={type.id}
                  onClick={() => setSelectedQuestionType(type.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedQuestionType === type.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startLearning}
              disabled={!selectedTopic || !selectedTrack || !selectedQuestionType}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Start Learning Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with timer and progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">
                {topics.find(t => t.id === selectedTopic)?.name} - Level {difficultyLevel}
              </h1>
              <p className="text-orange-700">
                {tracks.find(t => t.id === selectedTrack)?.name} • {questionTypes.find(t => t.id === selectedQuestionType)?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-semibold">{correctStreak}</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle size={20} />
                <span className="font-semibold">{wrongCount}</span>
              </div>
              <button
                onClick={resetProgress}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* Ice Cream Timer */}
          <div className="flex items-center justify-between bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🍦</div>
              <div>
                <div className="font-semibold text-orange-900">Focus Timer</div>
                <div className="text-sm text-orange-700">Max: {timerMinutes} minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-orange-900">{formatTime(timeLeft)}</div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        </div>

        {/* Question Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Question:</h2>
          <p className="text-gray-800 mb-6 leading-relaxed">{currentQuestion?.q}</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer (Pseudocode/Explanation):
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Write your pseudocode or explanation here..."
              disabled={showFeedback}
            />
          </div>

          <button
            onClick={submitAnswer}
            disabled={!userAnswer.trim() || showFeedback}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-yellow-600 transition-all"
          >
            Submit Answer
          </button>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className={`rounded-xl shadow-lg p-6 mb-6 ${
            feedback.includes('Great') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              feedback.includes('Great') ? 'text-green-800' : 'text-red-800'
            }`}>
              Feedback:
            </h3>
            <p className={feedback.includes('Great') ? 'text-green-700' : 'text-red-700'}>
              {feedback}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentScreen('setup')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Setup
          </button>
          <div className="text-sm text-gray-600 flex items-center">
            Progress will reset if you change tracks mid-topic
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSLearningApp;