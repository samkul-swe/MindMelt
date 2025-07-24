import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import LearningSession from './pages/LearningSession';
import InstantStart from './pages/InstantStart';
import RoadmapDetails from './pages/RoadmapDetails';
import './styles/globals/index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Instant start route - no auth required */}
            <Route path="/start" element={<InstantStart />} />
            
            {/* Semi-protected routes - allow anonymous users */}
            <Route path="/learn/:sessionId?" element={
              <ProtectedRoute allowAnonymous={true}>
                <LearningSession />
              </ProtectedRoute>
            } />
            
            {/* Dashboard route - allow anonymous users */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowAnonymous={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Roadmap details route - allow anonymous users */}
            <Route path="/roadmap/:roadmapId" element={
              <ProtectedRoute allowAnonymous={true}>
                <RoadmapDetails />
              </ProtectedRoute>
            } />
            
            {/* Root route redirects to start page */}
            <Route path="/" element={<Navigate to="/start" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/start" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
