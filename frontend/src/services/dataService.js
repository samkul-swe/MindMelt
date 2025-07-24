// Firebase-integrated data service
import { LEARNING_ROADMAPS } from '../data/learningRoadmaps';
import { 
  userService, 
  roadmapService, 
  topicService, 
  progressService, 
  sessionService,
  enrollmentService,
  firebaseUtils 
} from './firebase/firebaseService';

class DataService {
  constructor() {
    this.initialized = false;
    this.currentUserId = null;
  }

  // Initialize the service and set up default data
  async initialize(userId = null) {
    try {
      this.currentUserId = userId;
      
      if (!this.initialized) {
        console.log('🔄 Initializing Firebase data service...');
        
        // Initialize default roadmaps in Firebase
        await firebaseUtils.initializeDefaultRoadmaps(LEARNING_ROADMAPS);
        
        this.initialized = true;
        console.log('✅ Firebase data service initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize data service:', error);
      throw error;
    }
  }

  // Set current user
  setUser(userId) {
    this.currentUserId = userId;
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  async createUserProfile(userId, userData) {
    try {
      // Check if user already exists
      const existingUser = await userService.getUser(userId);
      if (existingUser) {
        return existingUser;
      }
      
      return await userService.createUser(userId, userData);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) throw new Error('No user ID provided');
    
    return await userService.getUser(uid);
  }

  async updateUserProfile(updates, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) throw new Error('No user ID provided');
    
    return await userService.updateUser(uid, updates);
  }

  async updateUserStats(stats, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) throw new Error('No user ID provided');
    
    return await userService.updateUserStats(uid, stats);
  }

  // ============================================================================
  // ROADMAP OPERATIONS
  // ============================================================================

  async getAllRoadmaps() {
    try {
      await this.initialize();
      return await roadmapService.getAllRoadmaps();
    } catch (error) {
      console.error('Error getting roadmaps:', error);
      // Fallback to local data
      return Object.values(LEARNING_ROADMAPS);
    }
  }

  async getRoadmap(roadmapId) {
    try {
      await this.initialize();
      const roadmap = await roadmapService.getRoadmap(roadmapId);
      
      if (!roadmap) {
        // Fallback to local data
        return LEARNING_ROADMAPS[roadmapId] || null;
      }
      
      return roadmap;
    } catch (error) {
      console.error('Error getting roadmap:', error);
      return LEARNING_ROADMAPS[roadmapId] || null;
    }
  }

  async getRoadmapTopics(roadmapId) {
    try {
      await this.initialize();
      const topics = await topicService.getTopicsForRoadmap(roadmapId);
      
      if (!topics || topics.length === 0) {
        // Fallback to local data
        const localRoadmap = LEARNING_ROADMAPS[roadmapId];
        return localRoadmap?.topics || [];
      }
      
      return topics;
    } catch (error) {
      console.error('Error getting roadmap topics:', error);
      const localRoadmap = LEARNING_ROADMAPS[roadmapId];
      return localRoadmap?.topics || [];
    }
  }

  // ============================================================================
  // USER PROGRESS OPERATIONS
  // ============================================================================

  async getUserProgress(roadmapId, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) {
      // Return mock progress for anonymous users
      return this.getMockUserProgress(roadmapId);
    }

    try {
      await this.initialize();
      return await progressService.getUserProgress(uid, roadmapId);
    } catch (error) {
      console.error('Error getting user progress:', error);
      return this.getMockUserProgress(roadmapId);
    }
  }

  async updateTopicProgress(roadmapId, topicId, progressData, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) {
      console.log('Cannot save progress for anonymous user');
      return;
    }

    try {
      await this.initialize();
      await progressService.updateTopicProgress(uid, roadmapId, topicId, progressData);
      
      // Update user stats
      await this.updateUserStats({
        totalQuestions: progressData.questionsAnswered || 0,
        totalCorrectAnswers: progressData.correctAnswers || 0,
        totalStudyTime: progressData.timeSpent || 0
      }, uid);
      
    } catch (error) {
      console.error('Error updating topic progress:', error);
      throw error;
    }
  }

  async getAllUserProgress(userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) return [];

    try {
      await this.initialize();
      return await progressService.getAllUserProgress(uid);
    } catch (error) {
      console.error('Error getting all user progress:', error);
      return [];
    }
  }

  // ============================================================================
  // ROADMAP ENROLLMENT
  // ============================================================================

  async enrollUserInRoadmap(roadmapId, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) {
      console.log('Cannot enroll anonymous user in roadmap');
      return null;
    }

    try {
      await this.initialize();
      
      // Check if already enrolled
      const existingEnrollment = await enrollmentService.getUserRoadmapEnrollment(uid, roadmapId);
      if (existingEnrollment) {
        return existingEnrollment;
      }
      
      // Enroll user
      const enrollment = await enrollmentService.enrollInRoadmap(uid, roadmapId);
      
      // Update user stats
      await this.updateUserStats({ roadmapsStarted: 1 }, uid);
      
      return enrollment;
    } catch (error) {
      console.error('Error enrolling user in roadmap:', error);
      throw error;
    }
  }

  async getUserEnrollments(userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) return [];

    try {
      await this.initialize();
      return await enrollmentService.getUserEnrollments(uid);
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      return [];
    }
  }

  // ============================================================================
  // LEARNING SESSIONS
  // ============================================================================

  async createLearningSession(sessionData, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) {
      console.log('Cannot save session for anonymous user');
      return { id: 'anonymous_' + Date.now(), ...sessionData };
    }

    try {
      await this.initialize();
      const session = await sessionService.createSession(uid, sessionData);
      
      // Update user stats
      await this.updateUserStats({ totalSessions: 1 }, uid);
      
      return session;
    } catch (error) {
      console.error('Error creating learning session:', error);
      throw error;
    }
  }

  async updateLearningSession(sessionId, updates, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid || sessionId.startsWith('anonymous_')) {
      console.log('Cannot update session for anonymous user');
      return;
    }

    try {
      await this.initialize();
      await sessionService.updateSession(sessionId, updates);
    } catch (error) {
      console.error('Error updating learning session:', error);
      throw error;
    }
  }

  async getLearningSession(sessionId, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid || sessionId.startsWith('anonymous_')) {
      return null;
    }

    try {
      await this.initialize();
      return await sessionService.getSession(sessionId);
    } catch (error) {
      console.error('Error getting learning session:', error);
      return null;
    }
  }

  async getUserSessions(userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) return [];

    try {
      await this.initialize();
      return await sessionService.getUserSessions(uid);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async deleteLearningSession(sessionId, userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid || sessionId.startsWith('anonymous_')) {
      console.log('Cannot delete session for anonymous user');
      return;
    }

    try {
      await this.initialize();
      await sessionService.deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting learning session:', error);
      throw error;
    }
  }

  // ============================================================================
  // MIGRATION & UTILITIES
  // ============================================================================

  async migrateAnonymousUserData(userId, anonymousData) {
    try {
      await this.initialize();
      await firebaseUtils.migrateAnonymousData(userId, anonymousData);
      this.setUser(userId);
    } catch (error) {
      console.error('Error migrating anonymous data:', error);
      throw error;
    }
  }

  // ============================================================================
  // FALLBACK METHODS (for anonymous users)
  // ============================================================================

  getMockUserProgress(roadmapId) {
    // Return the same mock progress structure as before
    const mockProgress = {
      "dsa-fundamentals": {
        1: { completed: false, progress: 75, unlocked: true, started: true, canAdvance: true },
        2: { completed: false, progress: 35, unlocked: true, started: true, canAdvance: false },
        3: { completed: false, progress: 0, unlocked: true, started: false, canAdvance: false },
        4: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        5: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        6: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        7: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        8: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        9: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        10: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        11: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        12: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        13: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        14: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false },
        15: { completed: false, progress: 0, unlocked: false, started: false, canAdvance: false }
      },
      // Add other roadmaps...
    };
    
    return {
      userId: 'anonymous',
      roadmapId,
      topics: mockProgress[roadmapId] || {},
      overallProgress: 0,
      startedAt: null,
      completedAt: null,
      totalTimeSpent: 0,
      currentStreak: 0
    };
  }

  // Get roadmap data with integrated Firebase topics
  async getRoadmapWithTopics(roadmapId) {
    try {
      const [roadmap, topics] = await Promise.all([
        this.getRoadmap(roadmapId),
        this.getRoadmapTopics(roadmapId)
      ]);
      
      if (!roadmap) return null;
      
      return {
        ...roadmap,
        topics: topics || []
      };
    } catch (error) {
      console.error('Error getting roadmap with topics:', error);
      return LEARNING_ROADMAPS[roadmapId] || null;
    }
  }

  // Analytics methods
  async getUserAnalytics(userId = null) {
    const uid = userId || this.currentUserId;
    if (!uid) return null;

    try {
      const [profile, progress, sessions] = await Promise.all([
        this.getUserProfile(uid),
        this.getAllUserProgress(uid),
        this.getUserSessions(uid)
      ]);

      return {
        profile: profile?.stats || {},
        progress,
        recentSessions: sessions.slice(0, 10),
        totalSessions: sessions.length
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const dataService = new DataService();
export default dataService;
