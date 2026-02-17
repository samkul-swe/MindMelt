import express from 'express';
import projectService from '../services/projectService.js';
import conversationService from '../services/conversationService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get all projects for a domain
 */
router.get('/:domain', authenticateToken, async (req, res) => {
  try {
    const { domain } = req.params;
    console.log('[Projects] Fetching projects for domain:', domain);
    
    const projects = await projectService.getProjectsByDomain(domain);
    res.json({ projects });
    
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get specific project
 */
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await projectService.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ project });
    
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's current active project
 */
router.get('/current/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentProject = await projectService.getUserCurrentProject(userId);
    
    res.json({ currentProject });
    
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's completed projects
 */
router.get('/user/completed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const completedProjects = await projectService.getUserCompletedProjects(userId);
    
    res.json({ completedProjects });
    
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start a project
 */
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.body;
    
    console.log(`[Projects] User ${userId} starting project ${projectId}`);
    
    const result = await projectService.startProject(userId, projectId);
    
    res.json({ 
      success: true, 
      userProject: result 
    });
    
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * NEW: Send message in Socratic conversation
 */
router.post('/socratic/message', authenticateToken, async (req, res) => {
  try {
    const { userProjectId, message } = req.body;
    
    console.log(`[Projects] Socratic message from project ${userProjectId}`);
    
    const result = await conversationService.handleUserMessage(
      userProjectId, 
      message
    );
    
    res.json({
      success: true,
      aiMessage: {
        role: 'assistant',
        content: result.message,
        timestamp: new Date(),
        action: result.action,
        file: result.file,
        template: result.template
      }
    });
    
  } catch (error) {
    console.error('[Projects] Error in Socratic message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * NEW: Get conversation history
 */
router.get('/conversation/:userProjectId', authenticateToken, async (req, res) => {
  try {
    const { userProjectId } = req.params;
    
    const messages = await conversationService.getConversation(userProjectId);
    
    res.json({ 
      success: true,
      messages 
    });
    
  } catch (error) {
    console.error('[Projects] Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * UPDATED: Submit code
 */
router.post('/code/submit', authenticateToken, async (req, res) => {
  try {
    const { userProjectId, code, file } = req.body;
    
    console.log(`[Projects] Code submission for ${file}`);
    
    const result = await projectService.submitCode(userProjectId, code, file);
    
    res.json(result);
    
  } catch (error) {
    console.error('[Projects] Error submitting code:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Complete project
 */
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { userProjectId, performanceData } = req.body;
    
    console.log('[Projects] Completing project:', userProjectId);
    
    const result = await projectService.completeProject(
      userProjectId, 
      performanceData
    );
    
    res.json(result);
    
  } catch (error) {
    console.error('[Projects] Error completing project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Download project as ZIP
 */
router.get('/download/:userProjectId', authenticateToken, async (req, res) => {
  try {
    const { userProjectId } = req.params;
    
    console.log('[Projects] Generating ZIP download for:', userProjectId);
    
    const { buffer, filename, projectName } = await projectService.generateProjectDownload(userProjectId);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
    
  } catch (error) {
    console.error('[Projects] Download error:', error);
    res.status(500).json({ 
      error: 'Failed to generate download',
      details: error.message 
    });
  }
});

export default router;