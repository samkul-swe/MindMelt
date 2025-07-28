import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/authAPI';
import dataService from '../services/dataService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const user = await api.verifyToken(token);
          if (user) {
            setCurrentUser(user);
            dataService.setUser(user.id);
          } else {
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth state check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      console.log('AuthContext: Login attempt for:', email);
      
      const response = await api.signIn(email, password);
      const { user, token } = response;

      localStorage.setItem('authToken', token);

      setCurrentUser(user);
      dataService.setUser(user.id);
      
      console.log('AuthContext: Login successful');
      return user;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, username = null) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await api.signUp(email, password, username);
      const { user, token } = response;

      localStorage.setItem('authToken', token);

      setCurrentUser(user);
      dataService.setUser(user.id);
      
      console.log('AuthContext: Signup successful');
      return user;
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      localStorage.removeItem('authToken');
      
      setCurrentUser(null);
      
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (profileUpdates) => {
    if (!currentUser) return;
    
    try {
      const response = await api.updateProfile(profileUpdates);
      const updatedUser = response.user || response;
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('AuthContext: Profile update failed:', error);
      throw error;
    }
  };

  const getDisplayName = (userData = currentUser) => {
    if (!userData) return 'Guest';
    return userData.username || userData.name || userData.email?.split('@')[0] || 'User';
  };

  const value = {
    user: currentUser,
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    getDisplayName,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};