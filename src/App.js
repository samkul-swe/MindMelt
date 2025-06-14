// App.js - Updated with MindMelt Branding and Ice Cream Timer
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, Sparkles, Clock, Play, Pause, RotateCcw, RefreshCw, Lightbulb, CheckCircle, MessageCircle, User, Bot } from 'lucide-react';
import { getSocraticResponse } from './openaiAPI';
import './App.css';

// Specific CS Concepts from Different Domains for Deep Learning
const csFundamentals = {
  // Programming Fundamentals - The Foundation
  variables: {
    name: "Variables & Memory",
    description: "How computers store and manage data",
    icon: "📦",
    category: "Programming Basics",
    difficulty: "Beginner",
    details: {
      concept: "Variables are named containers that hold data in computer memory. Understanding how data is stored, accessed, and modified is fundamental to all programming.",
      whyImportant: "Every program manipulates data. Without understanding variables and memory, you can't understand how any software works.",
      buildingBlocks: [
        "What happens when you write: int x = 5",
        "Stack vs Heap memory allocation", 
        "Pass by value vs pass by reference",
        "Memory addresses and pointers",
        "Variable scope and lifetime"
      ],
      realWorldConnection: "When you save a file, change your profile picture, or add items to a shopping cart - all involve variables storing and updating data in memory.",
      nextSteps: ["Control Flow", "Functions", "Data Structures"]
    }
  },

  controlFlow: {
    name: "Control Flow",
    description: "How programs make decisions and repeat actions",
    icon: "🔀",
    category: "Programming Basics", 
    difficulty: "Beginner",
    details: {
      concept: "Control flow determines the order in which instructions execute. Programs aren't just linear lists - they branch, loop, and jump based on conditions.",
      whyImportant: "This is how computers make decisions and automate repetitive tasks. Every algorithm depends on control flow.",
      buildingBlocks: [
        "If-else statements: making decisions",
        "Loops: for, while, do-while patterns",
        "Break and continue: controlling loop execution",
        "Switch statements: multiple choice decisions",
        "Function calls: jumping to different code sections"
      ],
      realWorldConnection: "When Netflix recommends movies (if-else), processes your entire playlist (loops), or handles user authentication (nested conditions).",
      nextSteps: ["Functions", "Algorithms", "Data Structures"]
    }
  },

  functions: {
    name: "Functions & Abstraction",
    description: "Breaking complex problems into smaller pieces",
    icon: "🔧",
    category: "Programming Basics",
    difficulty: "Beginner", 
    details: {
      concept: "Functions are reusable blocks of code that perform specific tasks. They're the building blocks that let us create complex programs from simple parts.",
      whyImportant: "Functions enable code reuse, testing, debugging, and team collaboration. Every major software system is built with functions.",
      buildingBlocks: [
        "Function definition vs function call",
        "Parameters and arguments: passing data in",
        "Return values: getting results back",
        "Local vs global scope",
        "Recursion: functions calling themselves"
      ],
      realWorldConnection: "Like a recipe that you can use multiple times, or a calculator function you can call whenever you need to add numbers.",
      nextSteps: ["Data Structures", "Algorithms", "Object-Oriented Programming"]
    }
  },

  // Data Structures - How We Organize Information
  arrays: {
    name: "Arrays & Lists",
    description: "Storing multiple items in order",
    icon: "📋",
    category: "Data Structures",
    difficulty: "Beginner",
    details: {
      concept: "Arrays store multiple values of the same type in a single variable, accessible by index. They're the simplest way to organize related data.",
      whyImportant: "Arrays are everywhere - your contacts list, game scores, pixels in an image. Understanding arrays is essential for handling collections of data.",
      buildingBlocks: [
        "Array indexing: accessing elements by position",
        "Array operations: insert, delete, search, update",
        "Static vs dynamic arrays",
        "Array iteration: processing all elements",
        "Multi-dimensional arrays: arrays of arrays"
      ],
      realWorldConnection: "Your photo gallery (array of images), music playlist (array of songs), or shopping cart (array of items).",
      nextSteps: ["Linked Lists", "Stacks & Queues", "Hash Tables"]
    }
  },

  // Algorithms - Step-by-Step Problem Solving  
  searching: {
    name: "Search Algorithms",
    description: "Finding specific items in collections of data",
    icon: "🔍", 
    category: "Algorithms",
    difficulty: "Beginner",
    details: {
      concept: "Search algorithms help us find specific items in collections of data. Different approaches work better for different types of data organization.",
      whyImportant: "Every time you search Google, find a contact, or look up a word in a dictionary, search algorithms are working behind the scenes.",
      buildingBlocks: [
        "Linear search: checking each item one by one",
        "Binary search: divide and conquer in sorted data", 
        "When to use which search method",
        "Time complexity: why some searches are faster",
        "Search in different data structures"
      ],
      realWorldConnection: "Finding a book in a library, searching for a friend on social media, or autocomplete in your browser's address bar.",
      nextSteps: ["Sorting Algorithms", "Hash Tables", "Tree Traversal"]
    }
  },

  sorting: {
    name: "Sorting Algorithms", 
    description: "Arranging data in meaningful order",
    icon: "📊",
    category: "Algorithms",
    difficulty: "Beginner",
    details: {
      concept: "Sorting algorithms arrange data in a specific order (ascending, descending, or custom). Sorted data enables faster searching and better organization.",
      whyImportant: "Sorting makes data useful. Leaderboards, alphabetical lists, chronological feeds - sorted data is easier to search, analyze, and understand.",
      buildingBlocks: [
        "Bubble sort: simple swapping method",
        "Selection sort: finding and placing minimums",
        "Insertion sort: building sorted portion gradually",
        "Why different sorts perform differently",
        "Stable vs unstable sorting"
      ],
      realWorldConnection: "Organizing your email by date, ranking search results by relevance, or arranging products by price on an e-commerce site.",
      nextSteps: ["Advanced Sorting", "Search Algorithms", "Algorithm Analysis"]
    }
  },

  // Computer Systems - How Hardware and Software Connect
  binaryNumbers: {
    name: "Binary & Number Systems",
    description: "How computers represent all information as 0s and 1s", 
    icon: "🔢",
    category: "Computer Systems",
    difficulty: "Beginner",
    details: {
      concept: "Computers only understand binary (0s and 1s). All data - numbers, text, images, videos - gets converted to binary for processing and storage.",
      whyImportant: "Binary is the foundation of all computing. Understanding it helps you grasp how computers actually work at the most basic level.", 
      buildingBlocks: [
        "Why computers use binary instead of decimal",
        "Converting between binary, decimal, and hexadecimal",
        "How text gets encoded (ASCII, Unicode)",
        "Representing negative numbers (two's complement)",
        "Binary arithmetic: addition, subtraction"
      ],
      realWorldConnection: "Every photo pixel, every character you type, every song you stream - all stored as patterns of 0s and 1s in computer memory.",
      nextSteps: ["Computer Architecture", "Data Representation", "Digital Logic"]
    }
  },

  // Networks - How Computers Communicate
  internetBasics: {
    name: "How the Internet Works",
    description: "The basic idea of connected computers sharing information",
    icon: "🌐", 
    category: "Networking",
    difficulty: "Beginner",
    details: {
      concept: "The internet is a network of networks - millions of computers connected together, following agreed-upon rules to share information.",
      whyImportant: "Understanding internet basics helps you grasp how websites work, why some connections are slow, and how data travels around the world.",
      buildingBlocks: [
        "What happens when you visit a website",
        "IP addresses: unique identifiers for computers",
        "Domain names: human-readable addresses", 
        "Routers and paths: how data finds its destination",
        "Packets: breaking data into small pieces"
      ],
      realWorldConnection: "Every time you send a message, stream a video, or browse social media, data packets are traveling across the internet infrastructure.",
      nextSteps: ["HTTP Protocol", "DNS", "Network Security"]
    }
  },

  // Databases - Organizing and Storing Information
  whatIsDatabase: {
    name: "What is a Database?",
    description: "Organized way to store and retrieve large amounts of information",
    icon: "🗄️",
    category: "Databases", 
    difficulty: "Beginner",
    details: {
      concept: "A database is an organized collection of data that can be easily accessed, managed, and updated. It's like a digital filing cabinet with powerful search capabilities.",
      whyImportant: "Almost every application you use - social media, banking, shopping, gaming - relies on databases to store and retrieve information quickly and reliably.",
      buildingBlocks: [
        "Tables, rows, and columns: organizing data",
        "Primary keys: unique identifiers for records", 
        "Relationships: how different tables connect",
        "Queries: asking questions of your data",
        "CRUD operations: Create, Read, Update, Delete"
      ],
      realWorldConnection: "Your contact list, banking records, social media posts, and online shopping history are all stored in databases.",
      nextSteps: ["SQL Basics", "Database Design", "Data Relationships"]
    }
  },

  // Software Engineering - Building Reliable Programs
  debugging: {
    name: "Debugging & Problem Solving",
    description: "Finding and fixing problems in code systematically",
    icon: "🐛",
    category: "Software Engineering",
    difficulty: "Beginner", 
    details: {
      concept: "Debugging is the systematic process of finding and fixing errors in code. It's detective work - gathering clues, forming hypotheses, and testing solutions.",
      whyImportant: "All code has bugs. Professional developers spend significant time debugging. Learning to debug effectively makes you a much more productive programmer.",
      buildingBlocks: [
        "Types of errors: syntax, logic, and runtime",
        "Reading error messages: what they're trying to tell you",
        "Using print statements to trace execution", 
        "Debugger tools: stepping through code line by line",
        "Rubber duck debugging: explaining your problem out loud"
      ],
      realWorldConnection: "When an app crashes, a website loads slowly, or a feature doesn't work as expected - debugging skills help identify and fix these issues.",
      nextSteps: ["Testing", "Code Review", "Version Control"]
    }
  }
};

const learningPaths = {
  conceptual: { 
    name: "Conceptual Track", 
    description: "Deep understanding of core concepts - focus on the 'why'",
    icon: "🧠"
  },
  applied: { 
    name: "Applied Track", 
    description: "Practical implementation and real-world examples",
    icon: "⚡"
  },
  comprehensive: { 
    name: "Comprehensive Track", 
    description: "Complete mastery with theory and practice combined",
    icon: "🎯"
  }
};

const questioningStyles = {
  socratic: { 
    name: "Socratic Method", 
    description: "Guided discovery through strategic questions",
    icon: "💭"
  },
  scenario: { 
    name: "Scenario-Based", 
    description: "Real-world problem scenarios and use cases",
    icon: "🌍"
  },
  puzzle: { 
    name: "Puzzle & Brain Teaser", 
    description: "Challenge-based learning with problem solving",
    icon: "🧩"
  },
  analogy: { 
    name: "Analogy & Metaphor", 
    description: "Learn through comparisons and analogies",
    icon: "🔗"
  }
};

function App() {
  const [step, setStep] = useState('concept');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicDetails, setShowTopicDetails] = useState(false);
  const [detailsTopic, setDetailsTopic] = useState(null);
  const [learningPath, setLearningPath] = useState('');
  const [questioningStyle, setQuestioningStyle] = useState('');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(8 * 60); // Start with 8 minutes (attention span)
  const [maxTime, setMaxTime] = useState(8 * 60); // Track max time for ice cream
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [progress, setProgress] = useState([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyLoaded, setIsApiKeyLoaded] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [apiKeySource, setApiKeySource] = useState('');
  const messageEndRef = useRef(null);

  // Ice Cream Timer Component with Canvas
  const IceCreamTimer = ({ timeLeft, totalTime, isRunning }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const dripsRef = useRef([]);
    
    const percentage = (timeLeft / totalTime) * 100;
    const meltLevel = (100 - percentage) / 100;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      // Set up high-DPI canvas
      canvas.width = 60 * dpr;
      canvas.height = 80 * dpr;
      canvas.style.width = '60px';
      canvas.style.height = '80px';
      ctx.scale(dpr, dpr);

      // Drip class for physics simulation
      class Drip {
        constructor(x, y, color, size = 1.5) {
          this.x = x;
          this.y = y;
          this.originalY = y;
          this.color = color;
          this.size = size;
          this.speed = Math.random() * 0.4 + 0.2;
          this.opacity = 0.8;
          this.life = 1.0;
        }

        update() {
          this.y += this.speed;
          this.speed += 0.015; // gravity
          this.life -= 0.006;
          this.opacity = Math.max(0, this.life * 0.8);
          
          // Reset drip when it falls too far
          if (this.y > 75 || this.life <= 0) {
            this.y = this.originalY;
            this.life = 1.0;
            this.opacity = 0.8;
            this.speed = Math.random() * 0.4 + 0.2;
          }
        }

        draw(ctx) {
          if (this.opacity <= 0) return;
          
          ctx.save();
          ctx.globalAlpha = this.opacity;
          
          // Draw teardrop shape
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add small tail
          ctx.beginPath();
          ctx.ellipse(this.x, this.y - this.size, this.size * 0.3, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      }

      // Initialize drips based on melt level
      const updateDrips = () => {
        const targetDripCount = Math.floor(meltLevel * 6);
        
        while (dripsRef.current.length < targetDripCount) {
          const colors = ['#fbbf24', '#f59e0b', '#f97316', '#ec4899'];
          dripsRef.current.push(new Drip(
            15 + Math.random() * 30,
            32 + Math.random() * 8,
            colors[Math.floor(Math.random() * colors.length)],
            1 + Math.random() * 1.5
          ));
        }
        
        dripsRef.current = dripsRef.current.slice(0, targetDripCount);
      };

      const drawIceCream = () => {
        ctx.clearRect(0, 0, 60, 80);
        
        // Draw cone
        const coneGradient = ctx.createLinearGradient(0, 40, 0, 70);
        coneGradient.addColorStop(0, '#d97706');
        coneGradient.addColorStop(1, '#92400e');
        
        ctx.fillStyle = coneGradient;
        ctx.beginPath();
        ctx.moveTo(18, 40);
        ctx.lineTo(42, 40);
        ctx.lineTo(30, 70);
        ctx.closePath();
        ctx.fill();
        
        // Draw waffle pattern on cone
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
          const y = 45 + i * 6;
          ctx.beginPath();
          ctx.moveTo(20 + i * 1.5, y);
          ctx.lineTo(40 - i * 1.5, y);
          ctx.stroke();
        }

        // Calculate ice cream deformation based on melt level
        const meltSag = meltLevel * 10;
        
        // Draw ice cream scoops with melting effect
        const drawMeltingScoop = (centerX, centerY, radius, color, meltAmount) => {
          const gradient = ctx.createRadialGradient(centerX - 3, centerY - 3, 0, centerX, centerY, radius);
          gradient.addColorStop(0, color.light);
          gradient.addColorStop(1, color.dark);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          
          // Create melting shape using bezier curves
          const points = [];
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            const x = centerX + Math.cos(angle) * radius;
            let y = centerY + Math.sin(angle) * radius;
            
            // Add melting deformation
            if (angle > Math.PI * 0.3 && angle < Math.PI * 1.7) {
              y += meltAmount * (Math.sin(angle) + 1) * 2;
            }
            
            points.push({ x, y });
          }
          
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) * 0.3;
            const cp1y = points[i - 1].y + (points[i].y - points[i - 1].y) * 0.3;
            const cp2x = points[i].x - (points[i].x - points[i - 1].x) * 0.3;
            const cp2y = points[i].y - (points[i].y - points[i - 1].y) * 0.3;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
          }
          ctx.closePath();
          ctx.fill();
          
          // Add highlight
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * (1 - meltAmount)})`;
          ctx.beginPath();
          ctx.arc(centerX - 2, centerY - 2, radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        };

        // Draw scoops (bottom to top)
        if (percentage > 10) {
          drawMeltingScoop(30, 32 + meltSag, 13, 
            { light: '#fef3c7', dark: '#f59e0b' }, meltLevel);
        }
        
        if (percentage > 40) {
          drawMeltingScoop(30, 22 + meltSag * 0.7, 11, 
            { light: '#fce7f3', dark: '#ec4899' }, meltLevel * 0.8);
        }
        
        if (percentage > 70) {
          drawMeltingScoop(30, 14 + meltSag * 0.5, 9, 
            { light: '#fed7aa', dark: '#ea580c' }, meltLevel * 0.6);
        }

        // Update and draw drips
        updateDrips();
        dripsRef.current.forEach(drip => {
          if (isRunning) drip.update();
          drip.draw(ctx);
        });

        // Draw puddle at bottom when heavily melted
        if (meltLevel > 0.7) {
          const puddleGradient = ctx.createRadialGradient(30, 75, 0, 30, 75, 15);
          puddleGradient.addColorStop(0, `rgba(251, 191, 36, ${meltLevel * 0.6})`);
          puddleGradient.addColorStop(1, `rgba(251, 191, 36, 0)`);
          
          ctx.fillStyle = puddleGradient;
          ctx.beginPath();
          ctx.ellipse(30, 75, 15 * meltLevel, 3 * meltLevel, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      const animate = () => {
        drawIceCream();
        if (isRunning || dripsRef.current.length > 0) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [percentage, meltLevel, isRunning]);

    return (
      <canvas 
        ref={canvasRef}
        className="ice-cream-canvas"
        style={{ imageRendering: 'crisp-edges' }}
      />
    );
  };

  // Show topic details modal
  const showDetails = (topicKey) => {
    setDetailsTopic(csFundamentals[topicKey]);
    setShowTopicDetails(true);
  };

  // Topic Details Modal Component
  const TopicDetailsModal = ({ topic, onClose }) => {
    if (!topic) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              <span className="modal-icon">{topic.icon}</span>
              <div>
                <h2>{topic.name}</h2>
                <div className="modal-badges">
                  <span className="category-badge">{topic.category}</span>
                  <span className="difficulty-badge">{topic.difficulty}</span>
                </div>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          
          <div className="modal-body">
            <div className="detail-section">
              <h3>🎯 What is it?</h3>
              <p>{topic.details.concept}</p>
            </div>
            
            <div className="detail-section">
              <h3>💡 Why is it important?</h3>
              <p>{topic.details.whyImportant}</p>
            </div>
            
            <div className="detail-section">
              <h3>🏗️ Key Building Blocks</h3>
              <ul>
                {topic.details.buildingBlocks.map((block, index) => (
                  <li key={index}>{block}</li>
                ))}
              </ul>
            </div>
            
            <div className="detail-section">
              <h3>🌍 Real-World Connection</h3>
              <p>{topic.details.realWorldConnection}</p>
            </div>
            
            <div className="detail-section">
              <h3>🚀 Next Steps</h3>
              <div className="next-steps">
                {topic.details.nextSteps.map((step, index) => (
                  <span key={index} className="next-step-chip">{step}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              onClick={() => {
                setSelectedTopic(Object.keys(csFundamentals).find(key => csFundamentals[key] === topic));
                onClose();
              }}
              className="btn btn-primary"
            >
              Select This Topic
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Timer effect
  useEffect(() => {
    if (timerActive && !timerPaused && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            clearInterval(interval);
            // Time's up! Ice cream melted
            setMessages(prev => [...prev, {
              type: 'bot',
              content: "🍦💧 Time's up! Your ice cream has melted. Take a break and come back when you're ready to refreeze your focus!",
              timestamp: new Date(),
              isTimeUp: true
            }]);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timerPaused, timeRemaining]);

  // Auto-scroll messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load API key from environment variable OR localStorage on component mount
  useEffect(() => {
    console.log('=== API KEY LOADING ===');
    
    const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    console.log('Environment API key available:', !!envApiKey);
    console.log('Environment API key length:', envApiKey?.length);
    
    const savedApiKey = localStorage.getItem('mindmelt_openai_key');
    console.log('Saved API key available:', !!savedApiKey);
    console.log('Saved API key length:', savedApiKey?.length);
    
    let finalKey = null;
    let source = '';
    
    if (envApiKey && envApiKey.trim() && envApiKey !== 'undefined') {
      finalKey = envApiKey.trim();
      source = 'environment';
    } else if (savedApiKey && savedApiKey.trim() && savedApiKey !== 'null' && savedApiKey !== 'undefined') {
      finalKey = savedApiKey.trim();
      source = 'localStorage';
    }
    
    if (finalKey) {
      setApiKey(finalKey);
      setApiKeySource(source);
      console.log('Using API key from:', source);
      console.log('Final API key length:', finalKey.length);
    } else {
      console.log('No API key found in environment or localStorage');
      setApiKeySource('none');
    }
    
    setIsApiKeyLoaded(true);
    console.log('=== END API KEY LOADING ===');
  }, []);

  // Save API key to localStorage
  const saveApiKey = (key) => {
    console.log('=== SAVING API KEY ===');
    console.log('Key to save length:', key?.length);
    
    try {
      localStorage.setItem('mindmelt_openai_key', key);
      console.log('Key saved to localStorage successfully');
      
      const verification = localStorage.getItem('mindmelt_openai_key');
      console.log('Verification - key exists after save:', !!verification);
      
      setApiKey(key);
      setApiKeySource('localStorage');
      console.log('Key set in React state');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Clear API key from localStorage
  const clearApiKey = () => {
    localStorage.removeItem('mindmelt_openai_key');
    
    const envKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (envKey && envKey.trim() && envKey !== 'undefined') {
      setApiKey(envKey.trim());
      setApiKeySource('environment');
    } else {
      setApiKey('');
      setApiKeySource('none');
      setShowApiSetup(true);
    }
  };

  // Get current API key from all sources
  const getCurrentApiKey = () => {
    return apiKey || 
           process.env.REACT_APP_OPENAI_API_KEY || 
           localStorage.getItem('mindmelt_openai_key') || 
           null;
  };

  // Get API key status for display
  const getApiKeyStatus = () => {
    const envKey = process.env.REACT_APP_OPENAI_API_KEY;
    const savedKey = localStorage.getItem('mindmelt_openai_key');
    
    if (envKey && envKey.trim() && envKey !== 'undefined') {
      return { 
        status: 'env', 
        message: '✅ API Key from Environment (.env file)',
        showChange: false
      };
    } else if (savedKey && savedKey.trim() && savedKey !== 'null' && savedKey !== 'undefined') {
      return { 
        status: 'saved', 
        message: '✅ API Key Configured (User Input)',
        showChange: true
      };
    } else {
      return { 
        status: 'missing', 
        message: '⚠️ API Key Required',
        showChange: false
      };
    }
  };

  // Increase timer on good progress (simulate ice cream "refreezing")
  const increaseTimer = () => {
    const newTime = Math.min(maxTime + 180, 25 * 60); // Add 3 minutes, max 25 minutes
    setMaxTime(newTime);
    setTimeRemaining(prev => Math.min(prev + 180, newTime));
    setCorrectStreak(prev => prev + 1);
  };

  const handleStart = () => {
    const finalApiKey = getCurrentApiKey();
    
    console.log('=== HANDLE START DEBUG ===');
    console.log('Current apiKey state:', !!apiKey);
    console.log('Environment key:', !!process.env.REACT_APP_OPENAI_API_KEY);
    console.log('LocalStorage key:', !!localStorage.getItem('mindmelt_openai_key'));
    console.log('Final API key available:', !!finalApiKey);
    
    if (!finalApiKey) {
      console.log('No API key found, showing setup modal');
      setShowApiSetup(true);
      return;
    }
    
    if (!apiKey && finalApiKey) {
      setApiKey(finalApiKey);
      
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        setApiKeySource('environment');
      } else {
        setApiKeySource('localStorage');
      }
    }
    
    setStep('learning');
    setTimerActive(true);
    
    // Get the selected topic details
    const topicDetails = csFundamentals[selectedTopic];
    const welcome = `🧠 Welcome to **MindMelt**! You've selected **${topicDetails.name}** with **${learningPaths[learningPath].name}** approach using **${questioningStyles[questioningStyle].name}** style.\n\n🍦 **Your Ice Cream Timer:** Watch your ice cream melt as time passes! Answer well to refreeze it and gain more focus time.\n\n**Topic Focus:** ${topicDetails.description}\n\nI'm your Socratic tutor - I'll guide you to discover the answer through thoughtful questions rather than giving direct answers. Let's begin exploring ${topicDetails.name} before your ice cream melts!`;
    
    setMessages([{ 
      type: 'bot', 
      content: welcome, 
      timestamp: new Date(),
      isWelcome: true 
    }]);
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || isThinking || timeRemaining <= 0) return;
    
    const currentApiKey = getCurrentApiKey();
    
    console.log('=== HANDLE SUBMIT DEBUG ===');
    console.log('API Key from state:', !!apiKey);
    console.log('API Key from getCurrentApiKey():', !!currentApiKey);
    console.log('Final key to use:', !!currentApiKey);
    
    setIsThinking(true);
    const userMessage = { 
      type: 'user', 
      content: userInput, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Use the topic name instead of user concept
      const topicName = csFundamentals[selectedTopic].name;
      const botReply = await getSocraticResponse(
        topicName, 
        userInput, 
        learningPath, 
        questioningStyle,
        currentApiKey
      );
      
      const botMessage = { 
        type: 'bot', 
        content: botReply, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, botMessage]);
      setProgress(prev => [...prev, { 
        question: userInput, 
        answer: botReply, 
        timestamp: new Date() 
      }]);

      // Simulate good answer detection and ice cream "refreezing"
      // In a real implementation, you'd analyze the quality of the conversation
      if (userInput.length > 30 && progress.length % 3 === 2) {
        increaseTimer();
        setMessages(prev => [...prev, {
          type: 'bot',
          content: "🍦✨ Great progress! Your ice cream is refreezing - you've earned more focus time!",
          timestamp: new Date(),
          isBonus: true
        }]);
      }
      
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      const errorMessage = {
        type: 'bot',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setUserInput('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setStep('concept');
    setMessages([]);
    setProgress([]);
    setTimeRemaining(8 * 60);
    setMaxTime(8 * 60);
    setTimerActive(false);
    setTimerPaused(false);
    setUserInput('');
    setCorrectStreak(0);
    setShowTopicDetails(false);
    setDetailsTopic(null);
  };

  // API Key Setup Modal
  if (showApiSetup) {
    const handleSaveApiKey = () => {
      if (tempApiKey.trim()) {
        saveApiKey(tempApiKey.trim());
        setShowApiSetup(false);
        setTempApiKey('');
        if (step === 'concept' && selectedTopic && learningPath && questioningStyle) {
          handleStart();
        }
      }
    };

    return (
      <div className="app-container">
        <div className="setup-modal">
          <div className="setup-content">
            <h2>🔑 API Key Setup</h2>
            <p>To use the MindMelt Socratic AI tutor, you need an OpenAI API key.</p>
            
            {process.env.REACT_APP_OPENAI_API_KEY ? (
              <div style={{ background: '#e8f5e8', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>📝 Note:</strong> You have an API key in your .env file, but it seems there might be an issue with it. 
                You can override it by entering a new key below.
              </div>
            ) : (
              <div style={{ background: '#f0f8ff', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>💡 Tip:</strong> For development, you can also add <code>REACT_APP_OPENAI_API_KEY=your-key</code> to your .env file 
                instead of entering it here each time.
              </div>
            )}
            
            <div className="setup-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div>
                  <strong>Get your API key</strong>
                  <p>Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a></p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div>
                  <strong>Create an account & get key</strong>
                  <p>Sign up and create a new API key</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div>
                  <strong>Enter your key below</strong>
                  <p>Your key will be saved locally and securely</p>
                </div>
              </div>
            </div>

            <input
              type="password"
              placeholder="sk-..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="api-key-input"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
            
            <div className="setup-actions">
              <button 
                onClick={() => {
                  setShowApiSetup(false);
                  setTempApiKey('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
                className="btn btn-primary"
              >
                Save & Start MindMelt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Topic Selection Screen
  if (step === 'concept') {
    const apiStatus = getApiKeyStatus();
    
    return (
      <div className="app-container">
        <div className="setup-container">
          <div className="header">
            <div className="header-icon-container">
              <Brain className="header-icon" />
            </div>
            <h1>MindMelt</h1>
            <p className="main-tagline">Master computer science concepts through adaptive questioning</p>
            <p className="sub-tagline">🧠 Train your brain before your ice cream melts! 🍦</p>
            <p className="description">Explore core concepts from Operating Systems, Databases, Networks, Software Engineering, and Computer Architecture</p>
            
            {isApiKeyLoaded && (
              <div className="api-status">
                {apiStatus.status === 'missing' ? (
                  <div className="api-status-missing">
                    {apiStatus.message}
                  </div>
                ) : (
                  <div className="api-status-good">
                    {apiStatus.message}
                    {apiStatus.showChange && (
                      <button 
                        onClick={() => setShowApiSetup(true)}
                        className="change-key-btn"
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CS Fundamentals Selection */}
          <div className="form-section">
            <label className="form-label">
              <Lightbulb size={18} />
              Choose a CS Fundamental to Master (Bottom-Up Learning)
            </label>
            <div className="topics-grid">
              {Object.entries(csFundamentals).map(([key, topic]) => (
                <div key={key} className="topic-card-container">
                  <div
                    className={`option-card topic-card ${selectedTopic === key ? 'selected' : ''}`}
                    onClick={() => setSelectedTopic(key)}
                  >
                    <span className="option-icon">{topic.icon}</span>
                    <div className="topic-header">
                      <h3>{topic.name}</h3>
                      <div className="topic-meta">
                        <span className="category-pill" style={{
                          backgroundColor: 
                            topic.category === 'Programming Basics' ? '#e0f2fe' :
                            topic.category === 'Data Structures' ? '#f3e5f5' :
                            topic.category === 'Algorithms' ? '#e8f5e8' :
                            topic.category === 'Computer Systems' ? '#fff3e0' :
                            topic.category === 'Networking' ? '#e3f2fd' :
                            topic.category === 'Databases' ? '#fce4ec' :
                            '#f1f5f9'
                        }}>
                          {topic.category}
                        </span>
                      </div>
                    </div>
                    <p className="topic-description">{topic.description}</p>
                  </div>
                  <button 
                    className="details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      showDetails(key);
                    }}
                    title="View detailed breakdown"
                  >
                    <Lightbulb size={14} />
                    Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Choose your learning path</label>
            <div className="options-grid">
              {Object.entries(learningPaths).map(([key, path]) => (
                <div
                  key={key}
                  className={`option-card ${learningPath === key ? 'selected' : ''}`}
                  onClick={() => setLearningPath(key)}
                >
                  <span className="option-icon">{path.icon}</span>
                  <h3>{path.name}</h3>
                  <p>{path.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Choose questioning style</label>
            <div className="options-grid">
              {Object.entries(questioningStyles).map(([key, style]) => (
                <div
                  key={key}
                  className={`option-card ${questioningStyle === key ? 'selected' : ''}`}
                  onClick={() => setQuestioningStyle(key)}
                >
                  <span className="option-icon">{style.icon}</span>
                  <h3>{style.name}</h3>
                  <p>{style.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={handleStart}
            disabled={!selectedTopic || !learningPath || !questioningStyle}
          >
            <Sparkles size={20} />
            Start MindMelt Session 🍦
          </button>

          {/* Topic Details Modal */}
          {showTopicDetails && (
            <TopicDetailsModal 
              topic={detailsTopic} 
              onClose={() => setShowTopicDetails(false)} 
            />
          )}
        </div>
      </div>
    );
  }

  // Learning Session Screen
  return (
    <div className="app-container">
      <div className="learning-container">
        {/* Header */}
        <div className="learning-header">
          <div className="session-info">
            <h2>
              <Brain size={24} />
              MindMelt: {csFundamentals[selectedTopic]?.name}
            </h2>
            <div className="session-meta">
              <span className="path-badge">
                {learningPaths[learningPath].icon} {learningPaths[learningPath].name}
              </span>
              <span className="style-badge">
                {questioningStyles[questioningStyle].icon} {questioningStyles[questioningStyle].name}
              </span>
            </div>
          </div>
          
          <div className="timer-controls">
            <div className="ice-cream-timer-container">
              <IceCreamTimer 
                timeLeft={timeRemaining} 
                totalTime={maxTime} 
                isRunning={timerActive && !timerPaused} 
              />
              <div className="timer-info">
                <div className={`timer-display ${timeRemaining < 300 ? 'timer-warning' : ''}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="timer-label">
                  Focus Time • Max: {Math.floor(maxTime / 60)}min
                </div>
              </div>
            </div>
            
            <div className="timer-buttons">
              <button 
                onClick={() => setTimerPaused(!timerPaused)}
                className="timer-btn"
                title={timerPaused ? 'Resume' : 'Pause'}
              >
                {timerPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button 
                onClick={() => {
                  setTimeRemaining(maxTime);
                  setTimerActive(true);
                  setTimerPaused(false);
                }}
                className="timer-btn"
                title="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? (
                  <User size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>
              <div className="message-content">
                <div className={`message-bubble ${message.isWelcome ? 'welcome' : ''} ${message.isError ? 'error' : ''} ${message.isBonus ? 'bonus' : ''} ${message.isTimeUp ? 'time-up' : ''}`}>
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="message bot">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="thinking-bubble">
                  <div className="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  Thinking...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messageEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <input
              className="message-input"
              placeholder={timeRemaining <= 0 ? "Time's up! Your ice cream melted 🍦💧" : "Type your response..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={timeRemaining <= 0 || isThinking}
            />
            <button 
              className="send-btn"
              onClick={handleSubmit}
              disabled={timeRemaining <= 0 || isThinking || !userInput.trim()}
            >
              <MessageCircle size={20} />
            </button>
          </div>
          
          <div className="session-controls">
            <div className="progress-info">
              <CheckCircle size={16} className="progress-icon" />
              <span>{progress.length} exchanges • Streak: {correctStreak} 🔥</span>
            </div>
            
            <button
              onClick={resetSession}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw size={16} />
              New MindMelt
            </button>
            
            <button
              onClick={() => setShowApiSetup(true)}
              className="btn btn-secondary btn-sm"
              title="Change API Key"
            >
              🔑 API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;