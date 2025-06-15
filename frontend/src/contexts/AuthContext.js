// ============================================================================
// contexts/AuthContext.js - Authentication Context Provider
// ============================================================================

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('mindmelt_token');
      const userData = localStorage.getItem('mindmelt_user');
      
      if (token && userData) {
        // Verify token is still valid
        await authAPI.refreshToken();
        setUser(JSON.parse(userData));
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

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.login(email, password);
      
      localStorage.setItem('mindmelt_token', response.token);
      localStorage.setItem('mindmelt_user', JSON.stringify(response.user));
      
      setUser(response.user);
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
      
      setUser(response.user);
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
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
      
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};