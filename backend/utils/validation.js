import { body, validationResult } from 'express-validator';

/**
 * Input validation rules and helpers
 */

// Validation rules for registration
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .toLowerCase(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters')
];

// Validation rules for login
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .toLowerCase(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Custom validators for future use
export const validators = {
  // Validate GitHub URL
  isGitHubUrl: (value) => {
    return /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+/.test(value);
  },
  
  // Validate timeline (days)
  isValidTimeline: (value) => {
    const days = parseInt(value);
    return !isNaN(days) && days >= 1 && days <= 365;
  },
  
  // Validate project difficulty
  isValidDifficulty: (value) => {
    return ['Easy', 'Medium', 'Hard'].includes(value);
  }
};