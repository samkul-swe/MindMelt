import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// import aiService from './aiService.js';
import aiService from './mockAIService.js';
import { createDoc, updateDoc, findOne } from '../utils/firestore.js';

/**
 * Resume Service - Improved with separate API calls
 */

class ResumeService {
  async extractTextFromPDF(buffer) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  async analyzeResume(resumeText) {
    try {
      console.log('🤖 Analyzing resume with AI...');
      const analysis = await aiService.analyzeResume(resumeText);
      console.log('✅ Resume analysis complete:', analysis);
      return analysis;
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  /**
   * IMPROVED: Get quick overview of all roles
   * Returns just match percentages - fast and cheap
   */
  async getRoleOverview(profile) {
    try {
      console.log('🎯 Getting role overview (quick)...');
      const overview = await aiService.getRoleOverview(profile);
      console.log('✅ Role overview complete:', overview);
      return overview;
    } catch (error) {
      console.error('Role overview error:', error);
      throw new Error('Failed to get role overview');
    }
  }

  /**
   * IMPROVED: Get detailed analysis for ONE role
   * Called when user clicks a role card
   */
  async analyzeSpecificRole(profile, roleName) {
    try {
      console.log(`🔍 Analyzing ${roleName} in detail...`);
      const details = await aiService.analyzeSpecificRole(profile, roleName);
      console.log(`✅ ${roleName} analysis complete`);
      return details;
    } catch (error) {
      console.error(`${roleName} analysis error:`, error);
      throw new Error(`Failed to analyze ${roleName}`);
    }
  }

  async saveResumeAnalysis(userId, resumeText, analysis) {
    try {
      const resumeData = {
        userId,
        resumeText,
        extractedSkills: analysis.skills || [],
        experienceYears: analysis.experienceYears || 0,
        experienceLevel: analysis.experienceLevel || 'Entry-level',
        projects: analysis.projects || [],
        education: analysis.education || '',
        specializations: analysis.specializations || [],
        analyzedAt: new Date()
      };

      const doc = await createDoc('resume_analyses', resumeData);
      console.log(`✅ Resume analysis saved: ${doc.id}`);
      return doc;
    } catch (error) {
      console.error('Error saving resume analysis:', error);
      throw error;
    }
  }

  async createLearningPath(userId, pathData) {
    try {
      const learningPath = {
        userId,
        targetRole: pathData.targetRole,
        currentMatch: pathData.currentMatch,
        timeline: pathData.timeline,
        motivation: pathData.motivation || '',
        status: 'not_started',
        createdAt: new Date()
      };

      const doc = await createDoc('learning_paths', learningPath);
      console.log(`✅ Learning path created: ${doc.id}`);
      return doc;
    } catch (error) {
      console.error('Error creating learning path:', error);
      throw error;
    }
  }

  async getUserResume(userId) {
    try {
      const resume = await findOne('resume_analyses', 'userId', userId);
      return resume;
    } catch (error) {
      console.error('Error fetching user resume:', error);
      throw error;
    }
  }

  async getUserLearningPath(userId) {
    try {
      const path = await findOne('learning_paths', 'userId', userId);
      return path;
    } catch (error) {
      console.error('Error fetching learning path:', error);
      throw error;
    }
  }
}

export default new ResumeService();