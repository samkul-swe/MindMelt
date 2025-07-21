const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import services and utilities
const aiService = require('./services/aiService');
const firestoreUtils = require('./utils/firestore');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MindMelt Backend is running' });
});

// Basic API routes
app.get('/api', (req, res) => {
  res.json({ message: 'MindMelt API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`MindMelt Backend server is running on port ${PORT}`);
});

module.exports = app;
