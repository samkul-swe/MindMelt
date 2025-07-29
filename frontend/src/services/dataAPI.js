class DataAPI{
  constructor() {
    this.roadmapsCache = new Map();
    this.topicsCache = new Map();
    this.currentUserId = null;
  }

  setUser(userId) {
    this.currentUserId = userId;
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

  async getRoadmaps() {
    try {
      if (this.roadmapsCache.size > 0) {
        return Array.from(this.roadmapsCache.values());
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/data/roadmaps`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roadmaps');
      }

      const result = await response.json();
      const roadmaps = result.data || result;
      
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


  async getRoadmap(roadmapId) {
    try {
      if (this.roadmapsCache.has(roadmapId)) {
        return this.roadmapsCache.get(roadmapId);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/data/roadmaps/${roadmapId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch roadmap');
      }

      const result = await response.json();
      const roadmap = result.data || result;

      this.roadmapsCache.set(roadmapId, roadmap);
      return roadmap;
    } catch (error) {
      console.error(`Error fetching roadmap ${roadmapId}:`, error);
      throw error;
    }
  }

  async getRoadmapTopics(roadmapId) {
    try {
      const cacheKey = `roadmap_${roadmapId}`;
      if (this.topicsCache.has(cacheKey)) {
        return this.topicsCache.get(cacheKey);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/data/roadmaps/${roadmapId}/topics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap topics');
      }

      const result = await response.json();
      const topics = result.data || result;


      this.topicsCache.set(cacheKey, topics);
      console.log(`Retrieved ${topics.length} topics for roadmap ${roadmapId}`);
      return topics;
    } catch (error) {
      console.error(`Error fetching topics for roadmap ${roadmapId}:`, error);
      throw error;
    }
  }

  async getTopic(topicId) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/data/topics/${topicId}`);
      
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

  async getUserProgress(roadmapId) {
    if (!this.currentUserId) {
      return { topics: {} };
    }
    
    try {
      const result = await this.makeAuthenticatedRequest(`${process.env.REACT_APP_API_URL}/auth/profile`);
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

  async getAllUserProgress() {
    if (!this.currentUserId) {
      return {};
    }
    
    try {
      const result = await this.makeAuthenticatedRequest(`${process.env.REACT_APP_API_URL}/auth/profile`);
      const user = result.data || result;
      
      return user?.currentProgress || {};
    } catch (error) {
      console.error('Error fetching all user progress:', error);
      return {};
    }
  }

  async updateTopicProgress(roadmapId, topicId, progressData) {
    if (!this.currentUserId) {
      console.warn('No authenticated user - cannot update progress');
      return null;
    }
    
    try {
      const result = await this.makeAuthenticatedRequest(`${process.env.REACT_APP_API_URL}/auth/progress`, {
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

  async markTopicCompleted(roadmapId, topicId) {
    return await this.updateTopicProgress(roadmapId, topicId, { progress: 100 });
  }

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
      const result = await this.makeAuthenticatedRequest(`${process.env.REACT_APP_API_URL}/auth/profile`);
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

      const totalRoadmaps = Object.keys(currentProgress).length;
      let completedRoadmaps = 0;
      let totalTopics = 0;
      let completedTopics = 0;
      
      Object.values(currentProgress).forEach(roadmapProgress => {
        const topics = Object.values(roadmapProgress);
        totalTopics += topics.length;
        
        const roadmapCompletedTopics = topics.filter(topic => topic.completed || topic.percentage >= 100).length;
        completedTopics += roadmapCompletedTopics;

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

  async getRoadmapStats(roadmapId) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/data/roadmaps/${roadmapId}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap stats');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error fetching roadmap stats for ${roadmapId}:`, error);
      const topics = await this.getRoadmapTopics(roadmapId);
      return {
        totalTopics: topics.length,
        topicsByDifficulty: this.groupTopicsByDifficulty(topics)
      };
    }
  }

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

  clearCache() {
    this.roadmapsCache.clear();
    this.topicsCache.clear();
  }

  async createLearningSession(sessionData) {
    if (!this.currentUserId) {
      console.warn('No authenticated user - cannot create session');
      return { id: 'local_session_' + Date.now() };
    }
    
    try {
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
      console.log('Would get session:', sessionId);
      return null;
    } catch (error) {
      console.error('Error getting learning session:', error);
      return null;
    }
  }

  async enrollUserInRoadmap(roadmapId, userId) {
    if (!userId) {
      console.warn('No user ID provided for enrollment');
      return false;
    }
    
    try {
      console.log('Would enroll user', userId, 'in roadmap', roadmapId);
      return true;
    } catch (error) {
      console.error('Error enrolling user in roadmap:', error);
      return false;
    }
  }

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
      percentage: 0,
      topics: progress.topics || {}
    };
  }
}

const dataAPI = new DataAPI();
export default dataAPI;