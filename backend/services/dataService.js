const { db } = require('../config/firebase');

class DataService {
  constructor() {
    this.coursesCache = new Map();
    this.topicsCache = new Map();
  }

  // Get all courses
  async getCourses() {
    try {
      if (this.coursesCache.size > 0) {
        return Array.from(this.coursesCache.values());
      }

      const coursesSnapshot = await db.collection('courses').get();
      const courses = [];
      
      coursesSnapshot.forEach(doc => {
        const course = { id: doc.id, ...doc.data() };
        this.coursesCache.set(doc.id, course);
        courses.push(course);
      });

      console.log(`✅ Retrieved ${courses.length} courses from Firestore`);
      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  }

  // Get a specific course by ID
  async getCourse(courseId) {
    try {
      if (this.coursesCache.has(courseId)) {
        return this.coursesCache.get(courseId);
      }

      const courseDoc = await db.collection('courses').doc(courseId).get();
      
      if (courseDoc.exists()) {
        const course = { id: courseDoc.id, ...courseDoc.data() };
        this.coursesCache.set(courseId, course);
        return course;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching course ${courseId}:`, error);
      throw new Error(`Failed to fetch course: ${error.message}`);
    }
  }

  // Get all topics for a specific course
  async getTopicsForCourse(courseId) {
    try {
      const cacheKey = `course_${courseId}`;
      if (this.topicsCache.has(cacheKey)) {
        return this.topicsCache.get(cacheKey);
      }

      const topicsSnapshot = await db.collection('topics')
        .where('courseId', '==', courseId)
        .orderBy('order', 'asc')
        .get();
      
      const topics = [];
      topicsSnapshot.forEach(doc => {
        topics.push({ id: doc.id, ...doc.data() });
      });

      this.topicsCache.set(cacheKey, topics);
      console.log(`✅ Retrieved ${topics.length} topics for course ${courseId}`);
      return topics;
    } catch (error) {
      console.error(`❌ Error fetching topics for course ${courseId}:`, error);
      throw new Error(`Failed to fetch topics: ${error.message}`);
    }
  }

  // Get a specific topic by ID
  async getTopic(topicId) {
    try {
      const topicDoc = await db.collection('topics').doc(topicId).get();
      
      if (topicDoc.exists()) {
        return { id: topicDoc.id, ...topicDoc.data() };
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching topic ${topicId}:`, error);
      throw new Error(`Failed to fetch topic: ${error.message}`);
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
      throw new Error(`Failed to search courses: ${error.message}`);
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
        const topicsSnapshot = await db.collection('topics').get();
        topicsSnapshot.forEach(doc => {
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
      throw new Error(`Failed to search topics: ${error.message}`);
    }
  }

  // Clear cache
  clearCache() {
    this.coursesCache.clear();
    this.topicsCache.clear();
  }

  // Get course statistics
  async getCourseStats(courseId) {
    try {
      // This would require aggregation queries or maintaining counters
      // For now, return basic structure
      return {
        totalTopics: 0,
        enrolledUsers: 0,
        averageCompletion: 0
      };
    } catch (error) {
      console.error(`❌ Error fetching course stats for ${courseId}:`, error);
      throw new Error(`Failed to fetch course stats: ${error.message}`);
    }
  }
}

module.exports = new DataService();
