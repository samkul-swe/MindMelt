import aiService from './aiService.js';
import { getDoc, createDoc, updateDoc, queryDocs } from '../utils/firestore.js';
import db from '../config/firebase.js';

/**
 * Project Service - Handles project-based learning
 */

class ProjectService {
  /**
   * Get all projects for a domain
   */
  async getProjectsByDomain(domain) {
    try {
      const snapshot = await db.collection('projects')
        .where('domain', '==', domain)
        // .orderBy('order', 'asc')  // TEMPORARILY COMMENTED - need index
        .get();

      // Sort in memory instead
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return projects.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get a specific project
   */
  async getProject(projectId) {
    try {
      return await getDoc('projects', projectId);
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Start a project for a user
   */
  async startProject(userId, projectId) {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Create user project instance
      const userProject = {
        userId,
        projectId,
        projectName: project.projectName,
        domain: project.domain,
        difficulty: project.difficulty,
        status: 'design_phase', // design_phase → implementation → debugging → completed
        phase: 'design',
        designSubmitted: false,
        codeSubmitted: false,
        startedAt: new Date(),
        timeSpent: 0
      };

      const doc = await createDoc('user_projects', userProject);
      
      console.log(`✅ User started project: ${project.projectName}`);
      
      return { id: doc.id, ...userProject, project };
    } catch (error) {
      console.error('Error starting project:', error);
      throw error;
    }
  }

  /**
   * Get user's current project
   */
  async getUserCurrentProject(userId) {
    try {
      // Get all user projects (can't use compound query without index)
      const snapshot = await db.collection('user_projects')
        .where('userId', '==', userId)
        .get();

      // Filter in memory
      const projects = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.status !== 'completed');

      if (projects.length === 0) return null;

      // Get the full project details
      const userProject = projects[0];
      const projectDetails = await this.getProject(userProject.projectId);

      return {
        ...userProject,
        project: projectDetails
      };
    } catch (error) {
      console.error('Error fetching user project:', error);
      throw error;
    }
  }

  /**
   * Get user's completed projects
   */
  async getUserCompletedProjects(userId) {
    try {
      // Get all user projects, filter in memory
      const snapshot = await db.collection('user_projects')
        .where('userId', '==', userId)
        .get();

      const completed = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.status === 'completed');

      return completed;
    } catch (error) {
      console.error('Error fetching completed projects:', error);
      throw error;
    }
  }

  /**
   * Submit architecture design (Socratic phase)
   */
  async submitDesign(userProjectId, designText) {
    try {
      await updateDoc('user_projects', userProjectId, {
        architectureDesign: designText,
        designSubmitted: true,
        phase: 'implementation'
      });

      console.log('✅ Design submitted');
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting design:', error);
      throw error;
    }
  }

  /**
   * Submit code implementation
   */
  async submitCode(userProjectId, code, language = 'javascript') {
    try {
      await updateDoc('user_projects', userProjectId, {
        userCode: code,
        codeLanguage: language,
        codeSubmitted: true,
        submittedAt: new Date(),
        phase: 'review'
      });

      console.log('✅ Code submitted');
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting code:', error);
      throw error;
    }
  }

  /**
   * AI reviews code and finds issues for guided debugging
   */
  async reviewCode(userProjectId) {
    try {
      const userProject = await getDoc('user_projects', userProjectId);
      const project = await this.getProject(userProject.projectId);

      if (!userProject.userCode) {
        throw new Error('No code submitted yet');
      }

      // Get AI to review code
      const review = await aiService.reviewCode({
        code: userProject.userCode,
        requirements: project.requirements,
        commonBugs: project.commonBugs
      });

      // Save review results
      await updateDoc('user_projects', userProjectId, {
        codeReview: review,
        reviewedAt: new Date()
      });

      return review;
    } catch (error) {
      console.error('Error reviewing code:', error);
      throw error;
    }
  }

  /**
   * Complete a project
   */
  async completeProject(userProjectId, performanceData) {
    try {
      await updateDoc('user_projects', userProjectId, {
        status: 'completed',
        completedAt: new Date(),
        performance: performanceData
      });

      console.log('✅ Project completed');
      
      return { success: true };
    } catch (error) {
      console.error('Error completing project:', error);
      throw error;
    }
  }

  /**
   * Get Socratic conversation for project
   */
  async getSocraticConversation(userProjectId) {
    try {
      const doc = await getDoc('socratic_conversations', userProjectId);
      return doc?.messages || [];
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }
  }

  /**
   * Add message to Socratic conversation
   */
  async addSocraticMessage(userProjectId, role, content) {
    try {
      const existing = await getDoc('socratic_conversations', userProjectId);
      
      const message = {
        role,
        content,
        timestamp: new Date()
      };

      if (existing) {
        // Append to existing
        const messages = existing.messages || [];
        messages.push(message);
        
        await updateDoc('socratic_conversations', userProjectId, {
          messages,
          updatedAt: new Date()
        });
      } else {
        // Create new conversation
        await db.collection('socratic_conversations').doc(userProjectId).set({
          userProjectId,
          messages: [message],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
}

export default new ProjectService();