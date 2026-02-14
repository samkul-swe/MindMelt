/**
 * API Service - Central API client for MindMelt
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get auth token from localStorage
   */
  getToken() {
    return localStorage.getItem('mindmelt_token');
  }

  /**
   * Set auth token in localStorage
   */
  setToken(token) {
    localStorage.setItem('mindmelt_token', token);
  }

  /**
   * Remove auth token
   */
  removeToken() {
    localStorage.removeItem('mindmelt_token');
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...(options.body && { body: JSON.stringify(options.body) })
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async register(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async login(credentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: credentials
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async getCurrentUser() {
    return await this.request('/api/auth/me');
  }

  async validateToken() {
    return await this.request('/api/auth/validate-token', {
      method: 'POST'
    });
  }

  logout() {
    this.removeToken();
  }

  // ============================================
  // FUTURE ENDPOINTS (Phase 2+)
  // ============================================

  // Resume endpoints
  async uploadResume(resumeData) {
    return await this.request('/api/resume/upload', {
      method: 'POST',
      body: resumeData
    });
  }

  async getResumeFit() {
    return await this.request('/api/resume/fit');
  }

  // Project endpoints
  async getProjects(domain) {
    return await this.request(`/api/projects/${domain}`);
  }

  async startProject(projectId) {
    return await this.request(`/api/projects/start`, {
      method: 'POST',
      body: { projectId }
    });
  }

  // LeetCode endpoints
  async uploadLeetCodeRepo(repoUrl) {
    return await this.request('/api/leetcode/upload-repo', {
      method: 'POST',
      body: { repoUrl }
    });
  }

  async getLeetCodeSolutions() {
    return await this.request('/api/leetcode/solutions');
  }
}

export default new APIService();