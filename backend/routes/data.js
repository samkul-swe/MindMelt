const express = require('express');
const dataService = require('../services/dataService');

const router = express.Router();

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await dataService.getCourses();
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Courses fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get specific course by ID
router.get('/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await dataService.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Course fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get topics for a specific course
router.get('/courses/:courseId/topics', async (req, res) => {
  try {
    const { courseId } = req.params;
    const topics = await dataService.getTopicsForCourse(courseId);
    
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

// Get specific topic by ID
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

// Search courses
router.get('/search/courses', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const courses = await dataService.searchCourses(q.trim());
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Course search error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Search topics
router.get('/search/topics', async (req, res) => {
  try {
    const { q, courseId } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const topics = await dataService.searchTopics(q.trim(), courseId);
    
    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Topic search error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get course statistics
router.get('/courses/:courseId/stats', async (req, res) => {
  try {
    const { courseId } = req.params;
    const stats = await dataService.getCourseStats(courseId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Course stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
