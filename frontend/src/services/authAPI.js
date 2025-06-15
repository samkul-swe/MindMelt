// ============================================================================
// services/authAPI.js - Authentication API Service (Corrected for Backend)
// ============================================================================

// FIXED: Changed from port 5000 to 3001 to match your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('mindmelt_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }
    
    // FIXED: Your backend returns data directly, not wrapped in a 'data' property
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const authAPI = {
  // FIXED: Updated endpoints to match your backend
  async login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // FIXED: Changed from '/auth/signup' to '/auth/register' to match backend
  async signup(email, password, name) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async logout() {
    // Your backend doesn't have a logout endpoint, so just resolve
    return Promise.resolve({ success: true });
  },

  // FIXED: Changed from '/auth/me' to '/auth/verify' to match backend
  async refreshToken() {
    return apiRequest('/auth/verify');
  },

  // FIXED: Changed from '/auth/me' to '/user/profile' to match backend
  async getProfile() {
    return apiRequest('/user/profile');
  },

  // FIXED: Changed from '/auth/profile' to '/user/profile' to match backend
  async updateProfile(profileData) {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // FIXED: Updated session endpoints to match backend structure
  async getLearningHistory() {
    return apiRequest('/sessions');
  },

  async createLearningSession(sessionData) {
    return apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  async updateLearningSession(sessionId, sessionData) {
    return apiRequest(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  },

  async deleteLearningSession(sessionId) {
    return apiRequest(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async getLearningSession(sessionId) {
    return apiRequest(`/sessions/${sessionId}`);
  },

  // Additional methods to match your backend capabilities
  async getAllTopics() {
    return apiRequest('/topics');
  },

  async searchTopics(query) {
    return apiRequest(`/topics/search?q=${encodeURIComponent(query)}`);
  },

  async getTopicDetails(topicId) {
    return apiRequest(`/topics/${topicId}`);
  },

  async generateQuestion(topicId, difficulty = 'intermediate', style = 'socratic', context = null) {
    return apiRequest('/learning/question', {
      method: 'POST',
      body: JSON.stringify({ topicId, difficulty, style, context }),
    });
  },

  async submitAnswer(questionId, answer, sessionId) {
    return apiRequest('/learning/answer', {
      method: 'POST',
      body: JSON.stringify({ questionId, answer, sessionId }),
    });
  },

  async healthCheck() {
    return apiRequest('/health');
  }
};

// Mock API for development - remove this when you have a real backend
export const mockAuthAPI = {
  async login(email, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'demo@mindmelt.com' && password === 'demo123') {
      return {
        user: {
          id: 1,
          email: 'demo@mindmelt.com',
          name: 'Demo User',
          createdAt: new Date('2024-01-01'),
          sessionsCompleted: 12,
          totalQuestions: 156,
          averageScore: 78
        },
        token: 'mock-jwt-token-' + Date.now()
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  async signup(email, password, name) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email.includes('@')) {
      return {
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          createdAt: new Date().toISOString(),
          sessionsCompleted: 0,
          totalQuestions: 0,
          averageScore: 0
        },
        token: 'mock-jwt-token-' + Date.now()
      };
    } else {
      throw new Error('Invalid email format');
    }
  },

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async refreshToken() {
    const token = localStorage.getItem('mindmelt_token');
    if (token && token.startsWith('mock-jwt-token')) {
      return { 
        user: {
          id: 1,
          email: 'demo@mindmelt.com',
          name: 'Demo User',
          createdAt: new Date('2024-01-01'),
          sessionsCompleted: 12,
          totalQuestions: 156,
          averageScore: 78
        }
      };
    } else {
      throw new Error('Invalid token');
    }
  },

  async getLearningHistory() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 1,
        userId: 1,
        topicId: 'algorithms',
        topicName: 'Algorithms & Data Structures',
        difficulty: 'Intermediate',
        category: 'Computer Science',
        questionsAsked: 8,
        correctAnswers: 6,
        duration: 15,
        completed: true,
        createdAt: new Date('2024-12-01'),
        learningPath: 'structured'
      }
    ];
  }
};

// FIXED: Always use real API instead of mock in development
// Comment out the next line if you want to use mock API for testing
export const api = authAPI;

// Uncomment the next line if you want to use mock API for testing
// export const api = process.env.NODE_ENV === 'development' ? mockAuthAPI : authAPI;