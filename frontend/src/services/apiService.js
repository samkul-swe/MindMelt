// API service for communicating with backend
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.token = localStorage.getItem('authToken'); // Match authAPI token key
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async register(email, password, username) {
    const response = await this.post('/api/auth/register', {
      email,
      password,
      username,
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async authenticate(idToken) {
    const response = await this.post('/api/auth/authenticate', {
      idToken,
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async getProfile() {
    const response = await this.get('/api/auth/profile');
    return response.data;
  }

  async updateProfile(updates) {
    const response = await this.put('/api/auth/profile', updates);
    return response.data;
  }

  async updateProgress(roadmapId, topicId, percentage) {
    const response = await this.post('/api/auth/progress', {
      roadmapId,  // Updated from courseId
      topicId,
      percentage,
    });
    return response.data;
  }

  async deleteAccount() {
    const response = await this.delete('/api/auth/account');
    return response.data;
  }

  // Data methods (updated for roadmaps)
  async getRoadmaps() {
    const response = await this.get('/api/data/roadmaps');
    return response.data;
  }

  async getRoadmap(roadmapId) {
    const response = await this.get(`/api/data/roadmaps/${roadmapId}`);
    return response.data;
  }

  async getTopicsForRoadmap(roadmapId) {
    const response = await this.get(`/api/data/roadmaps/${roadmapId}/topics`);
    return response.data;
  }

  async getTopic(topicId) {
    const response = await this.get(`/api/data/topics/${topicId}`);
    return response.data;
  }

  async getRoadmapStats(roadmapId) {
    const response = await this.get(`/api/data/roadmaps/${roadmapId}/stats`);
    return response.data;
  }

  // AI service methods (for when backend AI is ready)
  async getSocraticResponse(concept, userResponse, learningPath, questioningStyle) {
    const response = await this.post('/api/ai/chat', {
      concept,
      userResponse,
      learningPath,
      questioningStyle
    });
    return response.data;
  }

  async getHint(concept, conversationContext, learningPath, questioningStyle) {
    const response = await this.post('/api/ai/hint', {
      concept,
      conversationContext,
      learningPath,
      questioningStyle
    });
    return response.data;
  }

  async assessUnderstanding(concept, userResponse) {
    const response = await this.post('/api/ai/assess', {
      concept,
      userResponse
    });
    return response.data;
  }

  async generateDailySummary(sessionsData) {
    const response = await this.post('/api/ai/summary', {
      sessionsData
    });
    return response.data;
  }

  // Learning session methods (for future use)
  async createLearningSession(sessionData) {
    const response = await this.post('/api/sessions/create', sessionData);
    return response.data;
  }

  async updateLearningSession(sessionId, updates) {
    const response = await this.put(`/api/sessions/${sessionId}`, updates);
    return response.data;
  }

  async getLearningSession(sessionId) {
    const response = await this.get(`/api/sessions/${sessionId}`);
    return response.data;
  }

  async getLearningHistory() {
    const response = await this.get('/api/sessions/history');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.get('/health');
    return response;
  }

  // Logout
  logout() {
    this.setToken(null);
    localStorage.removeItem('mindmelt_user');
  }

  // Legacy method aliases for backward compatibility
  async getCourses() {
    return this.getRoadmaps();
  }

  async getCourse(courseId) {
    return this.getRoadmap(courseId);
  }

  async getTopicsForCourse(courseId) {
    return this.getTopicsForRoadmap(courseId);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;