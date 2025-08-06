import { GoogleGenerativeAI } from '@google/generative-ai';

const AI_CONFIG = {
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 400,
    topP: 0.95,
    topK: 40
  }
};

// Specific configs for different call types
const CALL_CONFIGS = {
  // For testing API keys - simple text response
  TEST_API_KEY: {
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 50,
      topP: 0.1,
      topK: 1
    }
  },

  // For Socratic responses - structured JSON format
  SOCRATIC_RESPONSE: {
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 600,
      topP: 0.95,
      topK: 40,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          level: {
            type: "integer",
            description: "Bloom's taxonomy level (1-6)"
          },
          levelName: {
            type: "string",
            description: "Name of the Bloom's level (REMEMBER, UNDERSTAND, etc.)"
          },
          pun: {
            type: "string",
            description: "Clever pun or wordplay related to the concept"
          },
          question: {
            type: "string",
            description: "Focused Socratic question to guide learning"
          },
          explanation: {
            type: "string",
            description: "Brief explanation of the questioning approach"
          }
        },
        required: ["level", "levelName", "pun", "question", "explanation"]
      }
    }
  },

  // For understanding assessment - structured scoring
  ASSESSMENT: {
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 150,
      topP: 0.8,
      topK: 20,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          score: {
            type: "integer",
            description: "Understanding quality score from 0-100",
            minimum: 0,
            maximum: 100
          },
          feedback: {
            type: "string",
            description: "Brief assessment feedback"
          },
          strengths: {
            type: "array",
            items: { type: "string" },
            description: "Key strengths in the response"
          },
          improvements: {
            type: "array",
            items: { type: "string" },
            description: "Areas for improvement"
          }
        },
        required: ["score", "feedback"]
      }
    }
  },

  // For topic search - JSON array of topics
  SEARCH_TOPICS: {
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1200,
      topP: 0.8,
      topK: 20,
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Topic name"
            },
            description: {
              type: "string",
              description: "Brief 40-50 character description"
            },
            category: {
              type: "string",
              description: "Topic category",
              enum: ["Programming Languages", "Web Development", "Data Science", "AI & ML", "Cloud Computing", "Mobile Development", "Databases", "Cybersecurity", "Algorithms", "DevOps", "Blockchain", "Game Development"]
            },
            difficulty: {
              type: "string",
              description: "Difficulty level",
              enum: ["Beginner", "Intermediate", "Advanced"]
            },
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Related keywords"
            }
          },
          required: ["name", "description", "category", "difficulty", "keywords"]
        },
        minItems: 5,
        maxItems: 5
      }
    }
  },

  // For topic details - structured topic information
  TOPIC_DETAILS: {
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1000,
      topP: 0.9,
      topK: 30,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          concept: {
            type: "string",
            description: "2-3 sentence explanation of what this topic is"
          },
          whyImportant: {
            type: "string",
            description: "2-3 sentences explaining why this topic matters in CS"
          },
          buildingBlocks: {
            type: "array",
            items: { type: "string" },
            description: "5-7 key concepts/skills within this topic"
          },
          realWorldConnection: {
            type: "string",
            description: "2-3 sentences connecting this to real applications"
          },
          nextSteps: {
            type: "array",
            items: { type: "string" },
            description: "3-5 related topics to learn next"
          },
          prerequisites: {
            type: "array",
            items: { type: "string" },
            description: "2-4 topics that should be learned before this"
          }
        },
        required: ["concept", "whyImportant", "buildingBlocks", "realWorldConnection", "nextSteps", "prerequisites"]
      }
    }
  },

  // For hints - simple text response
  HINT_RESPONSE: {
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 150,
      topP: 0.9,
      topK: 40
    }
  },

  // For daily summaries - motivational text
  DAILY_SUMMARY: {
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 400,
      topP: 0.9,
      topK: 40
    }
  }
};

const QUALITY_THRESHOLDS = {
  excellent: 85,
  good: 70,
  okay: 55,
  poor: 40
};

const ERROR_MESSAGES = {
  API_KEY_MISSING: '🔑 AI API key not found. Please set your API key in MindMelt settings to start learning!',
  API_KEY_INVALID: '🔑 Invalid API key. Please check your AI API key in MindMelt settings.',
  QUOTA_EXCEEDED: '💳 API quota exceeded. Please check your API billing or try again later.',
  RATE_LIMITED: '🍦 Rate limit reached! Your ice cream timer is giving you a break - please wait a moment and try again.',
  NETWORK_ERROR: '🌐 Connection error. Please check your internet connection and try again.',
  SAFETY_BLOCKED: '🛡️ Response blocked by safety filters. Please try a different approach to this CS topic.',
  NO_RESPONSE: '🤔 MindMelt: No response generated - try rephrasing your answer',
  EMPTY_RESPONSE: '📝 MindMelt: Empty text response - please try again'
};

function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, message: 'API key is required for MindMelt to work' };
  }
  
  if (!apiKey.startsWith('AIza')) {
    return { valid: false, message: 'Gemini API key should start with "AIza"' };
  }
  
  if (apiKey.length < 30) {
    return { valid: false, message: 'API key appears to be too short for Gemini' };
  }
  
  return { valid: true, message: 'API key format looks correct! 🎉' };
}

function getGenerativeModelInstance(apiKey, configName = 'DEFAULT') {
  try {
    const config = CALL_CONFIGS[configName] || AI_CONFIG;
    
    console.log(`🔧 Creating GoogleGenerativeAI instance with config: ${configName}`);
    console.log(`⚙️  Config details:`, JSON.stringify(config.generationConfig, null, 2));
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log(`🤖 Getting generative model...`);
    const model = genAI.getGenerativeModel({
      model: AI_CONFIG.model,
      generationConfig: config.generationConfig
    });
    
    console.log(`✅ Model instance created successfully with ${configName} config`);
    return model;
  } catch (error) {
    console.error('❌ Error creating model instance:', error);
    throw error;
  }
}

async function handleGeminiResponse(result) {
  if (!result || !result.response) {
    throw new Error(ERROR_MESSAGES.NO_RESPONSE);
  }

  const response = result.response;
  
  // Check if response was blocked
  if (response.promptFeedback?.blockReason) {
    throw new Error(`${ERROR_MESSAGES.SAFETY_BLOCKED} (${response.promptFeedback.blockReason})`);
  }

  // Get the text from the response
  const text = response.text();
  
  if (!text || text.trim().length === 0) {
    throw new Error(ERROR_MESSAGES.EMPTY_RESPONSE);
  }

  return text.trim();
}

function handleGeminiError(error) {
  console.error('💥 MindMelt: Error calling Gemini API:', error);
  
  // Check for specific error types
  if (error.message.includes('API_KEY_INVALID') || error.message.includes('403') || error.message.includes('invalid API key')) {
    return new Error(ERROR_MESSAGES.API_KEY_INVALID);
  }
  
  if (error.message.includes('quota') || error.message.includes('billing') || error.message.includes('QUOTA_EXCEEDED')) {
    return new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
  }
  
  if (error.message.includes('rate limit') || error.message.includes('429') || error.message.includes('RATE_LIMIT_EXCEEDED')) {
    return new Error(ERROR_MESSAGES.RATE_LIMITED);
  }
  
  if (error.message.includes('network') || error.name === 'TypeError' || error.code === 'NETWORK_ERROR') {
    return new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
  
  if (error.message.includes('safety') || error.message.includes('blocked') || error.message.includes('SAFETY')) {
    return new Error(ERROR_MESSAGES.SAFETY_BLOCKED);
  }
  
  return new Error(`🤖 MindMelt AI Error: ${error.message}`);
}

async function makeGeminiCall(prompt, apiKey, configName = 'DEFAULT') {
  const callId = `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🤖 [${callId}] MindMelt Backend: Making API call to Gemini...`);
  console.log(`📝 [${callId}] Prompt length:`, prompt?.length);
  console.log(`🔑 [${callId}] API key available:`, !!apiKey);
  console.log(`⚙️  [${callId}] Using config:`, configName);
  
  try {
    console.log(`🔄 [${callId}] Getting model instance with ${configName} config...`);
    const model = getGenerativeModelInstance(apiKey, configName);
    console.log(`📤 [${callId}] Sending prompt to Gemini...`);
    
    const result = await model.generateContent(prompt);
    
    console.log(`🍦 [${callId}] MindMelt Backend: Gemini API Response received`);
    
    const responseText = await handleGeminiResponse(result);
    console.log(`✅ [${callId}] Response processed successfully`);
    
    // If using JSON response format, try to parse it
    const config = CALL_CONFIGS[configName];
    if (config?.generationConfig?.responseMimeType === "application/json") {
      try {
        console.log(`🔄 [${callId}] Parsing JSON response...`);
        const parsedResponse = JSON.parse(responseText);
        console.log(`✅ [${callId}] JSON parsed successfully:`, parsedResponse);
        return parsedResponse;
      } catch (parseError) {
        console.warn(`⚠️  [${callId}] Failed to parse JSON response, returning raw text:`, parseError);
        console.warn(`📝 [${callId}] Raw response text:`, responseText);
        return responseText;
      }
    }
    
    return responseText;
  } catch (error) {
    console.error(`❌ [${callId}] Gemini API call failed:`, error);
    throw handleGeminiError(error);
  }
}

async function testApiKey(apiKey) {
  const callId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🧪 [${callId}] ===== GEMINI API KEY TEST START ===== 🧪`);
  
  // Basic validation first
  const validation = validateApiKey(apiKey);
  if (!validation.valid) {
    console.log(`❌ [${callId}] API Key validation failed:`, validation.message);
    return { 
      success: false, 
      message: `Validation failed: ${validation.message}`,
      debug: {
        step: 'validation',
        apiKeyProvided: !!apiKey,
        apiKeyLength: apiKey?.length,
        startsWithAIza: apiKey?.startsWith('AIza'),
        callId: callId
      }
    };
  }
  
  console.log(`✅ [${callId}] API Key validation passed`);
  
  const testPrompt = "Hello! I'm testing MindMelt's connection to Gemini AI. Please respond with 'MindMelt connection test successful!' and nothing else.";
  
  try {
    console.log(`🚀 [${callId}] Making test API call with TEST_API_KEY config...`);
    const responseText = await makeGeminiCall(testPrompt, apiKey, 'TEST_API_KEY');
    
    console.log(`🎉 [${callId}] ===== GEMINI API KEY TEST SUCCESS ===== 🎉`);
    
    return { 
      success: true, 
      message: '🎉 Gemini API key is working perfectly with MindMelt!',
      debug: {
        responseText: responseText.trim(),
        model: AI_CONFIG.model,
        apiKeyLength: apiKey.length,
        callId: callId
      }
    };
    
  } catch (error) {
    console.error(`❌ [${callId}] ===== GEMINI API KEY TEST FAILED ===== ❌`);
    
    return { 
      success: false, 
      message: `API test failed: ${error.message}`,
      debug: {
        step: 'api_call',
        originalError: error.message,
        errorName: error.name,
        apiKeyProvided: !!apiKey,
        apiKeyLength: apiKey?.length,
        modelUsed: AI_CONFIG.model,
        callId: callId
      }
    };
  }
}

async function getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey, returnParsed = false) {
  const callId = `socratic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`📚 [${callId}] === MINDMELT BACKEND GEMINI API DEBUG ===`);
  console.log(`📚 [${callId}] Learning path:`, learningPath);
  console.log(`📚 [${callId}] Questioning style:`, questioningStyle);
  console.log(`📚 [${callId}] Using SOCRATIC_RESPONSE config with JSON schema`);
  console.log(`📚 [${callId}] User response:`, userResponse);
 
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const systemPrompt = createMindMeltPrompt(concept, userResponse, learningPath, questioningStyle);

  try {
    console.log(`🚀 [${callId}] About to call makeGeminiCall with SOCRATIC_RESPONSE config...`);
    const structuredResponse = await makeGeminiCall(systemPrompt, apiKey, 'SOCRATIC_RESPONSE');
    console.log(`✅ [${callId}] Structured response received:`, structuredResponse);

    // Handle both JSON structured response and fallback text parsing
    if (typeof structuredResponse === 'object' && structuredResponse.pun && structuredResponse.question) {
      // JSON response from schema
      console.log(`📋 [${callId}] Using structured JSON response`);
      const displayText = `${structuredResponse.pun}\n\n${structuredResponse.question}`;
      
      if (returnParsed) {
        return {
          displayText: displayText,
          parsed: structuredResponse,
          raw: JSON.stringify(structuredResponse),
          metadata: {
            level: structuredResponse.level,
            levelName: structuredResponse.levelName,
            hasPun: !!structuredResponse.pun,
            hasQuestion: !!structuredResponse.question,
            explanation: structuredResponse.explanation
          }
        };
      } else {
        return displayText;
      }
    } else {
      // Fallback to old parsing for non-JSON responses
      console.log(`📋 [${callId}] Falling back to text parsing`);
      const parsedResponse = parseAIResponse(structuredResponse);
      
      if (returnParsed) {
        return {
          displayText: formatResponseForDisplay(parsedResponse),
          parsed: parsedResponse,
          raw: structuredResponse,
          metadata: {
            level: parsedResponse.level,
            levelName: parsedResponse.levelName,
            hasPun: !!parsedResponse.pun,
            hasQuestion: !!parsedResponse.question
          }
        };
      } else {
        return formatResponseForDisplay(parsedResponse);
      }
    }
  } catch (error) {
    console.error(`❌ [${callId}] getSocraticResponse failed:`, error);
    throw handleGeminiError(error);
  }
}

async function assessUnderstandingQuality(concept, userResponse, apiKey) {
  if (!apiKey) {
    return { score: 50, feedback: "Unable to assess - no API key available" };
  }

  const assessmentPrompt = `You are assessing a student's understanding of "${concept}" in the MindMelt learning platform.

Student's response: "${userResponse}"

Rate their understanding quality from 0-100 based on:
- Depth of thinking (shows they understand core concepts)
- Accuracy of information 
- Use of proper CS terminology
- Evidence of critical thinking
- Connection to broader CS concepts

Provide a structured assessment.`;

  try {
    const assessment = await makeGeminiCall(assessmentPrompt, apiKey, 'ASSESSMENT');
    
    // Handle structured JSON response
    if (typeof assessment === 'object' && assessment.score !== undefined) {
      return {
        score: Math.max(0, Math.min(100, assessment.score)),
        feedback: assessment.feedback || "Assessment completed",
        strengths: assessment.strengths || [],
        improvements: assessment.improvements || []
      };
    } else {
      // Fallback to text parsing
      const scoreMatch = assessment.match(/(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      
      return {
        score: Math.max(0, Math.min(100, score)),
        feedback: assessment.substring(assessment.indexOf(' - ') + 3) || "Assessment completed"
      };
    }
  } catch (error) {
    console.log('Assessment API call failed, using basic scoring:', error.message);
    return assessBasicQuality(userResponse);
  }
}

async function searchCSTopics(query, apiKey) {
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchPrompt = `You are a CS education expert. For the search "${query.trim()}", provide EXACTLY 5 relevant computer science topics.

Include topics from: programming languages, web development, mobile development, data science, AI/ML, databases, cloud computing, cybersecurity, algorithms, data structures, DevOps, blockchain, game development, etc.

Search: "${query.trim()}"`;

  try {
    console.log('🔍 Backend Fast Gemini Search:', query.trim());
    
    const topics = await makeGeminiCall(searchPrompt, apiKey, 'SEARCH_TOPICS');

    console.log('🤖 Backend Gemini Response received');

    // Handle structured JSON response
    if (Array.isArray(topics)) {
      console.log(`✅ Backend returning ${topics.length} structured topics`);
      return topics.slice(0, 5); // Ensure exactly 5 topics
    } else {
      // Fallback for non-JSON responses
      console.warn('⚠️  Received non-array response, using fallback parsing');
      throw new Error('Invalid response format');
    }
    
  } catch (error) {
    console.error('Backend Gemini search failed:', error);
    // Return fallback topics
    return [{
      name: `${query.trim()} Fundamentals`,
      description: `Core concepts in ${query.trim()}`,
      category: "Computer Science",
      difficulty: "Intermediate", 
      keywords: [query.trim().toLowerCase(), "cs", "programming"]
    }];
  }
}

async function getTopicDetails(topicName, apiKey) {
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const detailsPrompt = `You are a computer science education expert. Provide detailed information about the CS topic "${topicName}".

Topic: "${topicName}"`;

  try {
    const details = await makeGeminiCall(detailsPrompt, apiKey, 'TOPIC_DETAILS');

    // Handle structured JSON response
    if (typeof details === 'object' && details.concept) {
      console.log('✅ Using structured topic details');
      return details;
    } else {
      console.warn('⚠️  Received non-object response, using default');
      return getDefaultTopicDetails(topicName);
    }
    
  } catch (error) {
    console.error('Topic details fetch failed:', error);
    return getDefaultTopicDetails(topicName);
  }
}

async function getHintResponse(concept, conversationContext, learningPath, questioningStyle, apiKey) {
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const hintPrompt = createHintPrompt(concept, conversationContext, learningPath, questioningStyle);

  try {
    const responseText = await makeGeminiCall(hintPrompt, apiKey, 'HINT_RESPONSE');
    console.log('💡 MindMelt Backend: Hint generated successfully');
    return responseText;
  } catch (error) {
    throw handleGeminiError(error);
  }
}

async function generateDailySummary(sessionsData, apiKey) {
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const summaryPrompt = createDailySummaryPrompt(sessionsData);

  try {
    const summaryText = await makeGeminiCall(summaryPrompt, apiKey, 'DAILY_SUMMARY');
    console.log('✅ MindMelt Backend: Daily summary generated successfully');
    return summaryText;
  } catch (error) {
    throw handleGeminiError(error);
  }
}

function createMindMeltPrompt(concept, userResponse, learningPath, questioningStyle) {
  const basePrompt = `You are helping a student learn "${concept}" through Socratic questioning and Bloom's taxonomy progression.

STUDENT'S CURRENT RESPONSE:
"${userResponse}"

YOUR TASK:
1. Analyze the student's response to assess their understanding level
2. Identify what they understand well and what needs clarification
3. Determine the appropriate Bloom's taxonomy level for your next question
4. Create a follow-up question that builds on their response
5. Include a concept-related pun

RESPONSE ANALYSIS GUIDE:
- Technical vocabulary used correctly → Higher level appropriate
- Vague or incorrect terminology → Start with basics (REMEMBER/UNDERSTAND)
- Detailed explanations with examples → Can move to APPLY/ANALYZE
- Shows connections between concepts → Ready for EVALUATE/CREATE
- Expresses confusion or "I don't know" → Clarify at current or lower level
- Demonstrates practical thinking → Good for scenario-based questions

BLOOM'S TAXONOMY PROGRESSION:

LEVEL 1 - REMEMBER (Foundation Building)
- Use when: Student shows basic confusion or limited recall
- Focus: Definitions, basic facts, terminology
- Questions: "What is...", "Can you identify...", "Name the components..."

LEVEL 2 - UNDERSTAND (Comprehension Building)  
- Use when: Student recalls facts but struggles with meaning/relationships
- Focus: Explanations, interpretation, connections
- Questions: "Why does this work...", "How would you explain...", "What does this mean..."

LEVEL 3 - APPLY (Problem Solving)
- Use when: Student understands concepts but hasn't applied them
- Focus: Using knowledge in new situations, practical scenarios
- Questions: "How would you use this to...", "Solve this problem using..."

LEVEL 4 - ANALYZE (Critical Examination)
- Use when: Student can apply but needs deeper analysis
- Focus: Breaking down complexity, comparing approaches
- Questions: "Compare this with...", "What are the trade-offs...", "How do these relate..."

LEVEL 5 - EVALUATE (Judgment and Assessment)
- Use when: Student shows analytical thinking
- Focus: Judging effectiveness, making reasoned choices
- Questions: "Which approach is better and why...", "What would you recommend..."

LEVEL 6 - CREATE (Innovation and Synthesis)
- Use when: Student demonstrates evaluative thinking
- Focus: Designing new solutions, combining concepts creatively
- Questions: "Design a new approach...", "How would you innovate..."

ADAPTIVE RESPONSE STRATEGY:
- Build directly on what the student just said
- Reference their specific words and examples
- Address any misconceptions you notice
- If they're struggling, ask a simpler clarifying question
- If they're excelling, challenge them with the next level
- Always acknowledge what they got right before progressing

LEARNING CONTEXT:
- Learning Path: ${getPathInstructions(learningPath)}
- Questioning Style: ${getStyleInstructions(questioningStyle)}

Based on the student's response about "${concept}", provide your next Socratic question as a structured JSON object.`;

  return basePrompt;
}

function createDailySummaryPrompt(sessionsData) {
  const { 
    totalSessions, 
    completedSessions, 
    totalDuration, 
    totalQuestions, 
    topicsStudied, 
    averageProgress,
    date 
  } = sessionsData;

  return `You are an encouraging AI learning coach for MindMelt. Generate a personalized, motivational daily summary for a student.

Learning Activity Summary for ${date}:
- Sessions started: ${totalSessions}
- Sessions completed: ${completedSessions}
- Time spent learning: ${Math.round(totalDuration / 60)} minutes
- Questions answered: ${totalQuestions}
- Topics studied: ${topicsStudied.join(', ') || 'None'}
- Average progress: ${averageProgress}%

Generate an encouraging 150-200 word summary that celebrates their achievements and motivates continued learning.`;
}

function createHintPrompt(concept, conversationContext, learningPath, questioningStyle) {
  return `You are a helpful hint provider for MindMelt. A student learning "${concept}" has requested a hint.

Recent conversation: ${conversationContext}

Provide a helpful but not complete hint (1-2 sentences max) that guides them toward discovery without giving away the full answer.`;
}

// Legacy parsing functions for fallback
function parseAIResponse(rawResponse) {
  const parsed = {
    level: null,
    levelName: null,
    pun: null,
    question: null,
    fullResponse: null,
    raw: rawResponse
  };

  try {
    if (typeof rawResponse === 'string') {
      const levelMatch = rawResponse.match(/###\s*Level\s*(\d+)\s*-\s*([^\n]+)/i);
      if (levelMatch) {
        parsed.level = parseInt(levelMatch[1]);
        parsed.levelName = levelMatch[2].trim();
      }

      const punMatch = rawResponse.match(/\*\*Pun:\*\*\s*"?([^"\n]+)"?/i);
      if (punMatch) {
        parsed.pun = punMatch[1].trim();
      }

      const questionMatch = rawResponse.match(/\*\*Question:\*\*\s*"?([^"\n]+)"?/i);
      if (questionMatch) {
        parsed.question = questionMatch[1].trim();
      }

      if (parsed.pun && parsed.question) {
        parsed.fullResponse = `${parsed.pun}\n\n${parsed.question}`;
      } else {
        parsed.fullResponse = rawResponse;
      }
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
    parsed.fullResponse = rawResponse;
  }

  return parsed;
}

function formatResponseForDisplay(parsedResponse) {
  if (parsedResponse.pun && parsedResponse.question) {
    return `${parsedResponse.pun}\n\n${parsedResponse.question}`;
  }
  return parsedResponse.fullResponse || parsedResponse.raw;
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

function getPathInstructions(learningPath) {
  const pathInstructions = {
    conceptual: `Focus on theoretical foundations and core principles.`,
    applied: `Connect theory to real-world implementation and practical usage.`,
    comprehensive: `Balance deep theory with practical application.`
  };
  return pathInstructions[learningPath] || pathInstructions.conceptual;
}

function getStyleInstructions(questioningStyle) {
  const styleInstructions = {
    socratic: `Use classic Socratic method with probing questions.`,
    scenario: `Present realistic CS scenarios and examples.`,
    puzzle: `Turn learning into engaging intellectual challenges.`,
    analogy: `Use comparisons to everyday life and familiar concepts.`
  };
  return styleInstructions[questioningStyle] || styleInstructions.socratic;
}

export default {
  getSocraticResponse,
  getHintResponse,
  assessUnderstandingQuality,
  searchCSTopics,
  getTopicDetails,
  generateDailySummary,
  testApiKey,
  validateApiKey
};
