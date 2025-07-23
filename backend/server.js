const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

require('./config/firebase');

const aiService = require('./services/aiService');
const firestoreUtils = require('./utils/firestore');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Authentication middleware - must be defined before use
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'mindmelt-default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MindMelt Backend is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'MindMelt API is running' });
});

app.post('/api/ai/daily-summary', authenticateToken, async (req, res) => {
  try {
    const { sessionsData, apiKey } = req.body;
    
    if (!sessionsData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sessions data is required' 
      });
    }
    
    const summary = await aiService.generateDailySummary(sessionsData, apiKey);
    
    res.json({
      success: true,
      summary
    });
    
  } catch (error) {
    console.error('Daily summary generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate daily summary'
    });
  }
});

app.get('/api/auth/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }
    
    const existingUser = await firestoreUtils.userStorage.findByUsername(username.toLowerCase());
    
    res.json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });
    
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check username availability'
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, username, and password are required' 
      });
    }
    
    const existingUserByEmail = await firestoreUtils.userStorage.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    const existingUserByUsername = await firestoreUtils.userStorage.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is already taken' 
      });
    }
    
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await firestoreUtils.userStorage.create({
      email,
      username: username.toLowerCase(),
      password: hashedPassword
    });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET || 'mindmelt-default-secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create account. Please try again.' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    if (!emailOrUsername || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/username and password are required' 
      });
    }

    let user;
    if (emailOrUsername.includes('@')) {
      user = await firestoreUtils.userStorage.findByEmail(emailOrUsername);
    } else {
      user = await firestoreUtils.userStorage.findByUsername(emailOrUsername);
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    await firestoreUtils.userStorage.update(user.id, {
      'stats.lastActive': new Date().toISOString()
    });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'mindmelt-default-secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

app.post('/api/ai/socratic', authenticateToken, async (req, res) => {
  try {
    const { concept, userResponse, learningPath, questioningStyle, apiKey } = req.body;
    
    if (!concept || !userResponse) {
      return res.status(400).json({ 
        success: false, 
        message: 'Concept and user response are required' 
      });
    }
    
    const response = await aiService.getSocraticResponse(
      concept, 
      userResponse, 
      learningPath || 'comprehensive',
      questioningStyle || 'socratic',
      apiKey,
      true // returnParsed = true
    );
    
    res.json({
      success: true,
      response
    });
    
  } catch (error) {
    console.error('Socratic response error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI response'
    });
  }
});

app.post('/api/ai/search-topics', authenticateToken, async (req, res) => {
  try {
    const { query, apiKey } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }
    
    const topics = await aiService.searchCSTopics(query, apiKey);
    
    res.json({
      success: true,
      topics
    });
    
  } catch (error) {
    console.error('Topic search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search topics'
    });
  }
});

app.post('/api/ai/topic-details', authenticateToken, async (req, res) => {
  try {
    const { topicName, apiKey } = req.body;
    
    if (!topicName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic name is required' 
      });
    }
    
    const details = await aiService.getTopicDetails(topicName, apiKey);
    
    res.json({
      success: true,
      details
    });
    
  } catch (error) {
    console.error('Topic details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get topic details'
    });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await firestoreUtils.userStorage.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const normalizedUsername = username.toLowerCase();

    const existingUser = await firestoreUtils.userStorage.findByUsername(normalizedUsername);
    
    if (existingUser && existingUser.id !== req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }
    
    const updatedUser = await firestoreUtils.userStorage.update(req.user.userId, {
      username: normalizedUsername
    });

    const jwt = require('jsonwebtoken');
    const newToken = jwt.sign(
      { userId: updatedUser.id, email: updatedUser.email, username: updatedUser.username },
      process.env.JWT_SECRET || 'mindmelt-default-secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: 'Username updated successfully',
      user: userWithoutPassword,
      token: newToken
    });
    
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update username: ' + error.message
    });
  }
});

const startServer = async () => {
  try {
    await firestoreUtils.initializeFirestore();
    console.log('✅ Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`🚀 MindMelt Backend server is running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/signup, /api/auth/login`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
