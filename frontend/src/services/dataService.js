// Backend API URL - adjust based on your setup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DataService {
  constructor() {
    this.roadmapsCache = new Map();
    this.topicsCache = new Map();
    this.currentUserId = null;
  }

  // Set current user (call this when user authenticates)
  setUser(userId) {
    this.currentUserId = userId;
  }

  // Helper method to make authenticated requests
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

  // Get all roadmaps
  async getRoadmaps() {
    try {
      if (this.roadmapsCache.size > 0) {
        return Array.from(this.roadmapsCache.values());
      }

      const response = await fetch(`${API_BASE_URL}/data/roadmaps`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roadmaps');
      }

      const result = await response.json();
      const roadmaps = result.data || result;
      
      // Cache the roadmaps
      roadmaps.forEach(roadmap => {
        this.roadmapsCache.set(roadmap.id, roadmap);
      });

      console.log(`Retrieved ${roadmaps.length} roadmaps from backend`);
      return roadmaps;
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      throw error;
    }
  }

  // Get a specific roadmap by ID
  async getRoadmap(roadmapId) {
    try {
      if (this.roadmapsCache.has(roadmapId)) {
        return this.roadmapsCache.get(roadmapId);
      }

      const response = await fetch(`${API_BASE_URL}/data/roadmaps/${roadmapId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch roadmap');
      }

      const result = await response.json();
      const roadmap = result.data || result;
      
      // Cache the roadmap
      this.roadmapsCache.set(roadmapId, roadmap);
      return roadmap;
    } catch (error) {
      console.error(`Error fetching roadmap ${roadmapId}:`, error);
      throw error;
    }
  }

  // Get all topics for a specific roadmap
  async getRoadmapTopics(roadmapId) {
    try {
      const cacheKey = `roadmap_${roadmapId}`;
      if (this.topicsCache.has(cacheKey)) {
        return this.topicsCache.get(cacheKey);
      }

      const response = await fetch(`${API_BASE_URL}/data/roadmaps/${roadmapId}/topics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap topics');
      }

      const result = await response.json();
      const topics = result.data || result;

      // Cache the topics
      this.topicsCache.set(cacheKey, topics);
      console.log(`Retrieved ${topics.length} topics for roadmap ${roadmapId}`);
      return topics;
    } catch (error) {
      console.error(`Error fetching topics for roadmap ${roadmapId}:`, error);
      throw error;
    }
  }

  // Get a specific topic by ID
  async getTopic(topicId) {
    try {
      const response = await fetch(`${API_BASE_URL}/data/topics/${topicId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch topic');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error fetching topic ${topicId}:`, error);
      throw error;
    }
  }

  // Get user progress for a specific roadmap
  async getUserProgress(roadmapId) {
    if (!this.currentUserId) {
      return { topics: {} };
    }
    
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile`);
      const user = result.data || result;
      
      if (user && user.currentProgress && user.currentProgress[roadmapId]) {
        return { topics: user.currentProgress[roadmapId] };
      }
      
      return { topics: {} };
    } catch (error) {
      console.error(`Error fetching user progress for roadmap ${roadmapId}:`, error);
      return { topics: {} };
    }
  }

  // Get all user progress
  async getAllUserProgress() {
    if (!this.currentUserId) {
      return {};
    }
    
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile`);
      const user = result.data || result;
      
      return user?.currentProgress || {};
    } catch (error) {
      console.error('Error fetching all user progress:', error);
      return {};
    }
  }

  // Update user progress for a topic
  async updateTopicProgress(roadmapId, topicId, progressData) {
    if (!this.currentUserId) {
      console.warn('No authenticated user - cannot update progress');
      return null;
    }
    
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/progress`, {
        method: 'POST',
        body: JSON.stringify({
          roadmapId,
          topicId,
          percentage: progressData.progress || progressData.percentage || 0
        })
      });

      console.log(`Updated progress for topic ${topicId} in roadmap ${roadmapId}`);
      return result.data || result;
    } catch (error) {
      console.error('Error updating topic progress:', error);
      throw error;
    }
  }

  // Mark topic as completed
  async markTopicCompleted(roadmapId, topicId) {
    return await this.updateTopicProgress(roadmapId, topicId, { progress: 100 });
  }

  // Get user statistics
  async getUserStats() {
    if (!this.currentUserId) {
      return {
        totalLearningTime: 0,
        completedSessions: 0,
        totalRoadmaps: 0,
        completedRoadmaps: 0,
        totalTopics: 0,
        completedTopics: 0
      };
    }
    
    try {
      const result = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile`);
      const user = result.data || result;
      
      if (!user) {
        return {
          totalLearningTime: 0,
          completedSessions: 0,
          totalRoadmaps: 0,
          completedRoadmaps: 0,
          totalTopics: 0,
          completedTopics: 0
        };
      }

      const currentProgress = user.currentProgress || {};
      
      // Calculate statistics
      const totalRoadmaps = Object.keys(currentProgress).length;
      let completedRoadmaps = 0;
      let totalTopics = 0;
      let completedTopics = 0;
      
      Object.values(currentProgress).forEach(roadmapProgress => {
        const topics = Object.values(roadmapProgress);
        totalTopics += topics.length;
        
        const roadmapCompletedTopics = topics.filter(topic => topic.completed || topic.percentage >= 100).length;
        completedTopics += roadmapCompletedTopics;
        
        // Consider roadmap completed if all topics are completed
        if (topics.length > 0 && roadmapCompletedTopics === topics.length) {
          completedRoadmaps++;
        }
      });

      return {
        totalLearningTime: user.totalLearningTime || 0,
        completedSessions: user.completedSessions || 0,
        totalRoadmaps,
        completedRoadmaps,
        totalTopics,
        completedTopics,
        joinedAt: user.createdAt || user.joinedAt,
        lastActiveAt: user.updatedAt || user.lastActiveAt
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Get roadmap statistics
  async getRoadmapStats(roadmapId) {
    try {
      const response = await fetch(`${API_BASE_URL}/data/roadmaps/${roadmapId}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap stats');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error fetching roadmap stats for ${roadmapId}:`, error);
      // Return basic stats as fallback
      const topics = await this.getRoadmapTopics(roadmapId);
      return {
        totalTopics: topics.length,
        topicsByDifficulty: this.groupTopicsByDifficulty(topics)
      };
    }
  }

  // Helper method to group topics by difficulty
  groupTopicsByDifficulty(topics) {
    const grouped = {};
    topics.forEach(topic => {
      const difficulty = topic.difficulty || 'Unknown';
      if (!grouped[difficulty]) {
        grouped[difficulty] = 0;
      }
      grouped[difficulty]++;
    });
    return grouped;
  }

  // Clear cache (call this when data might have changed)
  clearCache() {
    this.roadmapsCache.clear();
    this.topicsCache.clear();
  }

  // Learning session methods (for future use when AI backend is ready)
  async createLearningSession(sessionData) {
    if (!this.currentUserId) {
      console.warn('No authenticated user - cannot create session');
      return { id: 'local_session_' + Date.now() };
    }
    
    try {
      // This would call your backend to create a learning session
      // For now, return a mock session
      return {
        id: 'session_' + Date.now(),
        ...sessionData,
        userId: this.currentUserId,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating learning session:', error);
      throw error;
    }
  }

  async updateLearningSession(sessionId, updates) {
    if (!this.currentUserId) {
      console.warn('No authenticated user - cannot update session');
      return null;
    }
    
    try {
      // This would call your backend to update a learning session
      console.log('Would update session:', sessionId, 'with:', updates);
      return { id: sessionId, ...updates };
    } catch (error) {
      console.error('Error updating learning session:', error);
      throw error;
    }
  }

  async getLearningSession(sessionId) {
    if (!this.currentUserId) {
      console.warn('No authenticated user - cannot get session');
      return null;
    }
    
    try {
      // This would call your backend to get a learning session
      console.log('Would get session:', sessionId);
      return null; // Return null to fall back to new session
    } catch (error) {
      console.error('Error getting learning session:', error);
      return null;
    }
  }

  // Enroll user in roadmap (initialize progress)
  async enrollUserInRoadmap(roadmapId, userId) {
    if (!userId) {
      console.warn('No user ID provided for enrollment');
      return false;
    }
    
    try {
      // This would initialize the user's progress for the roadmap
      console.log('Would enroll user', userId, 'in roadmap', roadmapId);
      return true;
    } catch (error) {
      console.error('Error enrolling user in roadmap:', error);
      return false;
    }
  }

  // Legacy method aliases for backward compatibility
  async getCourses() {
    return this.getRoadmaps();
  }

  async getCourse(courseId) {
    return this.getRoadmap(courseId);
  }

  async getTopicsForCourse(courseId) {
    return this.getRoadmapTopics(courseId);
  }

  async getUserCourseProgress(userId, courseId) {
    const progress = await this.getUserProgress(courseId);
    return {
      percentage: 0, // Calculate from topics
      topics: progress.topics || {}
    };
  }
}

// Create and export singleton instance
const dataService = new DataService();
export default dataService;