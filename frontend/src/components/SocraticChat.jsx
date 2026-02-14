import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Brain, ArrowRight } from 'lucide-react';
import Button from './common/Button';
import api from '../services/api';
import '../styles/components/socratic-chat.css';

const SocraticChat = ({ userProjectId, phase = 'design', onComplete }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Start with AI's first question
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
    
    const starterQuestions = {
      design: "Before writing any code, let's think through the architecture. What are the main components you'd need for a todo list app?",
      debugging: "Your app is built! Let's test it together. Looking at your code, can you explain how you're generating unique IDs for todos?"
    };

    const starterMessage = {
      role: 'assistant',
      content: starterQuestions[phase] || starterQuestions.design,
      timestamp: new Date()
    };

    setMessages([starterMessage]);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

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
        {messages.length >= 6 && phase === 'design' && (
          <div className="phase-complete-prompt">
            <p>Ready to start implementing?</p>
            <Button
              variant="primary"
              size="medium"
              icon={<ArrowRight size={18} />}
              onClick={handleCompletePhase}
            >
              Start Implementation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocraticChat;