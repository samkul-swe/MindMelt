import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import projectService from '../services/projectService.js';
import resumeService from '../services/resumeService.js';

const router = express.Router();

// backend/routes/dashboard.js (NEW FILE NEEDED)
router.get('/stats', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  
  // Get completed projects
  const completed = await projectService.getUserCompletedProjects(userId);
  
  // Get learning path for skill improvement
  const learningPath = await resumeService.getUserLearningPath(userId);
  const resume = await resumeService.getUserResume(userId);
  
  // Calculate improvement (mock for now)
  const skillBefore = learningPath?.currentMatch || 0;
  const skillAfter = skillBefore + (completed.length * 10); // +10% per project
  
  res.json({
    success: true,
    projectsCompleted: completed.length,
    totalProjects: 5,
    skillBefore: skillBefore,
    skillAfter: skillAfter,
    skillImprovement: skillAfter - skillBefore,
    lastAchievement: completed.length > 0 
      ? `${completed[completed.length - 1].projectName} Completed` 
      : 'Getting Started',
    completedProjects: completed
  });
});

export default router;