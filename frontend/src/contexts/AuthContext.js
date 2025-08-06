import { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../services/authAPI';
import dataAPI from '../services/dataAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const safeLocalStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === 'undefined' || item === 'null') {
        return null;
      }
      return item;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
};

const userStorage = {
  getCurrentUser: () => {
    try {
      const userJson = safeLocalStorage.get('current_user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  setCurrentUser: (user) => {
    try {
      if (user) {
        console.log("Current USer Set : " + JSON.stringify(user));
        safeLocalStorage.set('current_user', JSON.stringify(user));
        safeLocalStorage.set('mindmelt_is_authenticated', 'true');
      } else {
        safeLocalStorage.remove('current_user');
        safeLocalStorage.remove('mindmelt_is_authenticated');
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  isAuthenticated: () => {
    const authStatus = safeLocalStorage.get('mindmelt_is_authenticated');
    const user = userStorage.getCurrentUser();
    return authStatus === 'true' && user !== null;
  },

  clearUserData: () => {
    safeLocalStorage.remove('current_user');
    safeLocalStorage.remove('mindmelt_is_authenticated');
    safeLocalStorage.remove('authToken');
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedUser = userStorage.getCurrentUser();
        const token = safeLocalStorage.get('authToken');
        
        if (token && storedUser) {
          try {
            const verifiedUser = await authAPI.verifyToken(token);
            if (verifiedUser) {
              setCurrentUser(verifiedUser);
              userStorage.setCurrentUser(verifiedUser);
              dataAPI.setUser(verifiedUser.id);
              console.log('AuthContext: Token verified, user authenticated');
            } else {
              console.log('AuthContext: Token verification failed');
              userStorage.clearUserData();
              setCurrentUser(null);
            }
          } catch (verifyError) {
            console.error('AuthContext: Token verification error:', verifyError);
            if (storedUser) {
              console.log('AuthContext: Using stored user data (offline mode)');
              setCurrentUser(storedUser);
              dataAPI.setUser(storedUser.id);
            } else {
              userStorage.clearUserData();
              setCurrentUser(null);
            }
          }
        } else if (storedUser && !token) {
          console.log('AuthContext: Found user data without token, clearing');
          userStorage.clearUserData();
          setCurrentUser(null);
        } else if (token && !storedUser) {
          try {
            const user = await authAPI.verifyToken(token);
            if (user) {
              setCurrentUser(user);
              userStorage.setCurrentUser(user);
              dataAPI.setUser(user.id);
            } else {
              safeLocalStorage.remove('authToken');
            }
          } catch (error) {
            console.error('AuthContext: Token verification failed:', error);
            safeLocalStorage.remove('authToken');
          }
        } else {
          console.log('AuthContext: No authentication data found');
        }
      } catch (error) {
        console.error('AuthContext: Auth state check failed:', error);
        userStorage.clearUserData();
        setCurrentUser(null);
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
      
      const response = await authAPI.signIn(email, password);
      const { user, token } = response;

      console.log("AUTH TOKEN< SET : " + token);

      safeLocalStorage.set('authToken', token);
      userStorage.setCurrentUser(user);

      setCurrentUser(user);
      dataAPI.setUser(user.id);
      
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
      
      const response = await authAPI.signUp(email, password, username);
      const { user, token } = response;

      safeLocalStorage.set('authToken', token);
      userStorage.setCurrentUser(user);

      setCurrentUser(user);
      dataAPI.setUser(user.id);
      
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

      userStorage.clearUserData();
      
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
      const response = await authAPI.updateProfile(profileUpdates);
      const updatedUser = response.user || response;

      setCurrentUser(updatedUser);
      userStorage.setCurrentUser(updatedUser);
      
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

  const refreshUser = async () => {
    const token = safeLocalStorage.get('authToken');
    if (token && currentUser) {
      try {
        const refreshedUser = await authAPI.verifyToken(token);
        if (refreshedUser) {
          setCurrentUser(refreshedUser);
          userStorage.setCurrentUser(refreshedUser);
          return refreshedUser;
        }
      } catch (error) {
        console.error('AuthContext: User refresh failed:', error);
      }
    }
    return currentUser;
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
    refreshUser,
    getDisplayName,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};