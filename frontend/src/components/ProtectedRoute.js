// ============================================================================
// components/ProtectedRoute.js - Progressive Route Protection
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ 
  children, 
  allowAnonymous = false, 
  redirectTo = null 
}) => {
  const { 
    isAuthenticated, 
    isRegistered, 
    isAnonymous, 
    loading 
  } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading MindMelt..." />;
  }

  // If no authentication required for anonymous users
  if (allowAnonymous && isAuthenticated) {
    return children;
  }

  // If registered user required
  if (!allowAnonymous && !isRegistered) {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  // If any authentication required but user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  return children;
};