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
    loading 
  } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading MindMelt..." />;
  }

  if (allowAnonymous && isAuthenticated) {
    return children;
  }

  if (!allowAnonymous && !isRegistered) {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  return children;
};