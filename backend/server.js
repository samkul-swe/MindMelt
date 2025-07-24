require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const helmet = require('helmet'); // Commented out temporarily
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

// Import middleware
const {
  corsMiddleware,
  requestLogger,
  errorHandler,
  rateLimit
} = require('./utils/middleware');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (for rate limiting with reverse proxies)
app.set('trust proxy', 1);

// Security middleware (helmet commented out temporarily)
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// CORS middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000'],
  credentials: true
}));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// Rate limiting
app.use(rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MindMelt API Server',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      data: '/api/data'
    },
    documentation: 'See README.md for API documentation'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/authenticate',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
      'POST /api/auth/progress',
      'POST /api/auth/session',
      'GET /api/data/courses',
      'GET /api/data/courses/:id',
      'GET /api/data/courses/:id/topics',
      'GET /api/data/topics/:id',
      'GET /api/data/search/courses',
      'GET /api/data/search/topics'
    ]
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('🚀 MindMelt API Server Starting...');
  console.log('');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API endpoints: http://localhost:${PORT}/api`);
  console.log('');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode enabled');
    console.log('📝 Detailed logging active');
    console.log('🔍 Debug information available');
    console.log('⚠️  Running without helmet security headers');
  }
  
  console.log('✅ Server is ready to handle requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
