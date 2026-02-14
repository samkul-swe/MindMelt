import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import projectService from '../services/projectService.js';
import aiService from '../services/mockAIService.js'; // Using Mock AI
import { getDoc } from '../utils/firestore.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/projects/:domain
 * Get all projects for a domain (e.g., "Mobile Engineering")
 */
router.get('/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    console.log(`[Projects] Fetching projects for domain: ${domain}`);
    
    const projects = await projectService.getProjectsByDomain(domain);
    
    res.json({
      success: true,
      domain,
      projects,
      count: projects.length
    });

  } catch (error) {
    console.error('[Projects] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

/**
 * POST /api/projects/start
 * Start a new project
 */
router.post('/start', async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    console.log(`[Projects] User ${userId} starting project ${projectId}`);

    const userProject = await projectService.startProject(userId, projectId);

    res.json({
      success: true,
      message: 'Project started successfully',
      userProject
    });

  } catch (error) {
    console.error('[Projects] Start error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start project'
    });
  }
});

/**
 * GET /api/projects/current
 * Get user's current active project
 */
router.get('/current/active', async (req, res) => {
  try {
    const userId = req.user.id;

    const currentProject = await projectService.getUserCurrentProject(userId);

    if (!currentProject) {
      return res.json({
        success: true,
        hasProject: false,
        project: null
      });
    }

    res.json({
      success: true,
      hasProject: true,
      project: currentProject
    });

  } catch (error) {
    console.error('[Projects] Get current error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current project'
    });
  }
});

/**
 * POST /api/projects/design/submit
 * Submit architecture design
 */
router.post('/design/submit', async (req, res) => {
  try {
    const { userProjectId, designText } = req.body;

    if (!userProjectId || !designText) {
      return res.status(400).json({
        success: false,
        message: 'User project ID and design text are required'
      });
    }

    await projectService.submitDesign(userProjectId, designText);

    res.json({
      success: true,
      message: 'Design submitted successfully',
      nextPhase: 'implementation'
    });

  } catch (error) {
    console.error('[Projects] Design submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit design'
    });
  }
});

/**
 * POST /api/projects/code/submit
 * Submit code implementation
 */
router.post('/code/submit', async (req, res) => {
  try {
    const { userProjectId, code, language } = req.body;

    if (!userProjectId || !code) {
      return res.status(400).json({
        success: false,
        message: 'User project ID and code are required'
      });
    }

    await projectService.submitCode(userProjectId, code, language);

    res.json({
      success: true,
      message: 'Code submitted successfully',
      nextPhase: 'review'
    });

  } catch (error) {
    console.error('[Projects] Code submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit code'
    });
  }
});

/**
 * POST /api/projects/socratic/message
 * Send message in Socratic conversation
 */
router.post('/socratic/message', async (req, res) => {
  try {
    const userId = req.user.id;
    const { userProjectId, message } = req.body;

    if (!userProjectId || !message) {
      return res.status(400).json({
        success: false,
        message: 'User project ID and message are required'
      });
    }

    // Save user message
    await projectService.addSocraticMessage(userProjectId, 'user', message);

    // Get conversation history
    const conversation = await projectService.getSocraticConversation(userProjectId);

    // Get user project and project details
    const userProject = await getDoc('user_projects', userProjectId);
    const project = await projectService.getProject(userProject.projectId);

    // Generate AI response
    const aiResponse = await aiService.generateSocraticQuestion({
      topic: project.projectName,
      background: { phase: userProject.phase },
      conversation: conversation.slice(-5), // Last 5 messages for context
      objective: project.learningObjectives[0]
    });

    // Save AI message
    await projectService.addSocraticMessage(userProjectId, 'assistant', aiResponse);

    res.json({
      success: true,
      message: aiResponse
    });

  } catch (error) {
    console.error('[Projects] Socratic message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate response'
    });
  }
});

/**
 * POST /api/projects/complete
 * Mark project as complete with performance data
 */
router.post('/complete', async (req, res) => {
  try {
    const { userProjectId } = req.body;

    console.log('[Projects] Completing project:', userProjectId);

    if (!userProjectId) {
      return res.status(400).json({
        success: false,
        message: 'User project ID is required'
      });
    }

    // Get user project data
    console.log('[Projects] Fetching user project...');
    const userProject = await getDoc('user_projects', userProjectId);
    
    if (!userProject) {
      return res.status(404).json({
        success: false,
        message: 'User project not found'
      });
    }

    console.log('[Projects] Fetching project details...');
    const project = await projectService.getProject(userProject.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get AI performance assessment
    console.log('[Projects] Getting AI assessment...');
    const performanceData = await aiService.assessPerformance({
      projectName: project.projectName,
      architectureDesign: userProject.architectureDesign,
      userCode: userProject.userCode,
      timeSpent: userProject.timeSpent
    });

    console.log('[Projects] Assessment received:', performanceData);

    // Complete the project
    console.log('[Projects] Marking project complete...');
    const result = await projectService.completeProject(userProjectId, performanceData);

    res.json({
      success: true,
      message: 'Project completed successfully',
      performance: performanceData,
      timeSpent: result.timeSpent
    });

  } catch (error) {
    console.error('[Projects] Complete error:', error);
    console.error('[Projects] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete project'
    });
  }
});

/**
 * GET /api/projects/download/:userProjectId
 * Download project code package as ZIP
 */
router.get('/download/:userProjectId', async (req, res) => {
  try {
    const { userProjectId } = req.params;

    console.log('[Projects] Generating ZIP download for:', userProjectId);

    const packageData = await projectService.generateProjectDownload(userProjectId);

    // Send ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${packageData.filename}"`);
    res.send(packageData.buffer);

    console.log('[Projects] ZIP downloaded:', packageData.filename);

  } catch (error) {
    console.error('[Projects] Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download'
    });
  }
});

/**
 * GET /api/projects/user/completed
 * Get user's completed projects
 */
router.get('/user/completed', async (req, res) => {
  try {
    const userId = req.user.id;

    const completed = await projectService.getUserCompletedProjects(userId);

    res.json({
      success: true,
      projects: completed,
      count: completed.length
    });

  } catch (error) {
    console.error('[Projects] Get completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed projects'
    });
  }
});

export default router;