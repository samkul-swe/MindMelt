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
  const [anonymousUser, setAnonymousUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = api.onAuthStateChange((user) => {
      if (user) {
        if (user.isAnonymous) {
          // Handle anonymous user
          setAnonymousUser(user);
          setCurrentUser(user);
        } else {
          // Handle authenticated user
          setCurrentUser(user);
          setAnonymousUser(null);
          dataService.setUser(user.id);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setAnonymousUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createAnonymousUser = async () => {
    try {
      setLoading(true);
      const user = await api.signInAnonymously();
      return user;
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAnonymousUser = async (updates) => {
    if (!currentUser || !currentUser.isAnonymous) return;
    
    try {
      const updatedUser = await api.updateProfile(updates);
      return updatedUser;
    } catch (error) {
      console.error('Error updating anonymous user:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      console.log('AuthContext: Login attempt for:', email);
      
      const user = await api.signIn(email, password);
      
      // Handle anonymous data migration if needed
      if (anonymousUser) {
        await migrateAnonymousProgress(user);
      }
      
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
      
      const user = await api.signUp(email, password, username);

      // Handle anonymous data migration if needed
      if (anonymousUser) {
        await migrateAnonymousProgress(user);
      }
      
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

  const signupWithEmail = async (email, username = null) => {
    // For backward compatibility - generate a temporary password
    const tempPassword = 'temp_' + Math.random().toString(36).substr(2, 12) + '!A1';
    return await signup(email, tempPassword, username);
  };

  const migrateAnonymousProgress = async (newUser) => {
    try {
      if (anonymousUser) {
        console.log('Migrating anonymous progress to authenticated user');
        
        // Get any stored anonymous data
        const anonymousProgress = localStorage.getItem('mindmelt_anonymous_progress');
        const anonymousSessions = localStorage.getItem('mindmelt_anonymous_sessions');
        
        if (anonymousProgress || anonymousSessions) {
          const progressData = anonymousProgress ? JSON.parse(anonymousProgress) : {};
          const sessionsData = anonymousSessions ? JSON.parse(anonymousSessions) : [];
          
          console.log('Migrating anonymous progress:', {
            sessions: sessionsData.length,
            progress: progressData
          });
          
          // Record the migration as a learning session
          await api.recordLearningSession({
            migratedData: {
              sessions: sessionsData,
              progress: progressData,
              anonymousUser: anonymousUser
            },
            createRecord: true,
            duration: 0
          });
        }
        
        // Clean up anonymous data
        localStorage.removeItem('mindmelt_anonymous_progress');
        localStorage.removeItem('mindmelt_anonymous_sessions');
      }
    } catch (error) {
      console.error('Progress migration failed:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.signOut();
      
      // Clean up local storage
      localStorage.removeItem('mindmelt_anonymous_progress');
      localStorage.removeItem('mindmelt_anonymous_sessions');
      
      setCurrentUser(null);
      setAnonymousUser(null);
      
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
      const updatedUser = await api.updateProfile(profileUpdates);
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

  const isRegistered = () => {
    return !!(currentUser && !currentUser.isAnonymous);
  };

  const isAnonymous = () => {
    return !!(currentUser && currentUser.isAnonymous);
  };

  const canAccessFeature = (feature) => {
    if (feature === 'learning') return true;
    if (feature === 'progress_tracking') return isRegistered();
    if (feature === 'learning_analytics') return isRegistered();
    if (feature === 'profile_settings') return isRegistered();
    return false;
  };

  const value = {
    user: isRegistered() ? currentUser : null,
    anonymousUser: isAnonymous() ? currentUser : null,
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
    isAuthenticated: !!currentUser,
    isRegistered: isRegistered(),
    isAnonymous: isAnonymous(),
    canAccessFeature,
    migrateAnonymousProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
