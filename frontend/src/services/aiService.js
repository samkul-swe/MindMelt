const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('mindmelt_user') || '{}');
  return user.token;
};

async function makeBackendApiCall(endpoint, data) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/ai/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API call failed with status ${response.status}`);
  }

  return await response.json();
}

export function getApiKey() {
  return process.env.REACT_APP_AI_API_KEY || 
         localStorage.getItem('mindmelt_ai_key') || 
         null;
}

export function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, message: 'API key is required for MindMelt to work' };
  }
  
  if (!apiKey.startsWith('AIza')) {
    return { valid: false, message: 'AI API key should start with "AIza"' };
  }
  
  if (apiKey.length < 30) {
    return { valid: false, message: 'API key appears to be too short for AI' };
  }
  
  return { valid: true, message: 'API key format looks correct! 🎉' };
}

export async function getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey, returnParsed = false) {
  const finalApiKey = apiKey || getApiKey();
 
  console.log('=== MINDMELT FRONTEND TO BACKEND API CALL ===');
  console.log('Learning CS concept:', concept);
  console.log('Learning path:', learningPath);
  console.log('Questioning style:', questioningStyle);
  console.log('API Key available:', !!finalApiKey);
 
  if (!finalApiKey) {
    throw new Error('🔑 AI API key not found. Please set your API key in MindMelt settings to start learning!');
  }

  try {
    const result = await makeBackendApiCall('socratic-response', {
      concept,
      userResponse,
      learningPath,
      questioningStyle,
      apiKey: finalApiKey,
      returnParsed
    });
    
    console.log('✅ MindMelt Frontend: Backend API Response received successfully');
    return result.response;
  } catch (error) {
    console.error('❌ MindMelt Frontend: Backend API call failed:', error);
    throw error;
  }
}

export async function getSocraticResponseWithMetadata(concept, userResponse, learningPath, questioningStyle, apiKey) {
  return getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey, true);
}

export async function getHintResponse(concept, conversationContext, learningPath, questioningStyle, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    throw new Error('🔑 AI API key not found. Please set your API key in MindMelt settings to start learning!');
  }

  try {
    const result = await makeBackendApiCall('hint-response', {
      concept,
      conversationContext,
      learningPath,
      questioningStyle,
      apiKey: finalApiKey
    });
    
    console.log('💡 MindMelt Frontend: Hint generated successfully');
    return result.response;
  } catch (error) {
    console.error('❌ MindMelt Frontend: Hint API call failed:', error);
    throw error;
  }
}

export async function assessUnderstandingQuality(concept, userResponse, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    return { score: 50, feedback: "Unable to assess - no API key available" };
  }

  try {
    const result = await makeBackendApiCall('assess-understanding', {
      concept,
      userResponse,
      apiKey: finalApiKey
    });
    
    console.log('📊 MindMelt Frontend: Understanding assessment completed');
    return result;
  } catch (error) {
    console.error('❌ MindMelt Frontend: Assessment API call failed:', error);
    return assessBasicQuality(userResponse);
  }
}

export async function searchCSTopics(query, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    throw new Error('🔑 AI API key not found. Please set your API key in MindMelt settings to search for topics!');
  }

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    console.log('🔍 Frontend Fast AI Search:', query.trim());
    
    const topics = await makeBackendApiCall('search-topics', {
      query: query.trim(),
      apiKey: finalApiKey
    });
    
    console.log(`✅ Frontend received ${topics.length} topics from backend`);
    return topics;
  } catch (error) {
    console.error('❌ Frontend AI search failed:', error);
    throw error;
  }
}

export async function getTopicDetails(topicName, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    throw new Error('🔑 AI API key not found. Please set your API key in MindMelt settings to get topic details!');
  }

  try {
    const details = await makeBackendApiCall('topic-details', {
      topicName,
      apiKey: finalApiKey
    });
    
    console.log('📚 MindMelt Frontend: Topic details received from backend');
    return details;
  } catch (error) {
    console.error('❌ Frontend topic details failed:', error);
    return getDefaultTopicDetails(topicName);
  }
}

export async function testApiKey(apiKey) {
  try {
    const result = await makeBackendApiCall('test-key', {
      apiKey
    });
    
    console.log('🎉 Frontend API key test completed');
    return result;
  } catch (error) {
    console.error('❌ Frontend API key test failed:', error);
    return { 
      success: false, 
      message: `API test failed: ${error.message}` 
    };
  }
}

function getDefaultTopicDetails(topicName) {
  return {
    concept: `${topicName} is an important computer science concept that involves understanding fundamental principles and practical applications.`,
    whyImportant: `Learning ${topicName} is essential for building a strong foundation in computer science and developing problem-solving skills.`,
    buildingBlocks: [
      "Understanding the basic concepts and terminology",
      "Learning the fundamental principles",
      "Exploring practical applications",
      "Understanding implementation details",
      "Recognizing common patterns and use cases"
    ],
    realWorldConnection: `${topicName} is used in many real-world applications including software development, system design, and technology solutions.`,
    nextSteps: ["Related advanced topics", "Practical implementation", "System design applications"],
    prerequisites: ["Basic programming concepts", "Mathematical foundations"]
  };
}

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


export async function generateLearningSummary(learningData, apiKey) {
  console.warn('generateLearningSummary: This function needs backend implementation if used');
  return "Learning summary generation moved to backend - implementation needed if this function is called";
}

export async function generateTopicInsights(topicData, apiKey) {
  console.warn('generateTopicInsights: This function needs backend implementation if used');
  return "Topic insights generation moved to backend - implementation needed if this function is called";
}

export function getApiSetupInstructions() {
  return {
    title: "🔑 Get Your GMI API Key for MindMelt",
    subtitle: "Connect MindMelt to GMI AI for advanced CS learning",
    steps: [
      {
        step: 1,
        title: "Visit GMI Platform",
        description: "Go to the GMI API platform",
        link: "https://api.gmi-serving.com",
        action: "Click to open GMI API platform"
      },
      {
        step: 2,
        title: "Create Account",
        description: "Sign up for a GMI API account if you don't have one",
        tip: "You may need to verify your email and provide billing information"
      },
      {
        step: 3,
        title: "Generate API Key",
        description: "Create a new API key in your GMI dashboard",
        tip: "The key will be in JWT format (three parts separated by dots)"
      },
      {
        step: 4,
        title: "Copy Your Key",
        description: "Copy your JWT API key and paste it in MindMelt settings",
        tip: "Keep this key private and secure - it provides access to your GMI account!"
      }
    ],
    benefits: [
      "🚀 Advanced DeepSeek-Prover model for complex CS reasoning",
      "⚡ High-performance API designed for educational applications",
      "🧠 Specialized in mathematical and logical reasoning",
      "🔒 Secure JWT-based authentication"
    ],
    notes: [
      "Your GMI API key will be stored locally in your browser only",
      "MindMelt never sees or stores your API key on our servers",
      "GMI API offers competitive pricing for educational use",
      "You can update or remove your API key anytime in settings"
    ]
  };
}

export function parseAIResponse(rawResponse) {
  console.warn('parseAIResponse: This function is now handled by the backend');
  return { fullResponse: rawResponse };
}

export function formatResponseForDisplay(parsedResponse) {
  console.warn('formatResponseForDisplay: This function is now handled by the backend');
  return parsedResponse.fullResponse || parsedResponse;
}

export const MINDMELT_AI_CONFIG = {
  model: "deepseek-ai/DeepSeek-Prover-V2-671B",
  apiProvider: "GMI",
  backendIntegrated: true,
  supportedModels: [
    "deepseek-ai/DeepSeek-Prover-V2-671B",
  ],
  assessmentCriteria: [
    "Depth of CS understanding demonstrated",
    "Proper use of technical terminology",
    "Evidence of critical thinking",
    "Connections to broader CS concepts",
    "Clarity and detail in explanations"
  ]
};

const aiServiceExports = {
  getSocraticResponse,
  getSocraticResponseWithMetadata,
  searchCSTopics,
  getTopicDetails,
  assessUnderstandingQuality,
  getApiKey,
  validateApiKey,
  testApiKey,
  getApiSetupInstructions,
  generateLearningSummary,
  generateTopicInsights,
  parseAIResponse,
  formatResponseForDisplay,
  MINDMELT_AI_CONFIG
};

export default aiServiceExports;