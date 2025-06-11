import React, { useState, useEffect, useRef } from 'react';
import MeltingIceCream from './MeltingIceCream';
import { generateSocraticQuestion } from '../services/aiService';
import '../styles/ChatInterface.css';

const ChatInterface = ({ topic, learningStyle, onIceCreamMelted, onProgressUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conceptsLearned, setConceptsLearned] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize conversation
  useEffect(() => {
    const initMessage = {
      type: 'ai',
      content: getInitialQuestion(topic, learningStyle),
      timestamp: new Date()
    };
    setMessages([initMessage]);
  }, [topic, learningStyle]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after AI response
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const getInitialQuestion = (topic, style) => {
    const questions = {
      'euclidean': {
        'conceptual': "Let's explore the Euclidean algorithm together! 🤔 Imagine you have 12 apples and 8 oranges, and you want to arrange them in equal groups. What's the largest group size where you'd have no fruit left over?",
        'applied': "Ready to dive into the Euclidean algorithm? 💻 Let's start practical: if you were coding a function called gcd(12, 8), what do you think it should return?",
        'both': "Welcome to learning the Euclidean algorithm! 🚀 Let's begin with both theory and practice. What do you think 'greatest common divisor' means in your own words?"
      },
      'binary_search': {
        'conceptual': "Let's discover binary search! 📚 Imagine you're looking for a word in a dictionary. You wouldn't start from page 1, right? What strategy would you use?",
        'applied': "Time to learn binary search! 🔍 If you had a sorted array [1,3,5,7,9,11] and wanted to find the number 7, how would you approach it efficiently?",
        'both': "Binary search awaits! ⚡ Think about how you find a contact in your phone. Your contacts are sorted alphabetically - what's your natural strategy?"
      }
    };
    
    return questions[topic]?.[style] || "Let's start learning! What interests you most about this algorithm?";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Generate AI response
      const response = await generateSocraticQuestion({
        topic,
        learningStyle,
        conversationHistory: [...messages, userMessage],
        userResponse: inputValue.trim()
      });

      // Add AI response
      const aiMessage = {
        type: 'ai',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update learning progress
      if (response.conceptLearned) {
        const newConcept = response.conceptLearned;
        setConceptsLearned(prev => {
          if (!prev.includes(newConcept)) {
            const updated = [...prev, newConcept];
            onProgressUpdate(updated);
            return updated;
          }
          return prev;
        });
      }

    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback response
      const fallbackMessage = {
        type: 'ai',
        content: "That's interesting! Can you tell me more about your thinking? What made you arrive at that answer?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsLoading(false);
  };

  const handleIceCreamMelted = () => {
    onIceCreamMelted(conceptsLearned);
  };

  const handleWarning = () => {
    // Optional: Show subtle warning to user
    console.log("Ice cream is melting fast!");
  };

  // Prevent paste in input
  const handlePaste = (e) => {
    e.preventDefault();
    // Show message about no copy-paste
    const warningMessage = {
      type: 'system',
      content: "✋ No copy-paste allowed! SocraCode is about thinking through problems yourself. Type your own thoughts!",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, warningMessage]);
  };

  return (
    <div className="chat-interface">
      <MeltingIceCream 
        duration={15} // 15 minutes for demo, adjust as needed
        onMelted={handleIceCreamMelted}
        onWarning={handleWarning}
      />
      
      <div className="chat-header">
        <h2>🧠 Learning: {topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
        <div className="learning-style-badge">{learningStyle} approach</div>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            <div className="message-content">
              {message.type === 'ai' && <span className="ai-icon">🤖</span>}
              {message.type === 'system' && <span className="system-icon">⚠️</span>}
              <span className="message-text">{message.content}</span>
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">
              <span className="ai-icon">🤖</span>
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPaste={handlePaste}
            placeholder="Share your thoughts... (no copy-paste allowed!)"
            disabled={isLoading}
            className="message-input"
            autoComplete="off"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;