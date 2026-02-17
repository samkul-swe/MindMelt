import aiService from './aiService.js';
import codeReviewService from './codeReviewService.js';
import { getDoc, updateDoc, createDoc } from '../utils/firestore.js';
import db from '../config/firebase.js';

/**
 * Conversation Service - Manages conversational learning flow
 */
class ConversationService {
  
  /**
   * Initialize conversation state for a new project
   */
  async initializeConversation(userProjectId, projectDetails) {
    const initialState = {
      currentConcept: 'data_model_fields', // First concept
      currentPhase: 'define', // define → implement → debug → complete
      completedConcepts: [],
      
      // Track issues encountered
      issuesEncountered: [],
      
      // Concept mastery scores
      conceptMastery: {},
      
      // Current file being edited
      activeFile: null,
      
      // Awaiting action from user
      awaitingAction: 'conversation' // 'conversation' | 'code_submission' | 'fix'
    };
    
    await updateDoc('user_projects', userProjectId, {
      conversationState: initialState
    });
    
    // Start with initial greeting
    const greeting = await aiService.generateInitialGreeting(projectDetails);
    
    await this.addMessage(userProjectId, 'assistant', greeting, {
      action: null
    });
    
    return initialState;
  }
  
  /**
   * Handle user's text message
   */
  async handleUserMessage(userProjectId, message) {
    try {
      const userProject = await getDoc('user_projects', userProjectId);
      const state = userProject.conversationState;
      
      // Save user message
      await this.addMessage(userProjectId, 'user', message);
      
      // Generate AI response based on current concept
      const aiResponse = await aiService.generateSocraticResponse({
        concept: state.currentConcept,
        userMessage: message,
        conversationHistory: await this.getRecentMessages(userProjectId, 5),
        phase: state.currentPhase
      });
      
      // Check if AI wants to open editor
      if (aiResponse.action === 'open_editor') {
        // Update state
        await updateDoc('user_projects', userProjectId, {
          'conversationState.awaitingAction': 'code_submission',
          'conversationState.activeFile': aiResponse.file
        });
        
        // Save AI message with action
        await this.addMessage(userProjectId, 'assistant', aiResponse.message, {
          action: 'open_editor',
          file: aiResponse.file,
          template: aiResponse.template
        });
        
        return {
          message: aiResponse.message,
          action: 'open_editor',
          file: aiResponse.file,
          template: aiResponse.template
        };
      }
      
      // Regular conversation continues
      await this.addMessage(userProjectId, 'assistant', aiResponse.message);
      
      return {
        message: aiResponse.message,
        action: null
      };
      
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }
  
  /**
   * Handle code submission
   */
  async handleCodeSubmission(userProjectId, code, file) {
    try {
      const userProject = await getDoc('user_projects', userProjectId);
      const state = userProject.conversationState;
      
      // Save code version
      await this.saveCodeVersion(userProjectId, file, code);
      
      // Review code based on phase
      let review;
      if (state.currentPhase === 'define') {
        // Only syntax and compilation checks
        review = await codeReviewService.reviewDefinePhase(
          code,
          'java', // TODO: get from project
          state.currentConcept
        );
      } else if (state.currentPhase === 'debug') {
        // Runtime/logic checks
        review = await codeReviewService.reviewDebugPhase(code);
      }
      
      // Has issues?
      if (review.hasIssues) {
        const issue = review.issues[0]; // Take first issue
        
        // Track this issue
        await this.trackIssue(userProjectId, issue);
        
        // Generate explanation
        const explanation = await aiService.explainIssue({
          issue: issue,
          code: code,
          concept: state.currentConcept
        });
        
        // Update state to fix mode
        await updateDoc('user_projects', userProjectId, {
          'conversationState.awaitingAction': 'fix',
          'conversationState.currentIssue': issue
        });
        
        // Save message
        await this.addMessage(userProjectId, 'assistant', explanation, {
          action: 'fix_issue',
          file: file,
          issue: issue
        });
        
        return {
          success: false,
          message: explanation,
          action: 'fix_issue',
          issue: issue,
          file: file
        };
      }
      
      // No issues! Code is good
      await this.updateConceptMastery(userProjectId, state.currentConcept, 1.0);
      
      // Move to next concept or complete
      const nextAction = await this.determineNextAction(userProjectId);
      
      return nextAction;
      
    } catch (error) {
      console.error('Error handling code submission:', error);
      throw error;
    }
  }
  
  /**
   * Determine what happens next after successful code submission
   */
  async determineNextAction(userProjectId) {
    const userProject = await getDoc('user_projects', userProjectId);
    const state = userProject.conversationState;
    
    // Concept progression for Todo App (Define phase)
    const defineConcepts = [
      'data_model_fields',
      'data_structures',
      'ui_components',
      'event_handlers',
      'persistence'
    ];
    
    const currentIndex = defineConcepts.indexOf(state.currentConcept);
    const nextConcept = defineConcepts[currentIndex + 1];
    
    if (nextConcept) {
      // Move to next concept
      await updateDoc('user_projects', userProjectId, {
        'conversationState.currentConcept': nextConcept,
        'conversationState.completedConcepts': [
          ...state.completedConcepts,
          state.currentConcept
        ],
        'conversationState.awaitingAction': 'conversation',
        'conversationState.activeFile': null
      });
      
      // Generate next concept intro
      const intro = await aiService.generateConceptIntro({
        concept: nextConcept,
        previousWork: state.completedConcepts
      });
      
      await this.addMessage(userProjectId, 'assistant', intro);
      
      return {
        success: true,
        message: intro,
        action: 'continue_conversation',
        conceptCompleted: state.currentConcept
      };
    }
    
    // All define concepts complete → Move to debug phase
    await updateDoc('user_projects', userProjectId, {
      'conversationState.currentPhase': 'debug',
      'conversationState.awaitingAction': 'conversation'
    });
    
    const debugIntro = await aiService.generateDebugIntro();
    await this.addMessage(userProjectId, 'assistant', debugIntro);
    
    return {
      success: true,
      message: debugIntro,
      action: 'start_debug',
      phaseCompleted: 'define'
    };
  }
  
  /**
   * Save code version with history
   */
  async saveCodeVersion(userProjectId, file, code) {
    const userProject = await getDoc('user_projects', userProjectId);
    const files = userProject.files || {};
    
    const fileData = files[file] || { versions: [] };
    
    fileData.versions.push({
      code: code,
      timestamp: new Date(),
      version: fileData.versions.length + 1
    });
    
    fileData.currentCode = code;
    fileData.lastUpdated = new Date();
    
    files[file] = fileData;
    
    await updateDoc('user_projects', userProjectId, { files });
  }
  
  /**
   * Track issue encountered
   */
  async trackIssue(userProjectId, issue) {
    const userProject = await getDoc('user_projects', userProjectId);
    const issues = userProject.conversationState.issuesEncountered || [];
    
    issues.push({
      type: issue.type,
      description: issue.description,
      concept: userProject.conversationState.currentConcept,
      timestamp: new Date(),
      resolved: false
    });
    
    await updateDoc('user_projects', userProjectId, {
      'conversationState.issuesEncountered': issues
    });
  }
  
  /**
   * Update concept mastery score
   */
  async updateConceptMastery(userProjectId, concept, score) {
    const userProject = await getDoc('user_projects', userProjectId);
    const mastery = userProject.conversationState.conceptMastery || {};
    
    // If they got it right first time, score = 1.0
    // If they needed fixes, score = 0.7
    mastery[concept] = score;
    
    await updateDoc('user_projects', userProjectId, {
      'conversationState.conceptMastery': mastery
    });
  }
  
  /**
   * Add message to conversation
   */
  async addMessage(userProjectId, role, content, metadata = {}) {
    try {
      // Get existing conversation
      const conversationDoc = await db.collection('socratic_conversations')
        .doc(userProjectId)
        .get();
      
      const message = {
        role,
        content,
        timestamp: new Date(),
        ...metadata
      };
      
      if (conversationDoc.exists) {
        const messages = conversationDoc.data().messages || [];
        messages.push(message);
        
        await db.collection('socratic_conversations')
          .doc(userProjectId)
          .update({
            messages,
            updatedAt: new Date()
          });
      } else {
        await db.collection('socratic_conversations')
          .doc(userProjectId)
          .set({
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
  
  /**
   * Get recent messages
   */
  async getRecentMessages(userProjectId, count = 10) {
    try {
      const conversationDoc = await db.collection('socratic_conversations')
        .doc(userProjectId)
        .get();
      
      if (!conversationDoc.exists) return [];
      
      const messages = conversationDoc.data().messages || [];
      return messages.slice(-count);
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }
  
  /**
   * Get full conversation
   */
  async getConversation(userProjectId) {
    try {
      const conversationDoc = await db.collection('socratic_conversations')
        .doc(userProjectId)
        .get();
      
      if (!conversationDoc.exists) return [];
      
      return conversationDoc.data().messages || [];
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  }
}

export default new ConversationService();