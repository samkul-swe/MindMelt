// ============================================================================
// components/ProtectedRoute.js - Route Protection Component
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading MindMelt..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};