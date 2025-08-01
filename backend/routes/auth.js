import express from 'express';
import authService from '../services/authService.js';
import { authenticateToken } from '../utils/middleware.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, userStorage } from '../config/firebase.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // logs in user using firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const token = await authService.getUserToken(firebaseUser);
    const user = await userStorage.findById(firebaseUser.uid);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user?.uid || firebaseUser.uid,
          email: user?.email || firebaseUser.email,
          username: user?.username,
          currentProgress: user?.currentProgress || {},
          createdAt: user?.createdAt || {}
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = '';
    if (error.code == 'auth/invalid-credential') {
      errorMessage = 'Invalid credentials. Please check your username/password';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled';
    } else {
      errorMessage = 'Login failed';
    }
    
    res.status(401).json({
      success: false,
      message: errorMessage
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // create user in firebase authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const user = await authService.createUser(firebaseUser.uid, email, username);

    const token = authService.createCustomToken(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.uid,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email registration is not enabled';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
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

export default router;