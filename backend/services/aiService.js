const { getAI, getGenerativeModel, GoogleAIBackend } = require("firebase/ai");
const { admin } = require('../config/firebase');

const AI_CONFIG = {
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 400,
    topP: 0.95,
    topK: 40
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

function getGenerativeModelInstance(apiKey, config = {}) {
  const finalConfig = { ...AI_CONFIG, ...config };
  
  const ai = getAI(admin.app(), {
    backend: new GoogleAIBackend(apiKey)
  });
  
  return getGenerativeModel(ai, {
    model: finalConfig.model,
    generationConfig: finalConfig.generationConfig
  });
}

async function handleGeminiResponse(result) {
  if (!result || !result.response) {
    throw new Error(ERROR_MESSAGES.NO_RESPONSE);
  }

  const response = result.response;
  
  // Check if response was blocked
  if (response.promptFeedback?.blockReason) {
    throw new Error(ERROR_MESSAGES.SAFETY_BLOCKED);
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
  
  if (error.message.includes('API key') || error.message.includes('invalid') || error.message.includes('403')) {
    return new Error(ERROR_MESSAGES.API_KEY_INVALID);
  }
  
  if (error.message.includes('quota') || error.message.includes('billing') || error.message.includes('429')) {
    return new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
  }
  
  if (error.message.includes('rate limit') || error.message.includes('429')) {
    return new Error(ERROR_MESSAGES.RATE_LIMITED);
  }
  
  if (error.message.includes('network') || error.name === 'TypeError') {
    return new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
  
  if (error.message.includes('safety') || error.message.includes('blocked')) {
    return new Error(ERROR_MESSAGES.SAFETY_BLOCKED);
  }
  
  return new Error(`🤖 MindMelt AI Error: ${error.message}`);
}

async function makeGeminiCall(prompt, apiKey, config = {}) {
  console.log('🧠 MindMelt Backend: Making API call to Gemini...');
  
  try {
    const model = getGenerativeModelInstance(apiKey, config);
    const result = await model.generateContent(prompt);
    
    console.log('🍦 MindMelt Backend: Gemini API Response received');
    
    return await handleGeminiResponse(result);
  } catch (error) {
    throw handleGeminiError(error);
  }
}

async function getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey, returnParsed = false) {
  console.log('=== MINDMELT BACKEND GEMINI API DEBUG ===');
  console.log('Learning CS concept:', concept);
  console.log('Learning path:', learningPath);
  console.log('Questioning style:', questioningStyle);
  console.log('API Key available:', !!apiKey);
  console.log('API Key length:', apiKey?.length);
  console.log('Using Gemini model:', AI_CONFIG.model);
 
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const systemPrompt = createMindMeltPrompt(concept, learningPath, questioningStyle);
  const fullPrompt = `${systemPrompt}\n\nStudent's response: "${userResponse}"\n\nYour next Socratic question to guide their learning:`;

  try {
    const rawResponse = await makeGeminiCall(fullPrompt, apiKey);
    console.log('✅ MindMelt Backend: Gemini API Response received successfully');

    const parsedResponse = parseAIResponse(rawResponse);
    console.log('📋 MindMelt Backend: Parsed response:', parsedResponse);
   
    if (returnParsed) {
      return {
        displayText: formatResponseForDisplay(parsedResponse),
        parsed: parsedResponse,
        raw: rawResponse,
        metadata: {
          level: parsedResponse.level,
          levelName: parsedResponse.levelName,
          levelEmoji: parsedResponse.levelEmoji,
          hasPun: !!parsedResponse.pun,
          hasQuestion: !!parsedResponse.question
        }
      };
    } else {
      return formatResponseForDisplay(parsedResponse);
    }
  } catch (error) {
    throw handleGeminiError(error);
  }
}

async function testApiKey(apiKey) {
  const testPrompt = "Hello! I'm testing MindMelt's connection to Gemini AI. Please respond with 'MindMelt is ready to help you learn CS!' and nothing else.";
  
  try {
    await makeGeminiCall(testPrompt, apiKey, { 
      generationConfig: {
        temperature: 0.1, 
        maxOutputTokens: 20 
      }
    });
    
    return { 
      success: true, 
      message: '🎉 Gemini API key is working perfectly with MindMelt!' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `API test failed: ${error.message}` 
    };
  }
}

async function generateDailySummary(sessionsData, apiKey) {
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const summaryPrompt = createDailySummaryPrompt(sessionsData);

  try {
    const summaryText = await makeGeminiCall(summaryPrompt, apiKey, {
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300
      }
    });
    
    console.log('✅ MindMelt Backend: Daily summary generated successfully');
    return summaryText;
  } catch (error) {
    throw handleGeminiError(error);
  }
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

  return `You are an encouraging AI learning coach for MindMelt, a computer science learning platform. Generate a personalized, motivational daily summary for a student based on their learning activity.

Learning Activity Summary for ${date}:
- Sessions started: ${totalSessions}
- Sessions completed: ${completedSessions}
- Time spent learning: ${Math.round(totalDuration / 60)} minutes
- Questions answered: ${totalQuestions}
- Topics studied: ${topicsStudied.join(', ') || 'None'}
- Average progress: ${averageProgress}%

GENERATE A MOTIVATIONAL SUMMARY (150-200 words):
- Start with an encouraging greeting that acknowledges their effort
- Highlight their specific achievements from yesterday
- Use positive, energetic language with relevant CS/tech metaphors
- If they had low activity, focus on getting back on track with enthusiasm
- If they had good activity, celebrate their momentum and encourage continuation
- End with motivation for tomorrow's learning
- Use emojis sparingly but effectively
- Keep it personal and encouraging, like a supportive mentor

Tone: Enthusiastic, supportive, knowledgeable about CS, motivational
Style: Conversational but professional, like a friendly coding mentor

Daily Summary:`;
}

function parseAIResponse(rawResponse) {
  const parsed = {
    level: null,
    levelEmoji: null,
    levelName: null,
    pun: null,
    question: null,
    fullResponse: null,
    raw: rawResponse
  };

  try {
    const levelMatch = rawResponse.match(/###\s*Level\s*(\d+)\s*-\s*([^\n]+)/i);
    if (levelMatch) {
      parsed.level = parseInt(levelMatch[1]);
      parsed.levelName = levelMatch[2].trim();
      parsed.levelEmoji = '';
    }

    const punMatch = rawResponse.match(/\*\*Pun:\*\*\s*"?([^"\n]+)"?/i);
    if (punMatch) {
      parsed.pun = punMatch[1].trim();
    }

    const questionMatch = rawResponse.match(/\*\*Question:\*\*\s*"?([^"\n]+)"?/i);
    if (questionMatch) {
      parsed.question = questionMatch[1].trim();
    }

    if (!parsed.pun && !parsed.question) {
      const beforeExplanation = rawResponse.split(/\*\*Explanation of Approach:\*\*/i)[0];

      const lines = beforeExplanation.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const cleanLine = line.replace(/\*\*/g, '').trim();

        if (cleanLine.match(/^###\s*Level/i)) continue;

        if (cleanLine.toLowerCase().includes('pun:') ||
            (cleanLine.includes('!') && !parsed.pun && !cleanLine.endsWith('?'))) {
          parsed.pun = cleanLine.replace(/^(Pun:\s*)/i, '').replace(/["']/g, '').trim();
        }
        else if (cleanLine.toLowerCase().includes('question:') ||
                 (cleanLine.endsWith('?') && !parsed.question)) {
          parsed.question = cleanLine.replace(/^(Question:\s*)/i, '').replace(/["']/g, '').trim();
        }
      }
    }

    if (parsed.pun && parsed.question) {
      parsed.fullResponse = `${parsed.pun}\n\n${parsed.question}`;
    } else if (parsed.question) {
      parsed.fullResponse = parsed.question;
    } else {
      const cleanContent = rawResponse
        .split(/\*\*Explanation of Approach:\*\*/i)[0]
        .replace(/###\s*Level\s*\d+[^\n]*\n?/gi, '')
        .replace(/\*\*(Pun|Question):\*\*/gi, '')
        .replace(/["']/g, '')
        .trim();
     
      parsed.fullResponse = cleanContent || rawResponse;
    }

  } catch (error) {
    console.error('Error parsing AI response:', error);
    parsed.fullResponse = rawResponse.split(/\*\*Explanation of Approach:\*\*/i)[0].trim();
  }

  return parsed;
}

function formatResponseForDisplay(parsedResponse) {
  if (parsedResponse.pun && parsedResponse.question) {
    return `${parsedResponse.pun}\n\n${parsedResponse.question}`;
  }

  return parsedResponse.fullResponse || parsedResponse.raw;
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

Respond with ONLY a number from 0-100, followed by a brief assessment like:
"85 - Shows solid understanding with good use of technical terms and clear reasoning"

Keep the assessment to one line only.`;

  try {
    const assessmentText = await makeGeminiCall(assessmentPrompt, apiKey, {
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 50
      }
    });
    
    const scoreMatch = assessmentText.match(/(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: assessmentText.substring(assessmentText.indexOf(' - ') + 3) || "Assessment completed"
    };
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

Return ONLY this exact JSON format with exactly 5 topics:

[
  {
    "name": "Topic Name",
    "description": "Brief 40-50 character description",
    "category": "Programming Languages|Web Development|Data Science|AI & ML|Cloud Computing|Mobile Development|Databases|Cybersecurity|Algorithms|DevOps|Blockchain|Game Development",
    "difficulty": "Beginner|Intermediate|Advanced",

    "keywords": ["key1", "key2", "key3"]
  }
]

Search: "${query.trim()}"
JSON (exactly 5):`;

  try {
    console.log('🔍 Backend Fast Gemini Search:', query.trim());
    
    const responseText = await makeGeminiCall(searchPrompt, apiKey, {
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
        topK: 20,
        topP: 0.8
      }
    });

    console.log('🤖 Backend Gemini Response received');

    let cleanResponse = responseText.trim();
    cleanResponse = cleanResponse.replace(/```json\s*|\s*```/g, '');
    
    const jsonStart = cleanResponse.indexOf('[');
    const jsonEnd = cleanResponse.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON found');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    const topics = JSON.parse(cleanResponse);
    
    if (!Array.isArray(topics)) {
      throw new Error('Invalid response format');
    }

    const validTopics = topics.filter(topic => 
      topic && topic.name && topic.description && topic.category
    ).slice(0, 5).map(topic => {
      const { icon, ...topicWithoutIcon } = topic;
      return topicWithoutIcon;
    });

    while (validTopics.length < 5) {
      validTopics.push({
        name: `${query.trim()} Topic ${validTopics.length + 1}`,
        description: `Advanced concepts in ${query.trim()}`,
        category: "Computer Science",
        difficulty: "Intermediate",
        keywords: [query.trim().toLowerCase(), "cs", "programming"]
      });
    }

    console.log(`✅ Backend returning ${validTopics.length} topics`);
    return validTopics;
    
  } catch (error) {
    console.error('Backend Gemini search failed:', error);
    throw error;
  }
}

async function getTopicDetails(topicName, apiKey) {
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const detailsPrompt = `You are a computer science education expert. Provide detailed information about the CS topic "${topicName}" in JSON format.

Return ONLY valid JSON with these exact fields:
{
  "concept": "2-3 sentence explanation of what this topic is",
  "whyImportant": "2-3 sentences explaining why this topic matters in CS",
  "buildingBlocks": ["5-7 key concepts/skills within this topic"],
  "realWorldConnection": "2-3 sentences connecting this to real applications",
  "nextSteps": ["3-5 related topics to learn next"],
  "prerequisites": ["2-4 topics that should be learned before this"]
}

Topic: "${topicName}"

Response (JSON only):`;

  try {
    const responseText = await makeGeminiCall(detailsPrompt, apiKey, {
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600
      }
    });

    try {
      const details = JSON.parse(responseText);

      const requiredFields = ['concept', 'whyImportant', 'buildingBlocks', 'realWorldConnection', 'nextSteps'];
      const hasAllFields = requiredFields.every(field => 
        details[field] && 
        (typeof details[field] === 'string' || Array.isArray(details[field]))
      );

      if (!hasAllFields) {
        console.warn('Gemini topic details response missing required fields');
        return getDefaultTopicDetails(topicName);
      }

      return details;
      
    } catch (parseError) {
      console.warn('Failed to parse topic details JSON:', responseText);
      return getDefaultTopicDetails(topicName);
    }
    
  } catch (error) {
    console.error('Topic details fetch failed:', error);
    return getDefaultTopicDetails(topicName);
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

function createMindMeltPrompt(concept, learningPath, questioningStyle) {
  const basePrompt = `You are helping a student learn "${concept}" through Socratic questioning and Bloom's taxonomy progression.

RESPONSE APPROACH:
- Start with a clever pun or wordplay related to the concept
- Jump immediately into focused questioning
- Be concise but informative - pack understanding into few words
- Never introduce yourself, welcome the student, or explain what you're doing
- Each response should advance their understanding while staying brief
- Use natural, conversational language without rigid formatting

CORE PRINCIPLES:
- Start with concept-related pun, then ask focused questions
- NEVER give direct answers - guide discovery through questions
- Build understanding progressively through Bloom's taxonomy
- Keep responses short but information-dense
- Each question should teach while asking
- Skip introductions, explanations of your role, or concept definitions

BLOOM'S TAXONOMY PROGRESSION SYSTEM:
You must adapt your questioning based on the student's current understanding level:

LEVEL 1 - REMEMBER (Foundation Building)
- Focus on basic facts, definitions, and terminology
- Ask "What is...", "Can you identify...", "Name the key components..."
- Check recall of fundamental concepts
- Build vocabulary and recognition
- ADVANCE WHEN: They show accurate recall and proper terminology

LEVEL 2 - UNDERSTAND (Comprehension Building)  
- Focus on explanations and interpretation
- Ask "Why does this work...", "How would you explain...", "What does this mean..."
- Check if they can paraphrase and give examples
- Help them see relationships and patterns
- ADVANCE WHEN: They demonstrate clear understanding and can explain in their own words

LEVEL 3 - APPLY (Problem Solving)
- Focus on using knowledge in new situations
- Present realistic scenarios: "How would you use this to...", "Solve this problem using..."
- Check transfer of knowledge to practical contexts
- Guide them through implementation thinking
- ADVANCE WHEN: They successfully apply concepts to solve new problems

LEVEL 4 - ANALYZE (Critical Examination)
- Focus on breaking down complex ideas and examining relationships
- Ask "Compare this with...", "What are the key differences...", "How do these parts relate..."
- Check ability to see patterns, causes, and effects
- Guide systematic analysis and critical thinking
- ADVANCE WHEN: They demonstrate analytical thinking and can break down complexity

LEVEL 5 - EVALUATE (Judgment and Assessment)
- Focus on making reasoned judgments and assessments
- Ask "Which approach is better and why...", "What are the trade-offs...", "How would you critique..."
- Check evidence-based reasoning and evaluation skills
- Guide them to assess alternatives thoughtfully
- ADVANCE WHEN: They make well-reasoned judgments with supporting evidence

LEVEL 6 - CREATE (Innovation and Synthesis)
- Focus on combining ideas to create something new
- Challenge them: "Design a new approach...", "How would you innovate...", "Create a solution that..."
- Check ability to synthesize and generate original ideas
- Guide creative problem-solving and innovation
- MASTERY ACHIEVED: When they demonstrate creative synthesis and original thinking

RECURSIVE LEARNING STRATEGY:
- Assess the student's response level and adjust accordingly
- If they show mastery at current level → Prepare questions for next level
- If they show partial understanding → Deepen current level with different questioning angle
- If they show confusion → Consider returning briefly to previous level
- If they show misconceptions → Address directly with corrective Socratic questioning

ADAPTIVE QUESTIONING RULES:
- Start with their demonstrated level based on their response
- Each question should build on their previous answer
- Escalate complexity gradually within each Bloom's level
- Use their specific words and examples in follow-up questions
- Never skip levels - ensure solid foundation before advancing

RESPONSE FORMAT:
Always structure your response EXACTLY like this:

### Level [NUMBER] - [LEVEL NAME]

**Pun:** "[Your clever pun or wordplay about the concept]"

**Question:** "[Your focused Socratic question]"

**Explanation of Approach:** [Brief explanation of why you chose this level and question approach - this helps track progression]

RESPONSE STYLE:
- Open with concept-related pun or clever wordplay
- Follow immediately with strategic question
- Pack maximum learning into minimum words
- Make each question teach while asking
- Vary your approach but stay concise
- Build understanding through inquiry, not explanation

RESPONSE EXAMPLES:
- Pun + Question: "Life's all about choices, and so is programming! What happens when code needs to pick between two different paths?"
- Build on response: "Smart thinking! Now what determines which path the program actually takes?"
- Scenario: "Picture a login screen - what must the program check before letting someone in?"
- Progressive: "Exactly! So what happens if that condition isn't met?"

AVOID:
- Welcoming messages or introductions
- Explaining your role as a tutor
- Lengthy setups or background information
- Repetitive formatting or emoji patterns
- Telling them what concept they're learning
- Saying "let's begin" or similar transition phrases

Remember: Pun + focused question = effective learning. Build understanding through strategic questioning, not explanation.
`;

  const pathInstructions = getPathInstructions(learningPath);
  const styleInstructions = getStyleInstructions(questioningStyle);

  return basePrompt + 
         `\n${pathInstructions}\n\n` +
         `${styleInstructions}`;
}

function getPathInstructions(learningPath) {
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

  return pathInstructions[learningPath] || pathInstructions.conceptual;
}

function getStyleInstructions(questioningStyle) {
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

  return styleInstructions[questioningStyle] || styleInstructions.socratic;
}

async function getHintResponse(concept, conversationContext, learningPath, questioningStyle, apiKey) {
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const hintPrompt = createHintPrompt(concept, conversationContext, learningPath, questioningStyle);

  try {
    const responseText = await makeGeminiCall(hintPrompt, apiKey, {
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200 // Shorter responses for hints
      }
    });
    console.log('💡 MindMelt Backend: Hint generated successfully');
    return responseText;
  } catch (error) {
    throw handleGeminiError(error);
  }
}

function createHintPrompt(concept, conversationContext, learningPath, questioningStyle) {
  const pathContext = getPathInstructions(learningPath);
  const styleContext = getStyleInstructions(questioningStyle);
  
  return `You are a helpful hint provider for MindMelt, a CS learning platform. A student is learning "${concept}" and has requested a hint.

CONTEXT:
Recent conversation:
${conversationContext}

Learning Focus: ${pathContext}
Questioning Style: ${styleContext}

HINT GUIDELINES:
- Provide a helpful but not complete hint (1-2 sentences max)
- Don't give away the full answer - guide them toward discovery
- Use encouraging language
- Focus on the specific concept they're stuck on
- Give a gentle nudge in the right direction
- Make it feel supportive, not like giving up
- Connect to their learning path and style preferences

Examples of good hints:
"Think about what happens to the data when you need to access it frequently..."
"Consider the trade-offs between memory usage and processing speed here..."
"What if you broke this problem down into smaller parts?"
"Try connecting this concept to something you use in everyday life..."

Your hint for "${concept}":`;
}

module.exports = {
  getSocraticResponse,
  getHintResponse,
  assessUnderstandingQuality,
  searchCSTopics,
  getTopicDetails,
  generateDailySummary,
  testApiKey,
  validateApiKey
};