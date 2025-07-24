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
  const [user, setUser] = useState(null);
  const [anonymousUser, setAnonymousUser] = useState(null);
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
        await api.refreshToken();
        setUser(JSON.parse(userData));
      } else {
        const anonymousData = localStorage.getItem('mindmelt_anonymous');
        if (anonymousData) {
          const anonymous = JSON.parse(anonymousData);
          setAnonymousUser(anonymous);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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
      
      console.log('AuthContext: Login attempt for:', email);
      
      const response = await api.login(email, password);
      
      console.log('AuthContext: Login response:', response);
      
      localStorage.setItem('mindmelt_token', response.token);
      localStorage.setItem('mindmelt_user', JSON.stringify(response.user));
      
      // Initialize Firebase user profile
      try {
        await dataService.createUserProfile(response.user.id, {
          username: response.user.username || response.user.name,
          email: response.user.email,
          isAnonymous: false
        });
        dataService.setUser(response.user.id);
      } catch (error) {
        console.error('Error creating Firebase user profile:', error);
      }
      
      if (anonymousUser) {
        console.log('AuthContext: Migrating anonymous progress');
        await migrateAnonymousProgress(response.user);
      }
      
      setUser(response.user);
      setAnonymousUser(null);
      
      console.log('AuthContext: Login successful');
      return response.user;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
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
      
      const response = await api.signup(email, password, name);
      
      localStorage.setItem('mindmelt_token', response.token);
      localStorage.setItem('mindmelt_user', JSON.stringify(response.user));

      // Initialize Firebase user profile
      try {
        await dataService.createUserProfile(response.user.id, {
          username: response.user.username || response.user.name || name,
          email: response.user.email,
          isAnonymous: false
        });
        dataService.setUser(response.user.id);
      } catch (error) {
        console.error('Error creating Firebase user profile:', error);
      }

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

  const signupWithEmail = async (username, email = null) => {
    try {
      setError('');
      setLoading(true);

      const response = await api.signupWithUsernameAndEmail(username, email);
      
      localStorage.setItem('mindmelt_token', response.token);
      localStorage.setItem('mindmelt_user', JSON.stringify(response.user));

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
      const anonymousProgress = localStorage.getItem('mindmelt_anonymous_progress');
      const anonymousSessions = localStorage.getItem('mindmelt_anonymous_sessions');
      
      if (anonymousProgress || anonymousSessions) {
        const progressData = anonymousProgress ? JSON.parse(anonymousProgress) : {};
        const sessionsData = anonymousSessions ? JSON.parse(anonymousSessions) : [];
        
        console.log('Migrating anonymous progress:', {
          sessions: sessionsData.length,
          progress: progressData
        });
        
        // Migrate to Firebase
        if (anonymousUser) {
          await dataService.migrateAnonymousUserData(newUser.id, anonymousUser);
        }
        
        localStorage.removeItem('mindmelt_anonymous_progress');
        localStorage.removeItem('mindmelt_anonymous_sessions');
      }
      
      localStorage.removeItem('mindmelt_anonymous');
    } catch (error) {
      console.error('Progress migration failed:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      await api.signOutFirebase();

      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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

  const updateUser = async (profileUpdates) => {
    if (!user) return;
    
    try {
      const response = await api.updateProfile(profileUpdates);

      if (response.token) {
        localStorage.setItem('mindmelt_token', response.token);
      }

      const updatedUser = response.user;
      localStorage.setItem('mindmelt_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('AuthContext: Profile update failed:', error);
      throw error;
    }
  };

  const getDisplayName = (userData) => {
    return userData?.username || 'User';
  };

  const isRegistered = () => {
    return !!user;
  };

  const isAnonymous = () => {
    return !!anonymousUser && !user;
  };

  const canAccessFeature = (feature) => {
    if (feature === 'learning') return true;

    if (feature === 'progress_tracking') return isRegistered();
    if (feature === 'learning_analytics') return isRegistered();
    if (feature === 'profile_settings') return isRegistered();
    
    return false;
  };

  const currentUser = user || anonymousUser;

  const value = {
    user,
    anonymousUser,
    currentUser,
    loading,
    error,
    login,
    signup,
    signupWithEmail,
    logout,
    updateUser,
    getDisplayName,
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