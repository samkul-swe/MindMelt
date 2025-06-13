// openaiAPI.js - OpenAI API integration for Socratic learning

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Get API key from multiple sources (priority order)
 * @returns {string|null} - The API key or null if not found
 */
export function getApiKey() {
  return process.env.REACT_APP_OPENAI_API_KEY || 
         localStorage.getItem('socratic_openai_key') || 
         null;
}

/**
 * Generate Socratic response using OpenAI API
 * @param {string} concept - The concept being learned
 * @param {string} userResponse - The user's response/question
 * @param {string} learningPath - The selected learning path
 * @param {string} questioningStyle - The questioning style
 * @param {string} apiKey - The OpenAI API key (now properly accepted!)
 * @returns {Promise<string>} - The AI's Socratic response
 */
export async function getSocraticResponse(concept, userResponse, learningPath, questioningStyle, apiKey) {
  // Use the passed API key first, then fall back to getApiKey()
  const finalApiKey = apiKey || getApiKey();
  
  // Add debugging
  console.log('API Key received:', !!finalApiKey);
  console.log('API Key length:', finalApiKey?.length);
  console.log('API Key starts with sk-:', finalApiKey?.startsWith('sk-'));
  
  if (!finalApiKey) {
    throw new Error('API key not found. Please set your API key in the app settings.');
  }

  // Create the system prompt based on learning preferences
  const systemPrompt = createSystemPrompt(concept, learningPath, questioningStyle);
  
  // Prepare the messages for the API call
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userResponse
    }
  ];

  try {
    console.log('Making API call to OpenAI...');
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.6,  // Encourage diverse responses
        frequency_penalty: 0.3   // Reduce repetition
      })
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error Details:', errorData);
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('API Response received successfully');
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated');
    }

    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Return a helpful error message based on the error type
    if (error.message.includes('API key') || error.message.includes('401')) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (error.message.includes('quota') || error.message.includes('billing')) {
      throw new Error('API quota exceeded. Please check your OpenAI account billing.');
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    } else if (error.message.includes('network') || error.name === 'TypeError') {
      throw new Error('Connection error. Please check your internet connection.');
    } else {
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }
}

/**
 * Create a system prompt based on learning preferences
 */
function createSystemPrompt(concept, learningPath, questioningStyle) {
  const basePrompt = `You are a Socratic tutor helping a student learn about "${concept}". Your role is to guide the student to discover answers through thoughtful questions rather than giving direct answers.

IMPORTANT RULES:
- Never give direct answers or explanations
- Always respond with questions that guide thinking
- Ask one question at a time
- Build on the student's responses
- Encourage critical thinking
- Be patient and supportive
- Use encouraging language
- Keep responses concise (2-3 sentences max)

`;

  // Add learning path specific instructions
  const pathInstructions = {
    conceptual: `Focus on theoretical understanding. Ask questions about fundamental principles, definitions, and relationships between concepts. Help them build a solid conceptual foundation.`,
    
    applied: `Focus on practical applications. Ask questions about real-world examples, implementation details, and how to use the concept in practice. Guide them toward hands-on understanding.`,
    
    comprehensive: `Balance theory and practice. Ask questions that cover both conceptual understanding and practical applications. Help them see the complete picture of how the concept works and when to use it.`
  };

  // Add questioning style specific instructions
  const styleInstructions = {
    direct: `Ask clear, straightforward questions. Focus on step-by-step logical progression. Use direct questioning to guide their reasoning process.`,
    
    scenario: `Present realistic scenarios and ask how they would apply the concept. Use "What if..." and "How would you..." questions. Make the learning contextual and practical.`,
    
    puzzle: `Present challenges and brain teasers related to the concept. Ask questions that make them think creatively and solve problems. Make learning engaging through intellectual challenges.`,
    
    analogy: `Use analogies and metaphors in your questions. Ask them to compare the concept to familiar things. Help them understand through comparisons and connections to what they already know.`
  };

  return basePrompt + 
         `LEARNING PATH: ${pathInstructions[learningPath]}\n\n` +
         `QUESTIONING STYLE: ${styleInstructions[questioningStyle]}\n\n` +
         `Remember: Your goal is to help them discover the answer, not to give it to them. Guide their thinking with your next question.`;
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, message: 'API key is required' };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return { valid: false, message: 'API key should start with "sk-"' };
  }
  
  if (apiKey.length < 40) {
    return { valid: false, message: 'API key appears to be too short' };
  }
  
  return { valid: true, message: 'API key format looks correct' };
}

/**
 * Test API key by making a simple request
 */
export async function testApiKey(apiKey) {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        max_tokens: 5
      })
    });

    if (response.ok) {
      return { success: true, message: 'API key is working correctly!' };
    } else {
      const errorData = await response.json();
      return { 
        success: false, 
        message: errorData.error?.message || 'API key test failed' 
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
 * Get available OpenAI models (for future use)
 */
export async function getAvailableModels(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data.filter(model => 
        model.id.includes('gpt') && !model.id.includes('instruct')
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

// Example usage and configuration
export const OPENAI_CONFIG = {
  models: {
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient, great for education',
      maxTokens: 4096,
      costPer1K: 0.002
    },
    'gpt-4': {
      name: 'GPT-4',
      description: 'Most capable, best for complex topics',
      maxTokens: 8192,
      costPer1K: 0.03
    },
    'gpt-4-turbo': {
      name: 'GPT-4 Turbo',
      description: 'Latest GPT-4 with better performance',
      maxTokens: 128000,
      costPer1K: 0.01
    }
  },
  
  defaultSettings: {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 800,
    presencePenalty: 0.6,
    frequencyPenalty: 0.3
  }
};