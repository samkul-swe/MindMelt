const express = require('express');
const authService = require('../services/authService');
const { authenticateToken } = require('../utils/middleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await authService.createUser(email, password, username);
    const token = authService.createCustomToken(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.uid,
          email: user.email,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/authenticate', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    const user = await authService.authenticateUser(idToken);
    const token = authService.createCustomToken(user);

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user.uid,
          email: user.email,
          username: user.username,
          currentProgress: user.currentProgress || {}
        },
        token
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUser(req.user.uid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.uid,
        email: user.email,
        username: user.username,
        currentProgress: user.currentProgress || {},
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const user = await authService.updateUserProfile(req.user.uid, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.uid,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/progress', authenticateToken, async (req, res) => {
  try {
    const { roadmapId, topicId, percentage } = req.body;
    
    if (!roadmapId || !topicId || percentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'roadmapId, topicId, and percentage are required'
      });
    }

    const roadmapProgress = await authService.updateUserProgress(
      req.user.uid, 
      roadmapId, 
      topicId, 
      percentage
    );

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: roadmapProgress
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await authService.deleteUser(req.user.uid);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;