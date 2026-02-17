import aiService from './aiService.js';
import conversationService from './conversationService.js';
import codeReviewService from './codeReviewService.js';
import { getDoc, createDoc, updateDoc, queryDocs } from '../utils/firestore.js';
import db from '../config/firebase.js';
import JSZip from 'jszip';

/**
 * Project Service - Handles project-based learning
 * UPDATED: Integrated with conversational flow
 */

class ProjectService {
  /**
   * Get all projects for a domain
   */
  async getProjectsByDomain(domain) {
    try {
      const snapshot = await db.collection('projects')
        .where('domain', '==', domain)
        .get();

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
   * UPDATED: Initialize conversation state
   */
  async startProject(userId, projectId) {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Create user project instance with conversation state
      const userProject = {
        userId,
        projectId,
        projectName: project.projectName,
        domain: project.domain,
        difficulty: project.difficulty,
        status: 'in_progress',
        
        // NEW: Conversation-driven state
        conversationState: {
          currentPhase: 'define',
          currentConcept: 'data_model_fields',
          completedConcepts: [],
          issuesEncountered: [],
          conceptMastery: {},
          activeFile: null,
          awaitingAction: 'conversation'
        },
        
        // NEW: Multi-file code storage
        files: {},
        
        startedAt: new Date(),
        timeSpent: 0
      };

      const docRef = await createDoc('user_projects', userProject);
      const userProjectId = docRef.id;
      
      console.log(`✅ User started project: ${project.projectName}`);
      
      // Initialize conversation
      await conversationService.initializeConversation(userProjectId, project);
      
      return { 
        id: userProjectId, 
        ...userProject, 
        project 
      };
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
      const snapshot = await db.collection('user_projects')
        .where('userId', '==', userId)
        .get();

      const projects = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.status === 'in_progress');

      if (projects.length === 0) return null;

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
   * REMOVED: submitDesign (not needed in new flow)
   * Design happens through conversation
   */

  /**
   * Submit code (NEW: integrated with conversation flow)
   */
  async submitCode(userProjectId, code, file) {
    try {
      console.log(`📝 Code submitted for ${file}`);
      
      // Let conversation service handle the review
      const result = await conversationService.handleCodeSubmission(
        userProjectId, 
        code, 
        file
      );
      
      return result;
      
    } catch (error) {
      console.error('Error submitting code:', error);
      throw error;
    }
  }

  /**
   * REMOVED: reviewCode (now handled by conversationService)
   */

  /**
   * Complete a project with performance assessment
   */
  async completeProject(userProjectId, performanceData = null) {
    try {
      const userProject = await getDoc('user_projects', userProjectId);
      
      // Calculate time spent
      const startTime = userProject.startedAt;
      const endTime = new Date();
      const timeSpentHours = (endTime - startTime.toDate()) / (1000 * 60 * 60);

      // If no performance data provided, generate it
      let performance = performanceData;
      if (!performance) {
        performance = await this.generatePerformanceAssessment(userProject);
      }

      await updateDoc('user_projects', userProjectId, {
        status: 'completed',
        completedAt: new Date(),
        performance: performance,
        timeSpent: timeSpentHours.toFixed(2)
      });

      console.log('✅ Project completed');
      
      return { 
        success: true,
        timeSpent: timeSpentHours.toFixed(2),
        performance: performance
      };
    } catch (error) {
      console.error('Error completing project:', error);
      throw error;
    }
  }

  /**
   * Generate performance assessment (MOCK)
   */
  async generatePerformanceAssessment(userProject) {
    console.log('📊 MOCK: Generating performance assessment...');
    
    const state = userProject.conversationState;
    const issues = state.issuesEncountered || [];
    
    // Calculate scores based on issues
    const architectureScore = Math.max(70, 100 - (issues.length * 5));
    const implementationScore = Math.max(65, 95 - (issues.length * 8));
    const debuggingScore = issues.length > 3 ? 70 : 85;
    const understandingScore = Object.keys(state.conceptMastery || {}).length * 15;
    
    const overallScore = Math.round(
      (architectureScore + implementationScore + debuggingScore + understandingScore) / 4
    );
    
    return {
      scores: {
        architecture: architectureScore,
        implementation: implementationScore,
        debugging: debuggingScore,
        understanding: understandingScore
      },
      overallScore: overallScore,
      strengths: [
        'Followed conversational guidance well',
        'Fixed issues when pointed out',
        'Completed all concepts'
      ],
      gaps: issues.map(i => i.type).slice(0, 3),
      nextProjectRecommendations: {
        focusAreas: ['Error handling', 'Edge cases'],
        scaffoldingLevel: issues.length > 5 ? 'high' : 'medium',
        difficulty: 'same'
      },
      readyForNextProject: true
    };
  }

  /**
   * Generate downloadable project package as ZIP
   */
  async generateProjectDownload(userProjectId) {
    try {
      const userProject = await getDoc('user_projects', userProjectId);
      const project = await this.getProject(userProject.projectId);

      const zip = new JSZip();

      // Add all code files
      const files = userProject.files || {};
      Object.keys(files).forEach(filename => {
        const fileData = files[filename];
        zip.file(filename, fileData.currentCode || '// No code yet');
      });

      // Add README
      const readme = this.generateReadme(project, userProject);
      zip.file('README.md', readme);

      // Add package.json / build config
      const packageJson = {
        name: project.projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: project.description,
        main: 'App.java',
        scripts: {
          build: 'javac *.java',
          run: 'java App'
        }
      };
      zip.file('package.json', JSON.stringify(packageJson, null, 2));

      // Generate ZIP as buffer
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      const filename = `${project.order || '1'}_${project.projectName.toLowerCase().replace(/\s+/g, '_')}.zip`;

      return {
        buffer: zipBuffer,
        filename: filename,
        projectName: project.projectName
      };
    } catch (error) {
      console.error('Error generating download:', error);
      throw error;
    }
  }

  /**
   * Generate README for project
   */
  generateReadme(project, userProject) {
    const state = userProject.conversationState || {};
    const completedConcepts = state.completedConcepts || [];
    const issuesEncountered = state.issuesEncountered || [];
    
    return `# ${project.projectName}

**Difficulty:** ${project.difficulty}  
**Completed:** ${new Date(userProject.completedAt?.toDate()).toLocaleDateString()}  
**Time Spent:** ${userProject.timeSpent} hours  
**Score:** ${userProject.performance?.overallScore || 'N/A'}/100

## Description

${project.description}

## What I Built

Through conversational learning, I implemented:

${completedConcepts.map(c => `- ${c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n')}

## Challenges Overcome

${issuesEncountered.length > 0 
  ? issuesEncountered.map(i => `- ${i.description} (${i.type})`).join('\n')
  : '- Built smoothly with guidance'}

## Performance Analysis

**Overall Score:** ${userProject.performance?.overallScore}/100

**Strengths:**
${userProject.performance?.strengths?.map(s => `- ${s}`).join('\n') || '- Strong implementation'}

**Areas for Growth:**
${userProject.performance?.gaps?.map(g => `- ${g}`).join('\n') || '- Continue practicing'}

## Skills Demonstrated

- Conversational problem-solving
- Iterative development
- Bug fixing and debugging
- Code review incorporation

---

*Built with MindMelt - Conversational AI Learning Platform*
*Learn by building, not just reading.*
`;
  }

  /**
   * Get conversation for a project
   * (Delegated to conversationService)
   */
  async getConversation(userProjectId) {
    return await conversationService.getConversation(userProjectId);
  }
}

export default new ProjectService();