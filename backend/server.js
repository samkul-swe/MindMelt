import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import projectRoutes from './routes/projects.js';
import testRoutes from './routes/test.js';
import dashboardRoutes from './routes/dashboard.js';
import './config/firebase.js'; // Initialize Firebase

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/test', testRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Future routes (Phase 4)
// app.use('/api/leetcode', leetcodeRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - must come after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/validate-token'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════');
  console.log('   MINDMELT V2 - BACKEND SERVER');
  console.log('   ═══════════════════════════════════════');
  console.log('');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base: http://localhost:${PORT}/api`);
  console.log('');
  console.log('✅ Available Routes:');
  console.log('   AUTH:');
  console.log('   - POST /api/auth/register');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/auth/me');
  console.log('');
  console.log('   RESUME:');
  console.log('   - POST /api/resume/upload');
  console.log('   - POST /api/resume/role-overview');
  console.log('   - POST /api/resume/role-details');
  console.log('   - POST /api/resume/select-role');
  console.log('');
  console.log('   PROJECTS:');
  console.log('   - GET  /api/projects/:domain');
  console.log('   - POST /api/projects/start');
  console.log('   - GET  /api/projects/current/active');
  console.log('   - POST /api/projects/socratic/message');
  console.log('   - POST /api/projects/code/submit');
  console.log('');
  console.log('   SKILL TEST:');
  console.log('   - POST /api/test/start');
  console.log('   - POST /api/test/submit');
  console.log('   - GET  /api/test/results/:testId');
  console.log('');
  console.log('🎯 Phase 1: Core Infrastructure ✓');
  console.log('🎯 Phase 2: Resume Analysis ✓');
  console.log('🎯 Phase 3: Project Learning ✓');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;