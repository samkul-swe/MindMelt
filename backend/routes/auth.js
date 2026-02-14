import express from 'express';
import bcrypt from 'bcrypt';
import { registerValidation, loginValidation, validate } from '../utils/validation.js';
import { findOne, createDoc } from '../utils/firestore.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerValidation, validate, async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    console.log(`[Auth] Registration attempt: ${username}`);

    // Check if username already exists
    const existingUser = await findOne('users', 'username', username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Check if email already exists
    const existingEmail = await findOne('users', 'email', email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      username,
      email,
      password: hashedPassword,
      name: name || username
    };

    const user = await createDoc('users', userData);

    // Generate JWT token
    const token = generateToken(user);

    console.log(`[Auth] User registered successfully: ${user.id}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', loginValidation, validate, async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(`[Auth] Login attempt: ${username}`);

    // Find user
    const user = await findOne('users', 'username', username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    console.log(`[Auth] Login successful: ${user.id}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await findOne('users', 'username', req.user.username);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('[Auth] Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
});

/**
 * POST /api/auth/validate-token
 * Validate if token is still valid
 */
router.post('/validate-token', authenticateToken, (req, res) => {
  // If middleware passes, token is valid
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

export default router;