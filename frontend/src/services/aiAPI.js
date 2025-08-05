const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AIAPI {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || result.user || result;
      }
      return null;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async signUp(email, password, username = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();

      if (result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
      }

      return {
        user: result.data?.user || result.user,
        token: result.data?.token || result.token
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();

      if (result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
      }

      return {
        user: result.data?.user || result.user,
        token: result.data?.token || result.token
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async updateProfile(updates) {
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      return result.data || result.user || result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updateUserProgress(roadmapId, topicId, percentage) {
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/progress`, {
        method: 'POST',
        body: JSON.stringify({
          roadmapId,
          topicId,
          percentage
        })
      });

      return result.data || result;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  getUserProgress(roadmapId) {
    if (!this.currentUser || !this.currentUser.currentProgress) {
      return null;
    }
    
    return this.currentUser.currentProgress[roadmapId] || null;
  }

  getAllProgress() {
    if (!this.currentUser) {
      return {};
    }
    
    return this.currentUser.currentProgress || {};
  }

  async recordLearningSession(sessionData) {
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });

      return result.data || result;
    } catch (error) {
      console.error('Error recording learning session:', error);
      throw error;
    }
  }

  async deleteAccount() {
    try {
      await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/account`, {
        method: 'DELETE'
      });

      localStorage.removeItem('authToken');
      this.currentUser = null;
      this.isAuthenticated = false;

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      localStorage.removeItem('authToken');
      this.currentUser = null;
      this.isAuthenticated = false;
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  async getLearningHistory() {
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/history`);
      return result.data || result.sessions || [];
    } catch (error) {
      console.error('Error fetching learning history:', error);
      return [];
    }
  }

  async checkUsernameExists(username) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        const result = await response.json();
        return result.exists || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }
}

const aiAPI = new AIAPI(process.env.REACT_APP_API_URL);
export default aiAPI;