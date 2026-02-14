import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Service for Socratic conversations and analysis
 * Uses Anthropic Claude API
 */

class AIService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';
  }

  /**
   * Make a call to Claude AI
   * @param {string} prompt - The prompt to send
   * @param {object} options - Additional options
   * @returns {Promise<string>} AI response
   */
  async call(prompt, options = {}) {
    try {
      console.log('🤖 Calling AI API...');
      
      const message = await this.client.messages.create({
        model: options.model || this.model,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const response = message.content[0].text;
      console.log('✅ AI response received');
      
      return response;
    } catch (error) {
      console.error('❌ AI API error:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }

  /**
   * Call AI and parse JSON response
   * @param {string} prompt - The prompt (should request JSON output)
   * @returns {Promise<object>} Parsed JSON object
   */
  async callForJSON(prompt, options = {}) {
    try {
      const response = await this.call(prompt, options);
      
      // Clean response - remove markdown code blocks if present
      const cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleaned);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('Failed to parse AI JSON response:', error);
        throw new Error('AI returned invalid JSON format');
      }
      throw error;
    }
  }

  /**
   * Generate Socratic question based on context
   * @param {object} context - Learning context
   * @returns {Promise<string>} Socratic question
   */
  async generateSocraticQuestion(context) {
    const prompt = `You are a Socratic tutor helping a student learn ${context.topic}.

Context:
- Student's background: ${JSON.stringify(context.background)}
- Current conversation: ${JSON.stringify(context.conversation)}
- Learning objective: ${context.objective}

Your role:
- Ask ONE question that guides discovery
- Don't give answers, guide to answers
- Build on their previous response
- If stuck, give small hint
- If wrong, ask why they think that

Generate the next Socratic question (under 50 words):`;

    return await this.call(prompt, { temperature: 0.8 });
  }

  /**
   * Analyze resume and extract skills
   * @param {string} resumeText - Resume content
   * @returns {Promise<object>} Extracted data
   */
  async analyzeResume(resumeText) {
    const prompt = `You are analyzing a developer's resume to extract skills and experience.

Resume text:
${resumeText}

Extract and return JSON only:
{
  "skills": ["React", "Node.js", ...],
  "experienceYears": 3,
  "experienceLevel": "Junior" | "Mid-level" | "Senior",
  "projects": ["E-commerce platform", ...],
  "education": "BS Computer Science",
  "specializations": ["Full-Stack", "Backend"]
}

Be accurate. Only list skills explicitly mentioned.
Return ONLY valid JSON, no other text.`;

    return await this.callForJSON(prompt);
  }

  /**
   * Analyze role fit based on skills
   * @param {object} profile - User profile
   * @returns {Promise<object>} Role fit analysis
   */
  async analyzeRoleFit(profile) {
    const prompt = `Given this developer profile:
Skills: ${JSON.stringify(profile.skills)}
Experience: ${profile.experienceYears} years as ${profile.experienceLevel}
Projects: ${JSON.stringify(profile.projects)}

Analyze fit for these roles:
1. Full-Stack Engineer
2. Mobile Engineer 
3. Backend Engineer
4. Frontend Engineer

For each role, return JSON:
{
  "Full-Stack Engineer": {
    "match": 0-100,
    "strengths": ["Skills that apply"],
    "gaps": ["Skills they're missing"],
    "ready": true/false,
    "reasoning": "Brief explanation"
  },
  ...
}

Base match on:
- Relevant skills (60% weight)
- Experience level (20% weight)
- Project types (20% weight)

Return ONLY valid JSON, no other text.`;

    return await this.callForJSON(prompt);
  }

  /**
   * Test if AI service is working
   */
  async testConnection() {
    try {
      const response = await this.call('Reply with exactly: "AI service is working"', {
        maxTokens: 50
      });
      return {
        success: true,
        message: 'AI service connected successfully',
        response: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new AIService();