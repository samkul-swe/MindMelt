const AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Get API key from multiple sources (priority order)
 * @returns {string|null} - The API key or null if not found
 */
export function getApiKey() {
  return process.env.REACT_APP_AI_API_KEY || 
         localStorage.getItem('mindmelt_ai_key') || 
         null;
}

/**
 * Generate Socratic response using AI API for MindMelt
 * @param {string} concept - The CS concept being learned
 * @param {string} userResponse - The user's response/question
 * @param {string} learningPath - conceptual, applied, or comprehensive
 * @param {string} questioningStyle - socratic, scenario, puzzle, or analogy
 * @param {string} apiKey - The AI API key
 * @returns {Promise<string>} - The AI's Socratic response
 */
export async function getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  console.log('=== MINDMELT AI API DEBUG ===');
  console.log('Learning CS concept:', concept);
  console.log('Learning path:', learningPath);
  console.log('Questioning style:', questioningStyle);
  console.log('API Key available:', !!finalApiKey);
  console.log('API Key length:', finalApiKey?.length);
  console.log('API Key starts with AIza:', finalApiKey?.startsWith('AIza'));
  
  if (!finalApiKey) {
    throw new Error('🔑 AI API key not found. Please set your API key in MindMelt settings to start learning!');
  }

  const systemPrompt = createMindMeltPrompt(concept, learningPath, questioningStyle);

  const fullPrompt = `${systemPrompt}\n\nStudent's response: "${userResponse}"\n\nYour next Socratic question to guide their learning:`;

  try {
    console.log('🧠 MindMelt: Making API call to AI for CS learning...');
    
    const requestBody = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.8, // Slightly higher for more engaging educational responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 400, // Shorter responses for better engagement
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${AI_API_URL}?key=${finalApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🍦 MindMelt: AI API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ MindMelt: AI API Error Details:', errorData);
      
      if (response.status === 400) {
        throw new Error(`🚫 MindMelt API Error: ${errorData.error?.message || 'Bad request - please check your API key format'}`);
      } else if (response.status === 403) {
        throw new Error('🔒 MindMelt: API access forbidden - please check your AI API key permissions and billing');
      } else if (response.status === 429) {
        throw new Error('⏳ MindMelt: Rate limit reached - your ice cream needs a moment to refreeze! Please wait and try again');
      } else {
        throw new Error(`💥 MindMelt API Error: ${errorData.error?.message || 'Unknown error occurred'}`);
      }
    }

    const data = await response.json();
    console.log('✅ MindMelt: AI API Response received successfully');
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('🤔 MindMelt: No response generated - try rephrasing your answer');
    }

    const candidate = data.candidates[0];
    
    // Check if the response was blocked
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('🛡️ MindMelt: Response was blocked by safety filters. Please try rephrasing your question about this CS concept.');
    }
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('🎯 MindMelt: Empty response - let\'s try a different approach to this CS concept');
    }

    const responseText = candidate.content.parts[0].text;
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('📝 MindMelt: Empty text response - please try again');
    }

    return responseText.trim();
    
  } catch (error) {
    console.error('💥 MindMelt: Error calling AI API:', error);
    
    // Return MindMelt-specific error messages
    if (error.message.includes('API key') || error.message.includes('403')) {
      throw new Error('🔑 Invalid API key. Please check your AI API key in MindMelt settings.');
    } else if (error.message.includes('quota') || error.message.includes('billing')) {
      throw new Error('💳 API quota exceeded. Please check your API billing or try again later.');
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('🍦 Rate limit reached! Your ice cream timer is giving you a break - please wait a moment and try again.');
    } else if (error.message.includes('network') || error.name === 'TypeError') {
      throw new Error('🌐 Connection error. Please check your internet connection and try again.');
    } else if (error.message.includes('safety')) {
      throw new Error('🛡️ Response blocked by safety filters. Please try a different approach to this CS topic.');
    } else {
      throw new Error(`🤖 MindMelt AI Error: ${error.message}`);
    }
  }
}

/**
 * Create a MindMelt-specific system prompt for CS learning
 */
function createMindMeltPrompt(concept, learningPath, questioningStyle) {
  const basePrompt = `You are the AI tutor for MindMelt, an innovative CS learning platform where students race against a melting ice cream timer! 🍦🧠

You're helping a student learn "${concept}" - a fundamental computer science concept. Your mission is to be their Socratic guide, helping them discover answers through strategic questioning rather than direct explanations.

MINDMELT PERSONALITY:
- Be encouraging and enthusiastic about CS learning
- Use occasional ice cream/melting metaphors when appropriate
- Keep responses concise (1-3 sentences max) - their ice cream is melting!
- Always end with ONE clear, thought-provoking question
- Be patient but engaging - make learning fun!

CORE SOCRATIC RULES:
- NEVER give direct answers or full explanations
- Guide discovery through strategic questions
- Build on their previous responses  
- Ask questions that reveal deeper understanding
- Encourage critical thinking about CS concepts
- Use "What if...", "Why do you think...", "How would..." questions

MINDMELT SUCCESS INDICATORS:
When they show good understanding, you can say things like:
- "Great thinking! That's getting closer to the core concept."
- "You're connecting the dots well!"
- "That insight shows you're really understanding this!"

`;

  // MindMelt learning path instructions
  const pathInstructions = {
    conceptual: `CONCEPTUAL TRACK FOCUS: Help them build solid theoretical foundations. Ask questions about:
- WHY this CS concept exists and matters
- HOW it relates to other CS fundamentals  
- WHAT the core principles and definitions are
- WHERE they see this concept fitting in the bigger CS picture
Guide them to deep conceptual understanding before moving to specifics.`,
    
    applied: `APPLIED TRACK FOCUS: Connect theory to real-world implementation. Ask questions about:
- HOW they would use this in actual code/systems
- WHEN they would choose this approach over alternatives
- WHAT real-world problems this solves
- WHERE they've seen this concept in apps/websites they use
Help them bridge from theory to practical application.`,
    
    comprehensive: `COMPREHENSIVE TRACK FOCUS: Balance deep theory with practical application. Ask questions that:
- Connect WHY the concept exists with HOW it's implemented
- Link theoretical understanding to real-world usage
- Help them see both the big picture AND the details
- Guide them to master both concept AND application
Build complete, integrated understanding of the CS topic.`
  };

  // MindMelt questioning style instructions  
  const styleInstructions = {
    socratic: `SOCRATIC QUESTIONING STYLE: Use classic Socratic method for CS learning:
- Ask probing questions that reveal assumptions about this CS concept
- Guide logical reasoning step-by-step
- Use "What makes you think...", "Why might that approach...", "What if we considered..." 
- Help them discover the answer through their own reasoning process`,
    
    scenario: `SCENARIO-BASED QUESTIONING: Present realistic CS scenarios:
- "Imagine you're building an app that needs to..." 
- "What if a company asked you to solve..."
- "How would you handle a situation where..."
- Make abstract CS concepts concrete through real-world examples`,
    
    puzzle: `PUZZLE-BASED QUESTIONING: Turn CS learning into engaging challenges:
- Present interesting problems related to this concept
- Ask "Can you figure out why..." or "What's the clever solution to..."
- Make them think creatively about CS problems
- Turn learning into intellectual puzzle-solving`,
    
    analogy: `ANALOGY-BASED QUESTIONING: Use comparisons to everyday life:
- "How is this CS concept like..." [familiar analogy]
- "If this were a real-world system, what would it be similar to?"
- "What everyday process does this remind you of?"
- Help them understand through familiar comparisons and metaphors`
  };

  return basePrompt + 
         `\n${pathInstructions[learningPath] || pathInstructions.conceptual}\n\n` +
         `${styleInstructions[questioningStyle] || styleInstructions.socratic}\n\n` +
         `Remember: You're their MindMelt tutor helping them master CS fundamentals. Guide their discovery with your next strategic question! 🎯`;
}

/**
 * Validate AI API key format
 */
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

/**
 * Test API key by making a simple MindMelt request
 */
export async function testApiKey(apiKey) {
  try {
    const testRequestBody = {
      contents: [{
        parts: [{
          text: "Hello! I'm testing MindMelt's connection to AI. Please respond with 'MindMelt is ready to help you learn CS!' and nothing else."
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 20
      }
    };

    const response = await fetch(`${AI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequestBody)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        return { success: true, message: '🎉 AI API key is working perfectly with MindMelt!' };
      } else {
        return { success: false, message: 'API key works but no response generated' };
      }
    } else {
      const errorData = await response.json();
      return { 
        success: false, 
        message: `API test failed: ${errorData.error?.message || 'Unknown error'}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Connection error: ${error.message}` 
    };
  }
}

/**
 * Assess user understanding quality (for ice cream timer bonus)
 * Returns a score from 0-100 based on response quality
 */
export async function assessUnderstandingQuality(concept, userResponse, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    // Return neutral score if no API key
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

Respond with ONLY a number from 0-100, followed by a brief assessment like:
"85 - Shows solid understanding with good use of technical terms and clear reasoning"

Keep the assessment to one line only.`;

  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: assessmentPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.3, // Lower temperature for consistent assessment
        maxOutputTokens: 50
      }
    };

    const response = await fetch(`${AI_API_URL}?key=${finalApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const assessmentText = data.candidates[0].content.parts[0].text.trim();
        const scoreMatch = assessmentText.match(/(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
        
        return {
          score: Math.max(0, Math.min(100, score)), // Ensure 0-100 range
          feedback: assessmentText.substring(assessmentText.indexOf(' - ') + 3) || "Assessment completed"
        };
      }
    }
    
    // Fallback scoring based on response length and basic keywords
    return assessBasicQuality(userResponse);
    
  } catch (error) {
    console.log('Assessment API call failed, using basic scoring:', error.message);
    return assessBasicQuality(userResponse);
  }
}

/**
 * Basic quality assessment without API (fallback)
 */
function assessBasicQuality(userResponse) {
  const response = userResponse.toLowerCase();
  let score = 30; // Base score
  
  // Length indicates effort
  if (response.length > 100) score += 20;
  else if (response.length > 50) score += 10;
  
  // CS terminology usage
  const csTerms = ['algorithm', 'data structure', 'complexity', 'memory', 'cpu', 'network', 'database', 
                   'function', 'variable', 'array', 'loop', 'condition', 'binary', 'queue', 'stack'];
  const termsUsed = csTerms.filter(term => response.includes(term)).length;
  score += Math.min(25, termsUsed * 5);
  
  // Question words indicate thinking
  const thinkingWords = ['because', 'since', 'therefore', 'however', 'although', 'why', 'how', 'what if'];
  const thinkingUsed = thinkingWords.filter(word => response.includes(word)).length;
  score += Math.min(15, thinkingUsed * 3);
  
  // Examples or specifics
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

/**
 * Get MindMelt API setup instructions
 */
export function getApiSetupInstructions() {
  return {
    title: "🔑 Get Your AI API Key for MindMelt",
    subtitle: "Connect MindMelt to AI for personalized CS learning",
    steps: [
      {
        step: 1,
        title: "Visit AI Studio",
        description: "Go to your AI development platform",
        link: "https://aistudio.google.com",
        action: "Click to open Google AI Studio"
      },
      {
        step: 2,
        title: "Sign in with Google",
        description: "Use your Google account to access the platform",
        tip: "If you don't have a Google account, you'll need to create one first"
      },
      {
        step: 3,
        title: "Get API Key",
        description: "Click 'Get API Key' and create a new key for MindMelt",
        tip: "Choose 'Create API key in new project' if this is your first time"
      },
      {
        step: 4,
        title: "Copy Your Key",
        description: "Copy your API key (starts with 'AIza') and paste it in MindMelt",
        tip: "Keep this key private - don't share it with others!"
      }
    ],
    benefits: [
      "🆓 Gemini API offers generous free tier limits",
      "⚡ Fast responses perfect for learning sessions", 
      "🧠 Advanced AI tuned for educational conversations",
      "🔒 Your API key stays private in your browser"
    ],
    notes: [
      "Your API key will be stored locally in your browser only",
      "MindMelt never sees or stores your API key on our servers",
      "Free tier includes thousands of learning interactions per month",
      "You can change or remove your API key anytime in settings"
    ]
  };
}

// MindMelt-specific Gemini configuration
export const MINDMELT_AI_CONFIG = {
  model: 'gemini-1.5-flash', // Best balance of speed and capability for education
  
  settings: {
    temperature: 0.8, // Slightly higher for engaging educational responses
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 400, // Keep responses concise for better engagement
  },
  
  // Quality thresholds for ice cream timer bonuses
  qualityThresholds: {
    excellent: 85, // 3+ minutes bonus
    good: 70,      // 2 minutes bonus  
    okay: 55,      // 1 minute bonus
    poor: 40       // No bonus
  },
  
  // Assessment criteria
  assessmentCriteria: [
    "Depth of CS understanding demonstrated",
    "Proper use of technical terminology", 
    "Evidence of critical thinking",
    "Connections to broader CS concepts",
    "Clarity and detail in explanations"
  ]
};

export default {
  getSocraticResponse,
  assessUnderstandingQuality,
  getApiKey,
  validateApiKey,
  testApiKey,
  getApiSetupInstructions,
  MINDMELT_AI_CONFIG
};