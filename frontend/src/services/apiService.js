// API service for communicating with backend
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.token = localStorage.getItem('mindmelt_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('mindmelt_token', token);
    } else {
      localStorage.removeItem('mindmelt_token');
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
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async login(email, password) {
    // For now, we'll simulate login - in a real app you'd have a login endpoint
    // Or you'd use Firebase client SDK to get an ID token and send it to your backend
    const response = await this.post('/api/auth/login', {
      email,
      password,
    });
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async authenticate(idToken) {
    const response = await this.post('/api/auth/authenticate', {
      idToken,
    });
    
    if (response.data.token) {
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

  async updateProgress(courseId, topicId, percentage) {
    const response = await this.post('/api/auth/progress', {
      courseId,
      topicId,
      percentage,
    });
    return response.data;
  }

  async recordSession(sessionData) {
    const response = await this.post('/api/auth/session', sessionData);
    return response.data;
  }

  // Data methods
  async getCourses() {
    const response = await this.get('/api/data/courses');
    return response.data;
  }

  async getCourse(courseId) {
    const response = await this.get(`/api/data/courses/${courseId}`);
    return response.data;
  }

  async getTopicsForCourse(courseId) {
    const response = await this.get(`/api/data/courses/${courseId}/topics`);
    return response.data;
  }

  async getTopic(topicId) {
    const response = await this.get(`/api/data/topics/${topicId}`);
    return response.data;
  }

  async searchCourses(query) {
    const response = await this.get(`/api/data/search/courses?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async searchTopics(query, courseId = null) {
    const url = courseId 
      ? `/api/data/search/topics?q=${encodeURIComponent(query)}&courseId=${courseId}`
      : `/api/data/search/topics?q=${encodeURIComponent(query)}`;
    const response = await this.get(url);
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
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
