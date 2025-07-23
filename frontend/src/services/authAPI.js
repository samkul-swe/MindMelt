const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      error.response = { data };
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const authAPI = {
  async signInWithGoogle() {
    throw new Error('Firebase authentication has been removed. Please use username/email signup.');
  },

  async signInWithGithub() {
    throw new Error('Firebase authentication has been removed. Please use username/email signup.');
  },

  async signupWithUsernameAndEmail(username, email = null) {
    try {
      const response = await apiRequest('/auth/signup-simple', {
        method: 'POST',
        body: JSON.stringify({ username, email }),
      });
      
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async signOutFirebase() {
    return Promise.resolve({ success: true });
  },
  async login(emailOrUsername, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
  },

  async signup(email, password, _unused) {
    const username = email.split('@')[0];
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },

  async logout() {
    return Promise.resolve({ success: true });
  },

  async checkUsernameAvailability(username) {
    return apiRequest(`/auth/check-username/${encodeURIComponent(username)}`);
  },

  async refreshToken() {
    return apiRequest('/user/profile');
  },

  async getProfile() {
    return apiRequest('/user/profile');
  },

  async updateProfile(profileData) {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

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

  async getAllTopics() {
    return apiRequest('/topics');
  },

  async searchTopics(query, apiKey) {
    return apiRequest('/ai/search-topics', {
      method: 'POST',
      body: JSON.stringify({ query, apiKey }),
    });
  },

  async getTopicDetails(topicName, apiKey) {
    return apiRequest('/ai/topic-details', {
      method: 'POST',
      body: JSON.stringify({ topicName, apiKey }),
    });
  },

  async getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey) {
    return apiRequest('/ai/socratic', {
      method: 'POST',
      body: JSON.stringify({ concept, userResponse, learningPath, questioningStyle, apiKey }),
    });
  },

  async generateDailySummary(sessionsData, apiKey) {
    return apiRequest('/ai/daily-summary', {
      method: 'POST',
      body: JSON.stringify({ sessionsData, apiKey }),
    });
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

export const api = authAPI;