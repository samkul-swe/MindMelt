import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import resumeService from '../services/resumeService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.use(authenticateToken);

/**
 * POST /api/resume/upload
 * Upload and analyze resume
 */
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const userId = req.user.id;
    let resumeText;

    console.log(`[Resume] Upload request from user ${userId}`);

    if (req.file) {
      console.log('[Resume] Parsing PDF file...');
      resumeText = await resumeService.extractTextFromPDF(req.file.buffer);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a PDF file or resume text'
      });
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is too short. Please provide a complete resume.'
      });
    }

    // Analyze resume with AI
    const analysis = await resumeService.analyzeResume(resumeText);

    // Save to Firestore
    const savedResume = await resumeService.saveResumeAnalysis(
      userId,
      resumeText,
      analysis
    );

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      analysis,
      resumeId: savedResume.id
    });

  } catch (error) {
    console.error('[Resume] Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process resume'
    });
  }
});

/**
 * POST /api/resume/role-overview
 * Get quick overview of all roles (just match %)
 * IMPROVED: Single fast API call for initial view
 */
router.post('/role-overview', async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`[Resume] Role overview for user ${userId}`);

    const resume = await resumeService.getUserResume(userId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Please upload your resume first'
      });
    }

    const profile = {
      skills: resume.extractedSkills,
      experienceYears: resume.experienceYears,
      experienceLevel: resume.experienceLevel,
      projects: resume.projects
    };

    // Get quick overview (just percentages)
    const overview = await resumeService.getRoleOverview(profile);

    res.json({
      success: true,
      overview,
      profile: {
        skills: profile.skills,
        experienceYears: profile.experienceYears,
        experienceLevel: profile.experienceLevel
      }
    });

  } catch (error) {
    console.error('[Resume] Role overview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get role overview'
    });
  }
});

/**
 * POST /api/resume/role-details
 * Get detailed analysis for ONE specific role
 * IMPROVED: Called when user clicks a role card
 */
router.post('/role-details', async (req, res) => {
  try {
    const userId = req.user.id;
    const { roleName } = req.body;

    console.log(`[Resume] Detailed analysis for ${roleName}`);

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    const resume = await resumeService.getUserResume(userId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Please upload your resume first'
      });
    }

    const profile = {
      skills: resume.extractedSkills,
      experienceYears: resume.experienceYears,
      experienceLevel: resume.experienceLevel,
      projects: resume.projects
    };

    // Get detailed analysis for this specific role
    const roleDetails = await resumeService.analyzeSpecificRole(profile, roleName);

    res.json({
      success: true,
      roleName,
      details: roleDetails
    });

  } catch (error) {
    console.error('[Resume] Role details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get role details'
    });
  }
});

/**
 * POST /api/resume/select-role
 * Select target role and create learning path
 */
router.post('/select-role', async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetRole, currentMatch, timeline, motivation } = req.body;

    console.log(`[Resume] Creating learning path: ${targetRole}`);

    if (!targetRole || !timeline) {
      return res.status(400).json({
        success: false,
        message: 'Target role and timeline are required'
      });
    }

    const learningPath = await resumeService.createLearningPath(userId, {
      targetRole,
      currentMatch: currentMatch || 0,
      timeline: parseInt(timeline),
      motivation
    });

    res.json({
      success: true,
      message: 'Learning path created successfully',
      learningPath: {
        id: learningPath.id,
        targetRole: learningPath.targetRole,
        timeline: learningPath.timeline,
        status: learningPath.status
      }
    });

  } catch (error) {
    console.error('[Resume] Select role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create learning path'
    });
  }
});

/**
 * GET /api/resume/status
 * Get user's resume status
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;

    const resume = await resumeService.getUserResume(userId);
    const learningPath = await resumeService.getUserLearningPath(userId);

    res.json({
      success: true,
      hasResume: !!resume,
      hasLearningPath: !!learningPath,
      resume: resume || null,
      learningPath: learningPath || null
    });

  } catch (error) {
    console.error('[Resume] Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status'
    });
  }
});

export default router;