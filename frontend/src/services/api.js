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
        // Log full error details for debugging
        console.error('API Error Response:', data);
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
  // RESUME ENDPOINTS (Phase 2) - IMPROVED
  // ============================================

  async uploadResumePDF(formData) {
    const token = this.getToken();
    
    try {
      const response = await fetch(`${this.baseURL}/api/resume/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async uploadResumeText(resumeText) {
    return await this.request('/api/resume/upload', {
      method: 'POST',
      body: { resumeText }
    });
  }

  // IMPROVED: Get quick overview (just percentages)
  async getRoleOverview() {
    return await this.request('/api/resume/role-overview', {
      method: 'POST'
    });
  }

  // IMPROVED: Get detailed analysis for ONE role
  async getRoleDetails(roleName) {
    return await this.request('/api/resume/role-details', {
      method: 'POST',
      body: { roleName }
    });
  }

  async selectRole(pathData) {
    return await this.request('/api/resume/select-role', {
      method: 'POST',
      body: pathData
    });
  }

  async getResumeStatus() {
    return await this.request('/api/resume/status');
  }

  // ============================================
  // PROJECT ENDPOINTS (Phase 3)
  // ============================================

  async getProjects(domain) {
    return await this.request(`/api/projects/${encodeURIComponent(domain)}`);
  }

  async startProject(projectId) {
    return await this.request('/api/projects/start', {
      method: 'POST',
      body: { projectId }
    });
  }

  async getCurrentProject() {
    return await this.request('/api/projects/current/active');
  }

  async submitDesign(userProjectId, designText) {
    return await this.request('/api/projects/design/submit', {
      method: 'POST',
      body: { userProjectId, designText }
    });
  }

  async submitCode(userProjectId, code, language = 'javascript') {
    return await this.request('/api/projects/code/submit', {
      method: 'POST',
      body: { userProjectId, code, language }
    });
  }

  async sendSocraticMessage(userProjectId, message) {
    return await this.request('/api/projects/socratic/message', {
      method: 'POST',
      body: { userProjectId, message }
    });
  }

  async completeProject(userProjectId, performanceData) {
    return await this.request('/api/projects/complete', {
      method: 'POST',
      body: { userProjectId, performanceData }
    });
  }

  async getCompletedProjects() {
    return await this.request('/api/projects/user/completed');
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