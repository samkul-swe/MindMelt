import express from 'express';
import aiService from '../services/aiService.js';
import authService from '../services/authService.js';
import { authenticateToken } from '../utils/middleware.js';

const router = express.Router();

// Helper function to get API key (environment variable takes precedence)
async function getApiKeyForUser(userId) {
  // First check for environment variable (server-wide API key)
  const envApiKey = process.env.GEMINI_API_KEY;
  if (envApiKey) {
    console.log('🔑 Using GEMINI_API_KEY from environment variables');
    return envApiKey;
  }

  // Fallback to user's personal API key
  const user = await authService.getUser(userId);
  if (user && user.aiApiKey) {
    console.log('🔑 Using user\'s personal API key');
    return user.aiApiKey;
  }

  return null;
}

// Test API key (still accepts API key from request for testing purposes)
router.post('/test-key', authenticateToken, async (req, res) => {
  console.log('🔴 ==> BACKEND: /api/ai/test-key endpoint called');
  console.log('📋 Backend: Request body keys:', Object.keys(req.body));
  console.log('👤 Backend: User ID:', req.user?.uid);
  
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      console.log('❌ Backend: No API key provided in request');
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }

    console.log('🔄 Backend: Calling aiService.testApiKey...');
    const result = await aiService.testApiKey(apiKey);
    console.log('✅ Backend: aiService.testApiKey completed');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Backend: Test API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test API key'
    });
  }
});

// Test environment API key (uses GEMINI_API_KEY)
router.post('/test-env-key', authenticateToken, async (req, res) => {
  console.log('🔴 ==> BACKEND: /api/ai/test-env-key endpoint called');
  console.log('👤 Backend: User ID:', req.user?.uid);
  
  try {
    const envApiKey = process.env.GEMINI_API_KEY;
    
    if (!envApiKey) {
      console.log('❌ Backend: No GEMINI_API_KEY environment variable set');
      return res.status(400).json({
        success: false,
        message: 'GEMINI_API_KEY environment variable not set',
        debug: {
          hasEnvKey: false,
          envKeyLength: 0
        }
      });
    }

    console.log('🔍 Testing GEMINI_API_KEY from environment variables...');
    console.log('🔄 Backend: Calling aiService.testApiKey with env key...');
    const result = await aiService.testApiKey(envApiKey);
    console.log('✅ Backend: Environment key test completed');
    
    res.json({
      success: true,
      data: {
        ...result,
        source: 'environment_variable',
        keyLength: envApiKey.length
      }
    });
  } catch (error) {
    console.error('❌ Backend: Test environment API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test environment API key',
      debug: {
        hasEnvKey: !!process.env.GEMINI_API_KEY,
        envKeyLength: process.env.GEMINI_API_KEY?.length || 0
      }
    });
  }
});

// Get Socratic response
router.post('/socratic-response', authenticateToken, async (req, res) => {
  try {
    const { concept, userResponse, learningPath, questioningStyle, returnParsed } = req.body;
    
    if (!concept || !userResponse) {
      return res.status(400).json({
        success: false,
        message: 'Concept and user response are required'
      });
    }

    // Get API key (environment variable or user's key)
    const apiKey = await getApiKeyForUser(req.user.uid);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '🔑 AI API key not found. Please set GEMINI_API_KEY environment variable or set your personal API key in MindMelt settings to start learning!'
      });
    }

    const response = await aiService.getSocraticResponse(
      concept, 
      userResponse, 
      learningPath, 
      questioningStyle, 
      apiKey, 
      returnParsed
    );
    
    res.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('Socratic response error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get Socratic response'
    });
  }
});

// Get hint response
router.post('/hint-response', authenticateToken, async (req, res) => {
  try {
    const { concept, conversationContext, learningPath, questioningStyle } = req.body;
    
    if (!concept) {
      return res.status(400).json({
        success: false,
        message: 'Concept is required'
      });
    }

    // Get API key (environment variable or user's key)
    const apiKey = await getApiKeyForUser(req.user.uid);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '🔑 AI API key not found. Please set GEMINI_API_KEY environment variable or set your personal API key in MindMelt settings!'
      });
    }

    const response = await aiService.getHintResponse(
      concept, 
      conversationContext, 
      learningPath, 
      questioningStyle, 
      apiKey
    );
    
    res.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('Hint response error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get hint response'
    });
  }
});

// Assess understanding quality
router.post('/assess-understanding', authenticateToken, async (req, res) => {
  try {
    const { concept, userResponse } = req.body;
    
    if (!concept || !userResponse) {
      return res.status(400).json({
        success: false,
        message: 'Concept and user response are required'
      });
    }

    // Get API key (environment variable or user's key)
    const apiKey = await getApiKeyForUser(req.user.uid);
    if (!apiKey) {
      // Return basic assessment if no API key using a fallback function
      const basicAssessment = assessBasicQuality(userResponse);
      
      return res.json({
        success: true,
        ...basicAssessment
      });
    }

    const assessment = await aiService.assessUnderstandingQuality(concept, userResponse, apiKey);
    
    res.json({
      success: true,
      ...assessment
    });
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assess understanding'
    });
  }
});

// Search CS topics
router.post('/search-topics', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Get API key (environment variable or user's key)
    const apiKey = await getApiKeyForUser(req.user.uid);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '🔑 AI API key not found. Please set GEMINI_API_KEY environment variable or set your personal API key in MindMelt settings to search for topics!'
      });
    }

    const topics = await aiService.searchCSTopics(query, apiKey);
    
    res.json(topics);
  } catch (error) {
    console.error('Search topics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search topics'
    });
  }
});

// Get topic details
router.post('/topic-details', authenticateToken, async (req, res) => {
  try {
    const { topicName } = req.body;
    
    if (!topicName) {
      return res.status(400).json({
        success: false,
        message: 'Topic name is required'
      });
    }

    // Get API key (environment variable or user's key)
    const apiKey = await getApiKeyForUser(req.user.uid);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '🔑 AI API key not found. Please set GEMINI_API_KEY environment variable or set your personal API key in MindMelt settings to get topic details!'
      });
    }

    const details = await aiService.getTopicDetails(topicName, apiKey);
    
    res.json(details);
  } catch (error) {
    console.error('Topic details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get topic details'
    });
  }
});

// Generate daily summary
router.post('/daily-summary', authenticateToken, async (req, res) => {
  try {
    const { sessionsData } = req.body;
    
    if (!sessionsData) {
      return res.status(400).json({
        success: false,
        message: 'Sessions data is required'
      });
    }

    // Get API key (environment variable or user's key)
    const apiKey = await getApiKeyForUser(req.user.uid);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '🔑 AI API key not found. Please set GEMINI_API_KEY environment variable or set your personal API key in MindMelt settings!'
      });
    }

    const summary = await aiService.generateDailySummary(sessionsData, apiKey);
    
    res.json({
      success: true,
      summary: summary
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate daily summary'
    });
  }
});

// Validate API key format (doesn't require stored API key)
router.post('/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    const validation = aiService.validateApiKey(apiKey);
    
    res.json({
      success: true,
      ...validation
    });
  } catch (error) {
    console.error('Validate API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate API key'
    });
  }
});

// Basic quality assessment fallback function
function assessBasicQuality(userResponse) {
  const response = userResponse.toLowerCase();
  let score = 30; // Base score
  
  if (response.length > 100) score += 20;
  else if (response.length > 50) score += 10;

  const csTerms = ['algorithm', 'data structure', 'complexity', 'memory', 'cpu', 'network', 'database', 
                   'function', 'variable', 'array', 'loop', 'condition', 'binary', 'queue', 'stack'];
  const termsUsed = csTerms.filter(term => response.includes(term)).length;
  score += Math.min(25, termsUsed * 5);

  const thinkingWords = ['because', 'since', 'therefore', 'however', 'although', 'why', 'how', 'what if'];
  const thinkingUsed = thinkingWords.filter(word => response.includes(word)).length;
  score += Math.min(15, thinkingUsed * 3);

  if (response.includes('example') || response.includes('like') || response.includes('such as')) {
    score += 10;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    feedback: score > 70 ? "Good depth and detail" : 
              score > 50 ? "Shows basic understanding" : 
              "Could use more detail and examples"
  };
}

export default router;
