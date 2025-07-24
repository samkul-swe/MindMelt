// Firebase Firestore service for MindMelt
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  ROADMAPS: 'roadmaps',
  TOPICS: 'topics',
  USER_PROGRESS: 'userProgress',
  LEARNING_SESSIONS: 'learningSessions',
  USER_ROADMAPS: 'userRoadmaps'
};

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const userService = {
  // Create or update user profile
  async createUser(userId, userData) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          totalSessions: 0,
          totalQuestions: 0,
          totalCorrectAnswers: 0,
          totalStudyTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageScore: 0,
          roadmapsStarted: 0,
          roadmapsCompleted: 0,
          topicsCompleted: 0
        },
        preferences: {
          learningPath: 'comprehensive',
          questioningStyle: 'socratic',
          difficulty: 'intermediate',
          sessionDuration: 480, // 8 minutes in seconds
          hintsEnabled: true,
          notificationsEnabled: true
        }
      };
      
      await setDoc(userRef, userDoc);
      return userDoc;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user profile
  async getUser(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUser(userId, updates) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      return updateData;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update user stats
  async updateUserStats(userId, stats) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        [`stats.${Object.keys(stats)[0]}`]: Object.values(stats)[0],
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }
};

// ============================================================================
// ROADMAP OPERATIONS
// ============================================================================

export const roadmapService = {
  // Create a new roadmap
  async createRoadmap(roadmapData) {
    try {
      const roadmapRef = doc(db, COLLECTIONS.ROADMAPS, roadmapData.id);
      const roadmapDoc = {
        ...roadmapData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        enrolledUsers: 0,
        completionRate: 0
      };
      
      await setDoc(roadmapRef, roadmapDoc);
      return roadmapDoc;
    } catch (error) {
      console.error('Error creating roadmap:', error);
      throw error;
    }
  },

  // Get all roadmaps
  async getAllRoadmaps() {
    try {
      const roadmapsQuery = query(
        collection(db, COLLECTIONS.ROADMAPS),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(roadmapsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting roadmaps:', error);
      throw error;
    }
  },

  // Get roadmap by ID
  async getRoadmap(roadmapId) {
    try {
      const roadmapRef = doc(db, COLLECTIONS.ROADMAPS, roadmapId);
      const roadmapSnap = await getDoc(roadmapRef);
      
      if (roadmapSnap.exists()) {
        return { id: roadmapSnap.id, ...roadmapSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting roadmap:', error);
      throw error;
    }
  },

  // Update roadmap
  async updateRoadmap(roadmapId, updates) {
    try {
      const roadmapRef = doc(db, COLLECTIONS.ROADMAPS, roadmapId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(roadmapRef, updateData);
      return updateData;
    } catch (error) {
      console.error('Error updating roadmap:', error);
      throw error;
    }
  }
};

// ============================================================================
// TOPIC OPERATIONS
// ============================================================================

export const topicService = {
  // Create topics for a roadmap
  async createTopicsForRoadmap(roadmapId, topics) {
    try {
      const batch = [];
      
      for (const topic of topics) {
        const topicRef = doc(db, COLLECTIONS.TOPICS, `${roadmapId}_${topic.id}`);
        const topicDoc = {
          ...topic,
          roadmapId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          completionCount: 0,
          averageScore: 0,
          averageTime: 0
        };
        
        batch.push(() => setDoc(topicRef, topicDoc));
      }
      
      // Execute all topic creations
      await Promise.all(batch.map(fn => fn()));
      
      return topics;
    } catch (error) {
      console.error('Error creating topics:', error);
      throw error;
    }
  },

  // Get topics for a roadmap
  async getTopicsForRoadmap(roadmapId) {
    try {
      const topicsQuery = query(
        collection(db, COLLECTIONS.TOPICS),
        where('roadmapId', '==', roadmapId),
        orderBy('id', 'asc')
      );
      
      const snapshot = await getDocs(topicsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting topics:', error);
      throw error;
    }
  },

  // Get single topic
  async getTopic(roadmapId, topicId) {
    try {
      const topicRef = doc(db, COLLECTIONS.TOPICS, `${roadmapId}_${topicId}`);
      const topicSnap = await getDoc(topicRef);
      
      if (topicSnap.exists()) {
        return { id: topicSnap.id, ...topicSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting topic:', error);
      throw error;
    }
  }
};

// ============================================================================
// USER PROGRESS OPERATIONS
// ============================================================================

export const progressService = {
  // Get user progress for a roadmap
  async getUserProgress(userId, roadmapId) {
    try {
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, `${userId}_${roadmapId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        return { id: progressSnap.id, ...progressSnap.data() };
      } else {
        // Return default progress structure
        return {
          userId,
          roadmapId,
          topics: {},
          overallProgress: 0,
          startedAt: null,
          completedAt: null,
          totalTimeSpent: 0,
          currentStreak: 0
        };
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  },

  // Update progress for a specific topic
  async updateTopicProgress(userId, roadmapId, topicId, progressData) {
    try {
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, `${userId}_${roadmapId}`);
      
      // Check if progress document exists
      const progressSnap = await getDoc(progressRef);
      
      if (!progressSnap.exists()) {
        // Create initial progress document
        const initialProgress = {
          userId,
          roadmapId,
          topics: {
            [topicId]: {
              ...progressData,
              updatedAt: serverTimestamp()
            }
          },
          overallProgress: 0,
          startedAt: serverTimestamp(),
          completedAt: null,
          totalTimeSpent: 0,
          currentStreak: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(progressRef, initialProgress);
      } else {
        // Update existing progress
        await updateDoc(progressRef, {
          [`topics.${topicId}`]: {
            ...progressData,
            updatedAt: serverTimestamp()
          },
          updatedAt: serverTimestamp()
        });
      }
      
      // Calculate overall progress
      await this.calculateOverallProgress(userId, roadmapId);
      
    } catch (error) {
      console.error('Error updating topic progress:', error);
      throw error;
    }
  },

  // Calculate overall progress for a roadmap
  async calculateOverallProgress(userId, roadmapId) {
    try {
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, `${userId}_${roadmapId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (!progressSnap.exists()) return;
      
      const data = progressSnap.data();
      const topics = data.topics || {};
      
      // Calculate average progress across all topics
      const topicIds = Object.keys(topics);
      if (topicIds.length === 0) return;
      
      const totalProgress = topicIds.reduce((sum, topicId) => {
        return sum + (topics[topicId].progress || 0);
      }, 0);
      
      const overallProgress = Math.round(totalProgress / topicIds.length);
      
      // Check if roadmap is completed
      const completedAt = overallProgress >= 100 ? serverTimestamp() : null;
      
      await updateDoc(progressRef, {
        overallProgress,
        completedAt,
        updatedAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error calculating overall progress:', error);
      throw error;
    }
  },

  // Get all user progress across roadmaps
  async getAllUserProgress(userId) {
    try {
      const progressQuery = query(
        collection(db, COLLECTIONS.USER_PROGRESS),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(progressQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all user progress:', error);
      throw error;
    }
  }
};

// ============================================================================
// LEARNING SESSION OPERATIONS
// ============================================================================

export const sessionService = {
  // Create a new learning session
  async createSession(userId, sessionData) {
    try {
      const sessionRef = await addDoc(collection(db, COLLECTIONS.LEARNING_SESSIONS), {
        userId,
        ...sessionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: sessionRef.id, ...sessionData };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update existing session
  async updateSession(sessionId, updates) {
    try {
      const sessionRef = doc(db, COLLECTIONS.LEARNING_SESSIONS, sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Get session by ID
  async getSession(sessionId) {
    try {
      const sessionRef = doc(db, COLLECTIONS.LEARNING_SESSIONS, sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        return { id: sessionSnap.id, ...sessionSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  },

  // Get user sessions
  async getUserSessions(userId, limitCount = 50) {
    try {
      const sessionsQuery = query(
        collection(db, COLLECTIONS.LEARNING_SESSIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  },

  // Delete session
  async deleteSession(sessionId) {
    try {
      const sessionRef = doc(db, COLLECTIONS.LEARNING_SESSIONS, sessionId);
      await deleteDoc(sessionRef);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
};

// ============================================================================
// USER ROADMAP ENROLLMENT
// ============================================================================

export const enrollmentService = {
  // Enroll user in a roadmap
  async enrollInRoadmap(userId, roadmapId) {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USER_ROADMAPS, `${userId}_${roadmapId}`);
      const enrollmentDoc = {
        userId,
        roadmapId,
        enrolledAt: serverTimestamp(),
        status: 'active', // active, paused, completed
        progress: 0,
        currentTopicId: 1,
        timeSpent: 0,
        sessionsCount: 0
      };
      
      await setDoc(enrollmentRef, enrollmentDoc);
      
      // Increment roadmap enrollment count
      const roadmapRef = doc(db, COLLECTIONS.ROADMAPS, roadmapId);
      await updateDoc(roadmapRef, {
        enrolledUsers: increment(1)
      });
      
      return enrollmentDoc;
    } catch (error) {
      console.error('Error enrolling in roadmap:', error);
      throw error;
    }
  },

  // Get user roadmap enrollment
  async getUserRoadmapEnrollment(userId, roadmapId) {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USER_ROADMAPS, `${userId}_${roadmapId}`);
      const enrollmentSnap = await getDoc(enrollmentRef);
      
      if (enrollmentSnap.exists()) {
        return { id: enrollmentSnap.id, ...enrollmentSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting enrollment:', error);
      throw error;
    }
  },

  // Get all user roadmap enrollments
  async getUserEnrollments(userId) {
    try {
      const enrollmentsQuery = query(
        collection(db, COLLECTIONS.USER_ROADMAPS),
        where('userId', '==', userId),
        orderBy('enrolledAt', 'desc')
      );
      
      const snapshot = await getDocs(enrollmentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      throw error;
    }
  },

  // Update enrollment status
  async updateEnrollment(userId, roadmapId, updates) {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USER_ROADMAPS, `${userId}_${roadmapId}`);
      await updateDoc(enrollmentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  }
};

// ============================================================================
// BATCH OPERATIONS & UTILITIES
// ============================================================================

export const firebaseUtils = {
  // Initialize default roadmaps (run once)
  async initializeDefaultRoadmaps(roadmapsData) {
    try {
      console.log('🔄 Initializing default roadmaps...');
      
      for (const [roadmapId, roadmapData] of Object.entries(roadmapsData)) {
        // Check if roadmap already exists
        const existingRoadmap = await roadmapService.getRoadmap(roadmapId);
        
        if (!existingRoadmap) {
          console.log(`📚 Creating roadmap: ${roadmapData.title}`);
          await roadmapService.createRoadmap(roadmapData);
          
          // Create topics for this roadmap
          if (roadmapData.topics && roadmapData.topics.length > 0) {
            console.log(`📖 Creating ${roadmapData.topics.length} topics for ${roadmapId}`);
            await topicService.createTopicsForRoadmap(roadmapId, roadmapData.topics);
          }
        } else {
          console.log(`✅ Roadmap ${roadmapId} already exists`);
        }
      }
      
      console.log('✅ Default roadmaps initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing roadmaps:', error);
      throw error;
    }
  },

  // Migrate anonymous user data to Firebase
  async migrateAnonymousData(userId, anonymousData) {
    try {
      console.log('🔄 Migrating anonymous data to Firebase...');
      
      // Create user profile with anonymous data
      await userService.createUser(userId, {
        username: anonymousData.name || 'New User',
        email: null,
        isAnonymous: false,
        migratedFrom: 'anonymous',
        stats: {
          totalSessions: anonymousData.sessionCount || 0,
          totalQuestions: anonymousData.totalQuestions || 0,
          totalCorrectAnswers: 0,
          totalStudyTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageScore: anonymousData.averageScore || 0,
          roadmapsStarted: 0,
          roadmapsCompleted: 0,
          topicsCompleted: 0
        }
      });
      
      console.log('✅ Anonymous data migrated successfully');
    } catch (error) {
      console.error('❌ Error migrating anonymous data:', error);
      throw error;
    }
  },

  // Clean up old sessions (utility function)
  async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // This would require a cloud function in production
      console.log(`🧹 Cleanup would remove sessions older than ${daysOld} days`);
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      throw error;
    }
  }
};

export default {
  userService,
  roadmapService,
  topicService,
  progressService,
  sessionService,
  enrollmentService,
  firebaseUtils
};
