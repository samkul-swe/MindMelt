import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [anonymousUser, setAnonymousUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for registered user first
      const token = localStorage.getItem('mindmelt_token');
      const userData = localStorage.getItem('mindmelt_user');
      
      if (token && userData) {
        // Verify token is still valid
        await authAPI.refreshToken();
        setUser(JSON.parse(userData));
      } else {
        // Check for anonymous user
        const anonymousData = localStorage.getItem('mindmelt_anonymous');
        if (anonymousData) {
          const anonymous = JSON.parse(anonymousData);
          setAnonymousUser(anonymous);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid session
      localStorage.removeItem('mindmelt_token');
      localStorage.removeItem('mindmelt_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const createAnonymousUser = (name = null) => {
    const anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const anonymousData = {
      id: anonymousId,
      name: name || 'Anonymous Learner',
      email: null,
      isAnonymous: true,
      createdAt: new Date().toISOString(),
      sessionsCompleted: 0,
      totalQuestions: 0,
      averageScore: 0,
      sessionCount: 0
    };
    
    localStorage.setItem('mindmelt_anonymous', JSON.stringify(anonymousData));
    setAnonymousUser(anonymousData);
    return anonymousData;
  };

  const updateAnonymousUser = (updates) => {
    if (!anonymousUser) return;
    
    const updatedUser = { ...anonymousUser, ...updates };
    localStorage.setItem('mindmelt_anonymous', JSON.stringify(updatedUser));
    setAnonymousUser(updatedUser);
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.login(email, password);
      
      localStorage.setItem('mindmelt_token', response.token);
      localStorage.setItem('mindmelt_user', JSON.stringify(response.user));
      
      // If we had an anonymous user, trigger migration
      if (anonymousUser) {
        await migrateAnonymousProgress(response.user);
      }
      
      setUser(response.user);
      setAnonymousUser(null);
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.signup(email, password, name);
      
      localStorage.setItem('mindmelt_token', response.token);
      localStorage.setItem('mindmelt_user', JSON.stringify(response.user));
      
      // If we had an anonymous user, trigger migration
      if (anonymousUser) {
        await migrateAnonymousProgress(response.user);
      }
      
      setUser(response.user);
      setAnonymousUser(null);
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email, name = null) => {
    try {
      setError('');
      setLoading(true);
      
      // For now, create a simple account with magic link concept
      // In production, you'd send a magic link to email
      const tempPassword = Math.random().toString(36).substr(2, 10);
      const response = await authAPI.signup(email, tempPassword, name || email.split('@')[0]);
      
      localStorage.setItem('mindmelt_token', response.token);
      localStorage.setItem('mindmelt_user', JSON.stringify(response.user));
      
      // If we had an anonymous user, trigger migration
      if (anonymousUser) {
        await migrateAnonymousProgress(response.user);
      }
      
      setUser(response.user);
      setAnonymousUser(null);
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const migrateAnonymousProgress = async (newUser) => {
    try {
      // Get anonymous progress from localStorage
      const anonymousProgress = localStorage.getItem('mindmelt_anonymous_progress');
      const anonymousSessions = localStorage.getItem('mindmelt_anonymous_sessions');
      
      if (anonymousProgress || anonymousSessions) {
        // Here you would typically call an API to migrate the data
        // For now, we'll just merge the session counts
        const progressData = anonymousProgress ? JSON.parse(anonymousProgress) : {};
        const sessionsData = anonymousSessions ? JSON.parse(anonymousSessions) : [];
        
        console.log('Migrating anonymous progress:', {
          sessions: sessionsData.length,
          progress: progressData
        });
        
        // Clear anonymous data after migration
        localStorage.removeItem('mindmelt_anonymous_progress');
        localStorage.removeItem('mindmelt_anonymous_sessions');
      }
      
      // Clear anonymous user data
      localStorage.removeItem('mindmelt_anonymous');
    } catch (error) {
      console.error('Progress migration failed:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      localStorage.removeItem('mindmelt_token');
      localStorage.removeItem('mindmelt_user');
      localStorage.removeItem('mindmelt_sessions');
      localStorage.removeItem('mindmelt_anonymous');
      localStorage.removeItem('mindmelt_anonymous_progress');
      localStorage.removeItem('mindmelt_anonymous_sessions');
      
      setUser(null);
      setAnonymousUser(null);
      setLoading(false);
    }
  };

  const getCurrentUser = () => {
    return user || anonymousUser;
  };

  const isRegistered = () => {
    return !!user;
  };

  const isAnonymous = () => {
    return !!anonymousUser && !user;
  };

  const canAccessFeature = (feature) => {
    // Anonymous users can access basic learning
    if (feature === 'learning') return true;
    
    // Only registered users can access advanced features
    if (feature === 'progress_tracking') return isRegistered();
    if (feature === 'learning_analytics') return isRegistered();
    if (feature === 'profile_settings') return isRegistered();
    
    return false;
  };

  const value = {
    user,
    anonymousUser,
    currentUser: getCurrentUser(),
    loading,
    error,
    login,
    signup,
    signupWithEmail,
    logout,
    createAnonymousUser,
    updateAnonymousUser,
    isAuthenticated: !!(user || anonymousUser),
    isRegistered: isRegistered(),
    isAnonymous: isAnonymous(),
    canAccessFeature,
    checkAuthStatus,
    migrateAnonymousProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};