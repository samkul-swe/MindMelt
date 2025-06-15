// ============================================================================
// MindMelt Backend Server - Node.js/Express
// ============================================================================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mindmelt-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Add this debug route temporarily
app.get('/debug', (req, res) => {
  res.json({ 
    message: 'Debug route works!',
    timestamp: new Date().toISOString(),
    routes: 'Routes are being registered'
  });
});

console.log('✅ Debug route registered at /debug');

// In-memory storage (replace with real database in production)
const users = [
  {
    id: 1,
    email: 'demo@mindmelt.com',
    password: '$2b$10$iSyBhO4FIjOI6FXV6FdjWOwz9EZrc6jOt/d3qmYAHJfMREqRxdhF.', // 'demo123'
    name: 'Demo User',
    createdAt: new Date('2024-01-01'),
    sessionsCompleted: 12,
    totalQuestions: 156,
    averageScore: 78
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2b$10$8K1p/a0dclxKMI5Nq7t7.eKZpq1J9Hx4Qs0y5Nq7t7.eKZpq1J9Hx4Q', // 'password123'
    name: 'Test User',
    createdAt: new Date('2024-02-15'),
    sessionsCompleted: 5,
    totalQuestions: 67,
    averageScore: 85
  }
];

const sessions = [
  {
    id: 1,
    userId: 1,
    topicId: 'algorithms',
    topicName: 'Algorithms & Data Structures',
    difficulty: 'Intermediate',
    category: 'Computer Science',
    questionsAsked: 8,
    correctAnswers: 6,
    duration: 15,
    completed: true,
    createdAt: new Date('2024-12-01'),
    learningPath: 'structured'
  },
  {
    id: 2,
    userId: 1,
    topicId: 'systems',
    topicName: 'Operating Systems',
    difficulty: 'Advanced',
    category: 'Computer Science',
    questionsAsked: 5,
    correctAnswers: 4,
    duration: 12,
    completed: true,
    createdAt: new Date('2024-12-02'),
    learningPath: 'exploratory'
  }
];

// Computer Science topics
const topics = [
  {
    id: 'algorithms',
    name: 'Algorithms & Data Structures',
    description: 'Explore sorting algorithms, trees, graphs, and complexity analysis',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    icon: '🔢',
    estimatedTime: 15,
    subtopics: ['Sorting', 'Trees', 'Graphs', 'Dynamic Programming'],
    learningObjectives: [
      'Understand time and space complexity',
      'Master common sorting algorithms',
      'Navigate tree and graph structures',
      'Apply dynamic programming techniques'
    ]
  },
  {
    id: 'systems',
    name: 'Operating Systems',
    description: 'Dive into processes, threads, memory management, and file systems',
    category: 'Computer Science',
    difficulty: 'Advanced',
    icon: '💻',
    estimatedTime: 20,
    subtopics: ['Processes', 'Memory Management', 'File Systems', 'Concurrency'],
    learningObjectives: [
      'Understand process management',
      'Learn memory allocation strategies',
      'Master file system concepts',
      'Handle concurrency and synchronization'
    ]
  },
  {
    id: 'networks',
    name: 'Computer Networks',
    description: 'Master protocols, routing, and network security fundamentals',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    icon: '🌐',
    estimatedTime: 18,
    subtopics: ['TCP/IP', 'Routing', 'Security', 'Performance'],
    learningObjectives: [
      'Understand network protocols',
      'Learn routing algorithms',
      'Apply security principles',
      'Optimize network performance'
    ]
  },
  {
    id: 'databases',
    name: 'Database Systems',
    description: 'Explore SQL, NoSQL, transactions, and database design principles',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    icon: '🗄️',
    estimatedTime: 16,
    subtopics: ['SQL', 'NoSQL', 'Transactions', 'Indexing'],
    learningObjectives: [
      'Write efficient SQL queries',
      'Understand NoSQL databases',
      'Master transaction management',
      'Design optimal database schemas'
    ]
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    description: 'Learn encryption, authentication, and security best practices',
    category: 'Computer Science',
    difficulty: 'Advanced',
    icon: '🔒',
    estimatedTime: 22,
    subtopics: ['Cryptography', 'Authentication', 'Network Security', 'Secure Coding'],
    learningObjectives: [
      'Implement cryptographic algorithms',
      'Design secure authentication systems',
      'Protect against common vulnerabilities',
      'Apply secure coding practices'
    ]
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    description: 'Explore machine learning, neural networks, and AI algorithms',
    category: 'Computer Science',
    difficulty: 'Advanced',
    icon: '🤖',
    estimatedTime: 25,
    subtopics: ['Machine Learning', 'Neural Networks', 'Search Algorithms', 'NLP'],
    learningObjectives: [
      'Understand ML algorithms',
      'Build neural network models',
      'Implement search strategies',
      'Process natural language'
    ]
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Login
console.log('🔐 Registering login route: POST /api/auth/login');
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      sessionsCompleted: 0,
      totalQuestions: 0,
      averageScore: 0
    };

    users.push(newUser);

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// ============================================================================
// TOPICS ROUTES
// ============================================================================

// Get all topics
app.get('/api/topics', (req, res) => {
  res.json(topics);
});

// Search topics
app.get('/api/topics/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json(topics);
  }

  const searchTerm = q.toLowerCase();
  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchTerm) ||
    topic.description.toLowerCase().includes(searchTerm) ||
    topic.subtopics.some(subtopic => subtopic.toLowerCase().includes(searchTerm))
  );

  res.json(filteredTopics);
});

// Get topic details
app.get('/api/topics/:id', (req, res) => {
  const topic = topics.find(t => t.id === req.params.id);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  res.json(topic);
});

// ============================================================================
// SESSIONS ROUTES
// ============================================================================

// Get user sessions
app.get('/api/sessions', authenticateToken, (req, res) => {
  const userSessions = sessions.filter(s => s.userId === req.user.userId);
  res.json(userSessions);
});

// Create new session
app.post('/api/sessions', authenticateToken, (req, res) => {
  const { topicId, learningPath } = req.body;

  const topic = topics.find(t => t.id === topicId);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }

  const newSession = {
    id: sessions.length + 1,
    userId: req.user.userId,
    topicId: topic.id,
    topicName: topic.name,
    difficulty: topic.difficulty,
    category: topic.category,
    questionsAsked: 0,
    correctAnswers: 0,
    duration: 0,
    completed: false,
    createdAt: new Date(),
    learningPath: learningPath || 'structured'
  };

  sessions.push(newSession);
  res.status(201).json(newSession);
});

// Get session details
app.get('/api/sessions/:id', authenticateToken, (req, res) => {
  const session = sessions.find(s => 
    s.id === parseInt(req.params.id) && s.userId === req.user.userId
  );
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

// Update session
app.put('/api/sessions/:id', authenticateToken, (req, res) => {
  const sessionIndex = sessions.findIndex(s => 
    s.id === parseInt(req.params.id) && s.userId === req.user.userId
  );
  
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const updates = req.body;
  sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
  
  res.json(sessions[sessionIndex]);
});

// Delete session
app.delete('/api/sessions/:id', authenticateToken, (req, res) => {
  const sessionIndex = sessions.findIndex(s => 
    s.id === parseInt(req.params.id) && s.userId === req.user.userId
  );
  
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }

  sessions.splice(sessionIndex, 1);
  res.status(204).send();
});

// ============================================================================
// USER ROUTES
// ============================================================================

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Update user profile
app.put('/api/user/profile', authenticateToken, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updates = req.body;
  delete updates.password; // Don't allow password updates through this endpoint
  delete updates.id; // Don't allow ID changes
  delete updates.email; // Don't allow email changes

  users[userIndex] = { ...users[userIndex], ...updates };
  
  const { password: _, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

// ============================================================================
// LEARNING ROUTES (AI Integration would go here)
// ============================================================================

// Generate question (mock AI response)
app.post('/api/learning/question', authenticateToken, (req, res) => {
  const { topicId, difficulty, style, context } = req.body;

  // Mock AI-generated question
  const mockQuestion = {
    id: Date.now(),
    question: "What is the time complexity of QuickSort in the worst case scenario?",
    type: "multiple-choice",
    options: [
      "O(n log n)",
      "O(n²)",
      "O(n)",
      "O(log n)"
    ],
    correctAnswer: 1, // O(n²)
    explanation: "QuickSort has a worst-case time complexity of O(n²) when the pivot is always the smallest or largest element, causing highly unbalanced partitions.",
    difficulty: difficulty || "intermediate",
    topic: topicId || "algorithms",
    style: style || "socratic"
  };

  res.json(mockQuestion);
});

// Submit answer
app.post('/api/learning/answer', authenticateToken, (req, res) => {
  const { questionId, answer, sessionId } = req.body;

  // Mock response (in real app, this would check the answer and update session)
  const isCorrect = Math.random() > 0.3; // 70% chance of being correct
  
  res.json({
    correct: isCorrect,
    explanation: "Great thinking! This demonstrates your understanding of algorithm complexity.",
    nextAction: "continue",
    followUp: isCorrect ? 
      "Let's explore a related concept..." : 
      "Let's approach this differently..."
  });
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MindMelt Backend'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍦 MindMelt Backend running on port ${PORT}`);
  console.log(`🧠 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Demo account: demo@mindmelt.com / demo123`);
});

module.exports = app;