const express = require('express');
const dataService = require('../services/dataService');

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
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Roadmap fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/roadmaps/:roadmapId/topics', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const topics = await dataService.getTopicsForRoadmap(roadmapId);
    
    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Topics fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await dataService.getTopic(topicId);
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Topic fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/roadmaps/:roadmapId/stats', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const stats = await dataService.getRoadmapStats(roadmapId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Roadmap stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;