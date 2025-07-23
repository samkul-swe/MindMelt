const AI_API_URL = 'https://api.gmi-serving.com/v1/chat/completions';

const API_CONFIG = {
  model: "deepseek-ai/DeepSeek-Prover-V2-671B", // GMI model
  temperature: 0.8,
  max_tokens: 400,
  stream: false,
  top_p: 0.95,
  top_k: 40
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

function createRequestBody(prompt, config = {}) {
  const finalConfig = { ...API_CONFIG, ...config };
 
  return {
    model: finalConfig.model,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: finalConfig.max_tokens,
    temperature: finalConfig.temperature,
    top_p: finalConfig.top_p,
    stream: finalConfig.stream
  };
}

async function handleApiResponse(response) {
  let data;
 
  try {
    data = await response.json();
  } catch (parseError) {
    console.error('Failed to parse API response:', parseError);
    throw new Error('Invalid response format from AI service');
  }


  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, data));
  }

  if (!data.choices || data.choices.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_RESPONSE);
  }


  const choice = data.choices[0];

  if (choice.finish_reason === 'content_filter') {
    throw new Error(ERROR_MESSAGES.CONTENT_FILTERED);
  }
 
  if (choice.finish_reason === 'length' || choice.finish_reason === 'max_tokens') {
    console.warn('Response was truncated due to length limits');
  }
 
  if (!choice.message?.content) {
    throw new Error(ERROR_MESSAGES.EMPTY_RESPONSE);
  }


  return choice.message.content.trim();
}

function getErrorMessage(status, errorData) {
  const baseMessage = errorData.error?.message || 'Unknown error occurred';
  
  switch (status) {
    case 400:
      return `🚫 MindMelt API Error: ${baseMessage}`;
    case 403:
      return '🔒 MindMelt: API access forbidden - please check your AI API key permissions and billing';
    case 429:
      return ERROR_MESSAGES.RATE_LIMITED;
    default:
      return `💥 MindMelt API Error: ${baseMessage}`;
  }
}

function handleApiError(error) {
  console.error('💥 MindMelt: Error calling AI API:', error);
  
  if (error.message.includes('API key') || error.message.includes('403')) {
    return new Error(ERROR_MESSAGES.API_KEY_INVALID);
  }
  
  if (error.message.includes('quota') || error.message.includes('billing')) {
    return new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
  }
  
  if (error.message.includes('rate limit') || error.message.includes('429')) {
    return new Error(ERROR_MESSAGES.RATE_LIMITED);
  }
  
  if (error.message.includes('network') || error.name === 'TypeError') {
    return new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
  
  if (error.message.includes('safety')) {
    return new Error(ERROR_MESSAGES.SAFETY_BLOCKED);
  }
  
  return new Error(`🤖 MindMelt AI Error: ${error.message}`);
}

async function makeApiCall(prompt, apiKey, config = {}) {
  console.log(apiKey);
  console.log('🧠 MindMelt: Making API call to AI...');
  
  const requestBody = createRequestBody(prompt, config);

  const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });


  console.log('🍦 MindMelt: AI API Response status:', response.status);
  
  return await handleApiResponse(response);
}

export async function getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey, returnParsed = false) {
  const finalApiKey = apiKey || getApiKey();
 
  console.log('=== MINDMELT GMI API DEBUG ===');
  console.log('Learning CS concept:', concept);
  console.log('Learning path:', learningPath);
  console.log('Questioning style:', questioningStyle);
  console.log('API Key available:', !!finalApiKey);
  console.log('API Key length:', finalApiKey?.length);
  console.log('Using GMI model:', API_CONFIG.model);
 
  if (!finalApiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const systemPrompt = createMindMeltPrompt(concept, learningPath, questioningStyle);
  const fullPrompt = `${systemPrompt}\n\nStudent's response: "${userResponse}"\n\nYour next Socratic question to guide their learning:`;

    try {
    const rawResponse = await makeApiCall(fullPrompt, finalApiKey);
    console.log('✅ MindMelt: GMI API Response received successfully');

    const parsedResponse = parseAIResponse(rawResponse);
    console.log('📋 MindMelt: Parsed response:', parsedResponse);

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
    throw handleApiError(error);
  }
}

export async function testApiKey(apiKey) {
  const testPrompt = "Hello! I'm testing MindMelt's connection to AI. Please respond with 'MindMelt is ready to help you learn CS!' and nothing else.";
  
  try {
    await makeApiCall(testPrompt, apiKey, { 
      temperature: 0.1, 
      maxOutputTokens: 20 
    });
    
    return { 
      success: true, 
      message: '🎉 AI API key is working perfectly with MindMelt!' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `API test failed: ${error.message}` 
    };
  }
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
    const levelMatch = rawResponse.match(/###\s*Level\s*(\d+)\s*-\s*([^📝💡🔧🔍⚖️🚀]+)\s*(📝|💡|🔧|🔍|⚖️|🚀)?/i);
    if (levelMatch) {
      parsed.level = parseInt(levelMatch[1]);
      parsed.levelName = levelMatch[2].trim();
      parsed.levelEmoji = levelMatch[3] || '';
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
        .replace(/###\s*Level\s*\d+[^📝💡🔧🔍⚖️🚀\n]*[📝💡🔧🔍⚖️🚀]?\s*/gi, '')
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

export async function getSocraticResponseWithMetadata(concept, userResponse, learningPath, questioningStyle, apiKey) {
  return getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey, true);
}

export async function assessUnderstandingQuality(concept, userResponse, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
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
    const assessmentText = await makeApiCall(assessmentPrompt, finalApiKey, {
      temperature: 0.3,
      maxOutputTokens: 50
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

export async function searchCSTopics(query, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
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
    "icon": "🐍",
    "keywords": ["key1", "key2", "key3"]
  }
]

Search: "${query.trim()}"
JSON (exactly 5):`;

  try {
    console.log('🔍 Fast AI Search:', query.trim());
    
    const responseText = await makeApiCall(searchPrompt, finalApiKey, {
      temperature: 0.4,
      maxOutputTokens: 800,
      topK: 20,
      topP: 0.8
    });

    console.log('🤖 AI Response received');

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
    ).slice(0, 5);

    while (validTopics.length < 5) {
      validTopics.push({
        name: `${query.trim()} Topic ${validTopics.length + 1}`,
        description: `Advanced concepts in ${query.trim()}`,
        category: "Computer Science",
        difficulty: "Intermediate",
        icon: "💻",
        keywords: [query.trim().toLowerCase(), "cs", "programming"]
      });
    }

    console.log(`✅ Returning ${validTopics.length} topics`);
    return validTopics;
    
  } catch (error) {
    console.error('AI search failed:', error);
    throw error;
  }
}

export async function getTopicDetails(topicName, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
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
    const responseText = await makeApiCall(detailsPrompt, finalApiKey, {
      temperature: 0.4,
      maxOutputTokens: 600
    });

    try {
      const details = JSON.parse(responseText);

      const requiredFields = ['concept', 'whyImportant', 'buildingBlocks', 'realWorldConnection', 'nextSteps'];
      const hasAllFields = requiredFields.every(field => 
        details[field] && 
        (typeof details[field] === 'string' || Array.isArray(details[field]))
      );

      if (!hasAllFields) {
        console.warn('AI topic details response missing required fields');
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


LEVEL 1 - REMEMBER 📝 (Foundation Building)
- Focus on basic facts, definitions, and terminology
- Ask "What is...", "Can you identify...", "Name the key components..."
- Check recall of fundamental concepts
- Build vocabulary and recognition
- ADVANCE WHEN: They show accurate recall and proper terminology


LEVEL 2 - UNDERSTAND 💡 (Comprehension Building)  
- Focus on explanations and interpretation
- Ask "Why does this work...", "How would you explain...", "What does this mean..."
- Check if they can paraphrase and give examples
- Help them see relationships and patterns
- ADVANCE WHEN: They demonstrate clear understanding and can explain in their own words


LEVEL 3 - APPLY 🔧 (Problem Solving)
- Focus on using knowledge in new situations
- Present realistic scenarios: "How would you use this to...", "Solve this problem using..."
- Check transfer of knowledge to practical contexts
- Guide them through implementation thinking
- ADVANCE WHEN: They successfully apply concepts to solve new problems


LEVEL 4 - ANALYZE 🔍 (Critical Examination)
- Focus on breaking down complex ideas and examining relationships
- Ask "Compare this with...", "What are the key differences...", "How do these parts relate..."
- Check ability to see patterns, causes, and effects
- Guide systematic analysis and critical thinking
- ADVANCE WHEN: They demonstrate analytical thinking and can break down complexity


LEVEL 5 - EVALUATE ⚖️ (Judgment and Assessment)
- Focus on making reasoned judgments and assessments
- Ask "Which approach is better and why...", "What are the trade-offs...", "How would you critique..."
- Check evidence-based reasoning and evaluation skills
- Guide them to assess alternatives thoughtfully
- ADVANCE WHEN: They make well-reasoned judgments with supporting evidence


LEVEL 6 - CREATE 🚀 (Innovation and Synthesis)
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


### Level [NUMBER] - [LEVEL NAME] [EMOJI]


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

export async function getHintResponse(concept, conversationContext, learningPath, questioningStyle, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const hintPrompt = createHintPrompt(concept, conversationContext, learningPath, questioningStyle);

  try {
    const responseText = await makeApiCall(hintPrompt, finalApiKey, {
      temperature: 0.7,
      max_tokens: 200 // Shorter responses for hints
    });
    console.log('💡 MindMelt: Hint generated successfully');
    return responseText;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function generateLearningSummary(learningData, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const {
    completedSessions,
    totalQuestions,
    correctAnswers,
    topicsStudied,
    recentTopics,
    strengths,
    weaknesses,
    timeSpent,
    streak
  } = learningData;

  const accuracyRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const summaryPrompt = `You are MindMelt's encouraging AI learning coach. Generate a personalized, motivational summary of this student's CS learning progress.

LEARNING STATISTICS:
- Completed Sessions: ${completedSessions}
- Total Questions Answered: ${totalQuestions}
- Correct Answers: ${correctAnswers}
- Accuracy Rate: ${accuracyRate}%
- Topics Studied: ${topicsStudied.join(', ') || 'Getting started'}
- Recent Focus Areas: ${recentTopics.join(', ') || 'Beginning journey'}
- Strong Areas: ${strengths.join(', ') || 'Building foundation'}
- Growth Areas: ${weaknesses.join(', ') || 'Exploring new concepts'}
- Total Study Time: ${timeSpent} minutes
- Current Streak: ${streak} days

RESPONSE REQUIREMENTS:
- Write 3-4 encouraging paragraphs (150-200 words total)
- Start with celebration of their achievements
- Highlight specific progress patterns and insights
- Include motivational language about their CS learning journey
- End with encouragement for continued learning
- Use emojis sparingly but effectively
- Sound personal and supportive, not generic
- Focus on growth mindset and learning progress

Write as if you're their personal CS learning coach who knows their journey intimately.`;

  try {
    console.log('📊 MindMelt: Generating learning summary...');
    
    const summaryText = await makeApiCall(summaryPrompt, finalApiKey, {
      temperature: 0.7,
      max_tokens: 300
    });
    
    console.log('✅ MindMelt: Learning summary generated successfully');
    return summaryText;
    
  } catch (error) {
    console.error('❌ MindMelt: Learning summary generation failed:', error);
    throw handleApiError(error);
  }
}

export async function generateTopicInsights(topicData, apiKey) {
  const finalApiKey = apiKey || getApiKey();
  
  if (!finalApiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const insightsPrompt = `As MindMelt's AI learning coach, provide encouraging insights about this student's performance across different CS topics:

TOPIC PERFORMANCE DATA:
${JSON.stringify(topicData, null, 2)}

Generate a brief, encouraging analysis (2-3 sentences) that:
- Celebrates their strongest areas
- Provides gentle guidance on growth areas  
- Suggests connections between topics they've studied
- Maintains a positive, growth-focused tone

Keep it personal and motivational, like a supportive CS mentor.`;

  try {
    const insightsText = await makeApiCall(insightsPrompt, finalApiKey, {
      temperature: 0.6,
      max_tokens: 200
    });
    
    console.log('💡 MindMelt: Topic insights generated successfully');
    return insightsText;
    
  } catch (error) {
    console.error('❌ MindMelt: Topic insights generation failed:', error);
    throw handleApiError(error);
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
- Use encouraging language with a lightbulb emoji 💡
- Focus on the specific concept they're stuck on
- Give a gentle nudge in the right direction
- Make it feel supportive, not like giving up
- Connect to their learning path and style preferences

Examples of good hints:
💡 "Think about what happens to the data when you need to access it frequently..."
💡 "Consider the trade-offs between memory usage and processing speed here..."
💡 "What if you broke this problem down into smaller parts?"
💡 "Try connecting this concept to something you use in everyday life..."

Your hint for "${concept}":`;
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

export const MINDMELT_AI_CONFIG = {
  model: API_CONFIG.model,
  settings: API_CONFIG,
  qualityThresholds: QUALITY_THRESHOLDS,
  apiProvider: "GMI",
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
  parseAIResponse,
  formatResponseForDisplay,
  generateLearningSummary,        // Add this line
  generateTopicInsights,          // Add this line
  MINDMELT_AI_CONFIG
};

export default aiServiceExports;