import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Brain, ArrowRight } from 'lucide-react';
import Button from './common/Button';
import api from '../services/api';
import '../styles/components/socratic-chat.css';

const SocraticChat = ({ 
  userProjectId, 
  phase = 'design', 
  onComplete,
  onComponentMentioned 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // Component keywords to detect
  const componentKeywords = ['App', 'AddTodo', 'TodoList', 'TodoItem', 'AsyncStorage'];

  useEffect(() => {
    if (!conversationStarted) {
      startConversation();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async () => {
    setConversationStarted(true);
    
    if (phase === 'debugging') {
      // For debugging phase, start by analyzing the code
      const debugIntro = {
        role: 'assistant',
        content: "Great work on implementing the app! Let's test it together to make sure everything works correctly. I'll walk you through some scenarios to check your code.",
        timestamp: new Date()
      };
      
      const firstBugScenario = {
        role: 'assistant',
        content: "Let's start with testing ID generation. Can you walk me through how you're creating unique IDs for each todo? Look at your addTodo function and explain your approach.",
        timestamp: new Date()
      };

      setMessages([debugIntro, firstBugScenario]);
    } else {
      // Design phase starter
      const starterMessage = {
        role: 'assistant',
        content: "Let's design the Todo List App together! Before writing any code, what are the main components you'd need? Think about user input, displaying todos, and individual todo items.",
        timestamp: new Date()
      };

      setMessages([starterMessage]);
    }
  };

  const detectComponents = (text) => {
    const detected = [];
    const lowerText = text.toLowerCase();
    
    componentKeywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        detected.push(keyword);
      }
    });

    return detected;
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Detect components in user's message
    const detectedComponents = detectComponents(inputMessage);
    if (detectedComponents.length > 0 && onComponentMentioned) {
      detectedComponents.forEach(comp => onComponentMentioned(comp));
    }

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Call API to get AI response
      const result = await api.sendSocraticMessage(userProjectId, inputMessage.trim());

      if (result.success) {
        const aiMessage = {
          role: 'assistant',
          content: result.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting. Could you try rephrasing your response?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePhase = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Check if enough progress for phase completion
  const canCompletePhase = () => {
    if (phase === 'design') {
      // Need at least 4 exchanges to complete design
      return messages.length >= 8;
    }
    if (phase === 'debugging') {
      // Need at least 3 exchanges to complete debugging
      return messages.length >= 6;
    }
    return false;
  };

  return (
    <div className="socratic-chat">
      {/* Messages Area */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'assistant' ? (
                <Brain size={24} />
              ) : (
                <div className="user-avatar">You</div>
              )}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Brain size={24} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your response..."
            className="chat-input"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            size="medium"
            icon={<Send size={18} />}
            disabled={!inputMessage.trim() || loading}
          >
            Send
          </Button>
        </form>

        {/* Phase Complete Button */}
        {canCompletePhase() && (
          <div className="phase-complete-prompt">
            <p>
              {phase === 'design' 
                ? '✅ Architecture design looks good! Ready to implement?'
                : '✅ Issues understood! Ready to complete?'}
            </p>
            <Button
              variant="primary"
              size="medium"
              icon={<ArrowRight size={18} />}
              onClick={handleCompletePhase}
            >
              {phase === 'design' ? 'Start Implementation' : 'Mark Project Complete'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocraticChat;