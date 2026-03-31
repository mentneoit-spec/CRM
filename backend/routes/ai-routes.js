const express = require('express');
const router = express.Router();
const {
  getHRInsights,
  chatWithHRAI,
  analyzeSalary,
  analyzeTeam,
  getSalaryRecommendations,
} = require('../controllers/ai-controller');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET HR Insights using Real Groq AI
 * POST /api/ai/hr-insights
 * Body: { query: string, collegeId: string }
 */
router.post('/hr-insights', getHRInsights);

/**
 * Chat with AI HR Assistant
 * POST /api/ai/chat
 * Body: { messages: [{role, content}], collegeId: string }
 */
router.post('/chat', chatWithHRAI);

/**
 * Analyze Salary Data with AI
 * POST /api/ai/analyze-salary
 * Body: { collegeId: string }
 */
router.post('/analyze-salary', analyzeSalary);

/**
 * Analyze Team Performance with AI
 * POST /api/ai/analyze-team
 * Body: { collegeId: string }
 */
router.post('/analyze-team', analyzeTeam);

/**
 * Get Salary Increment Recommendations
 * POST /api/ai/salary-recommendations
 * Body: { collegeId: string }
 */
router.post('/salary-recommendations', getSalaryRecommendations);

module.exports = router;
