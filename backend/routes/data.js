import express from 'express';
import dataService from '../services/dataService.js';

const router = express.Router();

router.get('/roadmaps', async (req, res) => {
  try {
    const roadmaps = await dataService.getRoadmaps();
    
    res.json({
      success: true,
      data: roadmaps
    });
  } catch (error) {
    console.error('Roadmaps fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/roadmaps/:roadmapId', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await dataService.getRoadmap(roadmapId);
    const topics = await dataService.getRoadmapTopics(roadmapId, roadmap.topicCount);
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.json({
      success: true,
      roadmap : {
        details : roadmap,
        topics : topics
      }
    });
  } catch (error) {
    console.error('Roadmap fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;