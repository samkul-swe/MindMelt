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
    loading 
  } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading MindMelt..." />;
  }

  if (allowAnonymous) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  return children;
};