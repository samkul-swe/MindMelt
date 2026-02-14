import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import testService from '../services/testService.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * POST /api/test/start
 * Start a skill validation test
 */
router.post('/start', async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }

    console.log(`[Test] Starting test for ${targetRole}`);

    // Get questions for the role
    const questions = await testService.getTestQuestions(targetRole);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No test questions available for ${targetRole} yet. Skip to projects.`
      });
    }

    // Create test session
    const testSession = await testService.startTest(userId, targetRole);

    res.json({
      success: true,
      testId: testSession.id,
      questions,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error('[Test] Start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start test'
    });
  }
});

/**
 * POST /api/test/submit
 * Submit test answers and get results
 */
router.post('/submit', async (req, res) => {
  try {
    const { testId, answers } = req.body;

    if (!testId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Test ID and answers are required'
      });
    }

    console.log(`[Test] Submitting test ${testId}`);

    // Grade the test
    const results = await testService.submitTest(testId, answers);

    res.json({
      success: true,
      results: {
        score: results.score,
        totalQuestions: results.totalQuestions,
        percentage: results.percentage,
        categoryScores: results.categoryScores,
        strengths: results.strengths,
        weakAreas: results.weakAreas,
        recommendations: results.recommendations,
        answers: results.answers // Includes explanations
      }
    });

  } catch (error) {
    console.error('[Test] Submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test'
    });
  }
});

/**
 * GET /api/test/results/:testId
 * Get test results
 */
router.get('/results/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const results = await testService.getTestResults(testId);

    if (!results) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('[Test] Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test results'
    });
  }
});

export default router;