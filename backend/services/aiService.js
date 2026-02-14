import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Service - Improved architecture with separate calls
 */

class AIService {
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.client.getGenerativeModel({ 
      model: process.env.AI_MODEL || 'gemini-1.5-pro'
    });
  }

  async call(prompt, options = {}) {
    try {
      console.log('🤖 Calling Gemini API...');
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 4096,
          topP: 0.95,
          topK: 40
        }
      });

      const response = result.response.text();
      console.log('✅ Gemini response received');
      console.log('📏 Response length:', response.length, 'characters');
      
      return response;
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }

  async callForJSON(prompt, options = {}) {
    let response;
    try {
      response = await this.call(prompt, options);
      
      console.log('📝 Raw AI response (first 200 chars):', response.substring(0, 200));
      
      let cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      console.log('📏 Full cleaned length:', cleaned.length);
      
      const parsed = JSON.parse(cleaned);
      console.log('✅ Successfully parsed JSON');
      
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('❌ Failed to parse AI JSON response');
        console.error('📄 Full raw response:', response);
        console.error('🔍 Error details:', error.message);
        throw new Error('AI returned invalid JSON format');
      }
      throw error;
    }
  }

  // ============================================
  // RESUME ANALYSIS
  // ============================================

  async analyzeResume(resumeText) {
    const prompt = `Analyze this developer's resume and extract key information.

Resume:
${resumeText}

Return ONLY valid JSON in this exact format:
{
  "skills": ["React", "Node.js", "Python"],
  "experienceYears": 3,
  "experienceLevel": "Junior" | "Mid-level" | "Senior",
  "projects": ["Project 1", "Project 2"],
  "education": "BS Computer Science",
  "specializations": ["Full-Stack", "Backend"]
}

Be accurate. Only list skills explicitly mentioned.`;

    return await this.callForJSON(prompt);
  }

  // ============================================
  // ROLE FIT ANALYSIS - IMPROVED ARCHITECTURE
  // ============================================

  /**
   * Quick role overview - just match percentages
   * This is FAST and uses minimal tokens
   */
  async getRoleOverview(profile) {
    const prompt = `Quick analysis: What % match is this developer for each role?

Skills: ${JSON.stringify(profile.skills)}
Experience: ${profile.experienceYears} years (${profile.experienceLevel})

Return ONLY this JSON:
{
  "Full-Stack Engineer": 85,
  "Backend Engineer": 78,
  "Frontend Engineer": 72,
  "Mobile Engineer": 45
}

Just numbers 0-100 for each role. No explanations.`;

    return await this.callForJSON(prompt, { maxTokens: 256 });
  }

  /**
   * Detailed analysis for ONE specific role
   * Called when user clicks on a role card
   */
  async analyzeSpecificRole(profile, roleName) {
    const prompt = `Detailed analysis for ${roleName} role.

Developer Profile:
- Skills: ${JSON.stringify(profile.skills)}
- Experience: ${profile.experienceYears} years (${profile.experienceLevel})
- Projects: ${JSON.stringify(profile.projects)}

Analyze their fit for ${roleName}. Return ONLY this JSON:
{
  "match": 85,
  "strengths": [
    "Specific skill or experience that's relevant",
    "Another strength",
    "Maximum 5 strengths"
  ],
  "gaps": [
    "Missing skill or knowledge area",
    "Another gap",
    "Maximum 5 gaps"
  ],
  "ready": true,
  "reasoning": "One sentence explaining overall fit",
  "recommendations": [
    "Specific suggestion for improvement",
    "Another actionable recommendation"
  ]
}`;

    return await this.callForJSON(prompt, { maxTokens: 1024 });
  }

  // ============================================
  // SOCRATIC LEARNING (Phase 3)
  // ============================================

  async generateSocraticQuestion(context) {
    const prompt = `You are a Socratic tutor helping a student learn ${context.topic}.

Context:
- Student's background: ${JSON.stringify(context.background)}
- Recent conversation: ${JSON.stringify(context.conversation?.slice(-3) || [])}
- Learning objective: ${context.objective}

Your role:
- Ask ONE question that guides discovery
- Don't give answers, guide to answers
- Build on their previous response
- If stuck, give small hint
- If wrong, ask why they think that

Generate the next Socratic question (under 50 words):`;

    return await this.call(prompt, { temperature: 0.8, maxTokens: 256 });
  }

  async reviewCode(context) {
    const prompt = `Review this code for a ${context.requirements[0]} project.

Code:
${context.code}

Requirements:
${context.requirements.join('\n')}

Find logical errors or best practice violations. Return JSON:
{
  "issues": [
    {
      "type": "logical" | "performance" | "bestPractice",
      "severity": "critical" | "moderate",
      "scenarioToReveal": "Try: Add 3 items, delete first",
      "socraticQuestion": "What happens when..."
    }
  ],
  "overallQuality": "excellent" | "good" | "needs work"
}

Focus on teachable moments. Return ONLY JSON.`;

    return await this.callForJSON(prompt, { maxTokens: 1024 });
  }

  async testConnection() {
    try {
      const response = await this.call('Reply with exactly: "AI service is working"', {
        maxTokens: 50
      });
      return {
        success: true,
        message: 'Gemini AI service connected successfully',
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