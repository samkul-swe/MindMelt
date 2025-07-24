import { 
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from './firebase/firebaseService';

class DataService {
  constructor() {
    this.coursesCache = new Map();
    this.topicsCache = new Map();
    this.currentUserId = null;
  }

  // Set current user (call this when user authenticates)
  setUser(userId) {
    this.currentUserId = userId;
  }

  // Get all courses
  async getCourses() {
    try {
      if (this.coursesCache.size > 0) {
        return Array.from(this.coursesCache.values());
      }

      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      
      const courses = [];
      snapshot.forEach(doc => {
        const course = { id: doc.id, ...doc.data() };
        this.coursesCache.set(doc.id, course);
        courses.push(course);
      });

      console.log(`✅ Retrieved ${courses.length} courses from Firestore`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw error;
    }
  }

  // Get a specific course by ID
  async getCourse(courseId) {
    try {
      if (this.coursesCache.has(courseId)) {
        return this.coursesCache.get(courseId);
      }

      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (courseDoc.exists()) {
        const course = { id: courseDoc.id, ...courseDoc.data() };
        this.coursesCache.set(courseId, course);
        return course;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching course ${courseId}:`, error);
      throw error;
    }
  }

  // Get all topics for a specific course
  async getTopicsForCourse(courseId) {
    try {
      const cacheKey = `course_${courseId}`;
      if (this.topicsCache.has(cacheKey)) {
        return this.topicsCache.get(cacheKey);
      }

      const topicsRef = collection(db, 'topics');
      const q = query(
        topicsRef,
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const topics = [];
      
      snapshot.forEach(doc => {
        topics.push({ id: doc.id, ...doc.data() });
      });

      this.topicsCache.set(cacheKey, topics);
      console.log(`✅ Retrieved ${topics.length} topics for course ${courseId}`);
      return topics;
    } catch (error) {
      console.error(`❌ Error fetching topics for course ${courseId}:`, error);
      throw error;
    }
  }

  // Get a specific topic by ID
  async getTopic(topicId) {
    try {
      const topicRef = doc(db, 'topics', topicId);
      const topicDoc = await getDoc(topicRef);
      
      if (topicDoc.exists()) {
        return { id: topicDoc.id, ...topicDoc.data() };
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching topic ${topicId}:`, error);
      throw error;
    }
  }

  // Get user progress for a specific course
  async getUserCourseProgress(userId, courseId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentProgress = userData.currentProgress || {};
        return currentProgress[courseId] || {
          percentage: 0,
          topics: {}
        };
      }
      
      return { percentage: 0, topics: {} };
    } catch (error) {
      console.error(`❌ Error fetching user progress for course ${courseId}:`, error);
      throw error;
    }
  }

  // Get all user progress
  async getAllUserProgress(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.currentProgress || {};
      }
      
      return {};
    } catch (error) {
      console.error(`❌ Error fetching all user progress:`, error);
      throw error;
    }
  }

  // Update user progress for a topic
  async updateTopicProgress(userId, courseId, topicId, percentage) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      let currentProgress = {};
      if (userDoc.exists()) {
        currentProgress = userDoc.data().currentProgress || {};
      }

      // Initialize course progress if it doesn't exist
      if (!currentProgress[courseId]) {
        currentProgress[courseId] = {
          percentage: 0,
          topics: {}
        };
      }

      // Update topic progress
      currentProgress[courseId].topics[topicId] = {
        percentage: percentage,
        completed: percentage >= 100,
        lastUpdated: serverTimestamp()
      };

      // Calculate overall course progress
      const topics = currentProgress[courseId].topics;
      const topicKeys = Object.keys(topics);
      const totalPercentage = topicKeys.reduce((sum, key) => sum + topics[key].percentage, 0);
      currentProgress[courseId].percentage = topicKeys.length > 0 ? Math.round(totalPercentage / topicKeys.length) : 0;

      // Update user document
      await updateDoc(userRef, {
        currentProgress: currentProgress,
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Updated progress for topic ${topicId} in course ${courseId}: ${percentage}%`);
      return currentProgress[courseId];
    } catch (error) {
      console.error(`❌ Error updating topic progress:`, error);
      throw error;
    }
  }

  // Mark topic as completed
  async markTopicCompleted(userId, courseId, topicId) {
    return await this.updateTopicProgress(userId, courseId, topicId, 100);
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentProgress = userData.currentProgress || {};
        
        // Calculate statistics
        const totalCourses = Object.keys(currentProgress).length;
        const completedCourses = Object.values(currentProgress).filter(course => course.percentage === 100).length;
        
        let totalTopics = 0;
        let completedTopics = 0;
        
        Object.values(currentProgress).forEach(courseProgress => {
          const topics = courseProgress.topics || {};
          totalTopics += Object.keys(topics).length;
          completedTopics += Object.values(topics).filter(topic => topic.completed).length;
        });

        return {
          totalLearningTime: userData.totalLearningTime || 0,
          completedSessions: userData.completedSessions || 0,
          totalCourses,
          completedCourses,
          totalTopics,
          completedTopics,
          joinedAt: userData.joinedAt,
          lastActiveAt: userData.lastActiveAt
        };
      }
      
      return {
        totalLearningTime: 0,
        completedSessions: 0,
        totalCourses: 0,
        completedCourses: 0,
        totalTopics: 0,
        completedTopics: 0
      };
    } catch (error) {
      console.error(`❌ Error fetching user stats:`, error);
      throw error;
    }
  }

  // Search courses by name or category
  async searchCourses(searchTerm) {
    try {
      const courses = await this.getCourses();
      const searchLower = searchTerm.toLowerCase();
      
      return courses.filter(course => 
        course.name.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('❌ Error searching courses:', error);
      throw error;
    }
  }

  // Search topics by name
  async searchTopics(searchTerm, courseId = null) {
    try {
      let topics = [];
      
      if (courseId) {
        topics = await this.getTopicsForCourse(courseId);
      } else {
        // Get all topics (this might be expensive for large datasets)
        const topicsRef = collection(db, 'topics');
        const snapshot = await getDocs(topicsRef);
        snapshot.forEach(doc => {
          topics.push({ id: doc.id, ...doc.data() });
        });
      }
      
      const searchLower = searchTerm.toLowerCase();
      return topics.filter(topic => 
        topic.name.toLowerCase().includes(searchLower) ||
        topic.description.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('❌ Error searching topics:', error);
      throw error;
    }
  }

  // Clear cache (call this when data might have changed)
  clearCache() {
    this.coursesCache.clear();
    this.topicsCache.clear();
  }

  // Legacy methods for backward compatibility with existing code
  async getRoadmap(roadmapId) {
    return await this.getCourse(roadmapId);
  }

  async getRoadmapTopics(roadmapId) {
    return await this.getTopicsForCourse(roadmapId);
  }

  async getUserProgress(roadmapId) {
    if (!this.currentUserId) {
      return { topics: {} };
    }
    
    const progress = await this.getUserCourseProgress(this.currentUserId, roadmapId);
    return { topics: progress.topics || {} };
  }

  async enrollUserInRoadmap(roadmapId, userId) {
    // Initialize empty progress for the roadmap
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentProgress = userData.currentProgress || {};
      
      if (!currentProgress[roadmapId]) {
        currentProgress[roadmapId] = {
          percentage: 0,
          topics: {}
        };
        
        await updateDoc(userRef, {
          currentProgress: currentProgress,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return true;
  }
}

// Create and export singleton instance
const dataService = new DataService();
export default dataService;
