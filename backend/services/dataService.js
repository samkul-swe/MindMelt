import { db, roadmapStorage, topicStorage } from '../config/firebase.js';

class DataService {
  constructor() {
    this.roadmapsCache = new Map();
    this.topicsCache = new Map();
  }

  async getRoadmaps() {
    try {
      if (this.roadmapsCache.size > 0) {
        return Array.from(this.roadmapsCache.values());
      }

      const roadmapsSnapshot = await roadmapStorage.getAllRoadmaps();
      const roadmaps = [];

      roadmapsSnapshot.forEach(doc => {
        const roadmap = { id: doc.id, ...doc };
        this.roadmapsCache.set(doc.id, roadmap);
        roadmaps.push(roadmap);
      });

      console.log(`✅ Retrieved ${roadmaps.length} roadmaps from Firestore`);
      return roadmaps;
    } catch (error) {
      console.error('❌ Error fetching roadmaps:', error);
      throw new Error(`Failed to fetch roadmaps: ${error.message}`);
    }
  }

  async getRoadmap(roadmapId) {
    try {
      if (this.roadmapsCache.has(roadmapId)) {
        return this.roadmapsCache.get(roadmapId);
      }

      const roadmapDoc = await roadmapStorage.findById(roadmapId);
      
      if (roadmapDoc != null) {
        const roadmap = { id: roadmapDoc.id, ...roadmapDoc };
        this.roadmapsCache.set(roadmapId, roadmap);
        return roadmap;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error fetching roadmap ${roadmapId}:`, error);
      throw new Error(`Failed to fetch roadmap: ${error.message}`);
    }
  }

  async getRoadmapTopics(roadmapId, topicCount) {
    try {
      const cacheKey = `roadmap_${roadmapId}`;
      if (this.topicsCache.has(cacheKey)) {
        return this.topicsCache.get(cacheKey);
      }

      const topicsSnapshot = await topicStorage.findAllTopicsByRoadmapId(roadmapId, topicCount);
      
      const topics = [];
      topicsSnapshot.forEach(doc => {
        topics.push({ id: doc.id, ...doc });
      });

      this.topicsCache.set(cacheKey, topics);
      console.log(`✅ Retrieved ${topics.length} topics for roadmap ${roadmapId}`);
      return topics;
    } catch (error) {
      console.error(`❌ Error fetching topics for roadmap ${roadmapId}:`, error);
      throw new Error(`Failed to fetch topics: ${error.message}`);
    }
  }

  clearCache() {
    this.roadmapsCache.clear();
    this.topicsCache.clear();
  }
}

export default new DataService();