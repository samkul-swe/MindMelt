require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const {
  _,
  requestLogger,
  errorHandler,
  rateLimit
} = require('./utils/middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(requestLogger);

app.use(rateLimit(15 * 60 * 1000, 100));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

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
      'DELETE /api/auth/account',
      'GET /api/data/roadmaps',
      'GET /api/data/roadmaps/:roadmapId',
      'GET /api/data/roadmaps/:roadmapId/topics',
      'GET /api/data/topics/:topicId',
      'GET /api/data/roadmaps/:roadmapId/stats'
    ]
  });
});

app.use(errorHandler);

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

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;