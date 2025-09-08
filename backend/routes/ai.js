import express from 'express';
import aiService from '../services/aiService.js';
import authService from '../services/authService.js';
import { authenticateToken } from '../utils/middleware.js';

const router = express.Router();

async function getApiKeyForUser(userId) {
  const envApiKey = process.env.GEMINI_API_KEY;
  if (envApiKey) {
    console.log('🔑 Using GEMINI_API_KEY from environment variables');
    return envApiKey;
  }

  const user = await authService.getUser(userId);
  if (user && user.aiApiKey) {
    console.log('🔑 Using user\'s personal API key');
    return user.aiApiKey;
  }

  return null;
}

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

router.post('/socratic-response', authenticateToken, async (req, res) => {
  try {
    const { concept, userResponse, learningPath, questioningStyle, returnParsed } = req.body;
    
    if (!concept || !userResponse) {
      return res.status(400).json({
        success: false,
        message: 'Concept and user response are required'
      });
    }

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

router.post('/hint-response', authenticateToken, async (req, res) => {
  try {
    const { concept, conversationContext, learningPath, questioningStyle } = req.body;
    
    if (!concept) {
      return res.status(400).json({
        success: false,
        message: 'Concept is required'
      });
    }

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

router.post('/assess-understanding', authenticateToken, async (req, res) => {
  try {
    const { concept, userResponse } = req.body;
    
    if (!concept || !userResponse) {
      return res.status(400).json({
        success: false,
        message: 'Concept and user response are required'
      });
    }

    const apiKey = await getApiKeyForUser(req.user.uid);
    if (!apiKey) {
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

router.post('/daily-summary', authenticateToken, async (req, res) => {
  try {
    const { sessionsData } = req.body;
    
    if (!sessionsData) {
      return res.status(400).json({
        success: false,
        message: 'Sessions data is required'
      });
    }

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

function assessBasicQuality(userResponse) {
  const response = userResponse.toLowerCase();
  let score = 30;
  
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
