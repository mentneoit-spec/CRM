/**
 * Exam Evaluation Routes
 * All routes require authentication (authMiddleware applied in index.js).
 * Role-based access:
 *   - Admin / SuperAdmin / Teacher → full access
 *   - Student                      → evaluate own answers + view own results
 */

const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const { authorize, authorizeCollege } = require('../middleware/auth');
const {
  evaluateStudentAnswer,
  getEvaluationResults,
  getEvaluationDashboard,
  deleteEvaluation,
} = require('../controllers/exam-evaluation-controller');

// ── Validation error handler ──────────────────────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── POST /api/exam-eval/evaluate ─────────────────────────────────────────────
// Accessible by: Admin, SuperAdmin, Teacher, Student
router.post(
  '/evaluate',
  authorize('Admin', 'SuperAdmin', 'Teacher', 'Student'),
  authorizeCollege,
  [
    body('question')
      .trim()
      .isLength({ min: 5, max: 2000 })
      .withMessage('Question must be 5–2000 characters.'),
    body('studentAnswer')
      .trim()
      .isLength({ min: 3, max: 5000 })
      .withMessage('Answer must be 3–5000 characters.'),
    body('maxMarks')
      .isInt({ min: 1, max: 1000 })
      .withMessage('maxMarks must be an integer between 1 and 1000.'),
    body('studentId').notEmpty().withMessage('studentId is required.'),
    body('examId').notEmpty().withMessage('examId is required.'),
  ],
  handleValidation,
  evaluateStudentAnswer
);

// ── GET /api/exam-eval/results ────────────────────────────────────────────────
// Accessible by: Admin, SuperAdmin, Teacher, Student
router.get(
  '/results',
  authorize('Admin', 'SuperAdmin', 'Teacher', 'Student'),
  authorizeCollege,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be ≥ 1.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
  ],
  handleValidation,
  getEvaluationResults
);

// ── GET /api/exam-eval/dashboard ──────────────────────────────────────────────
// Accessible by: Admin, SuperAdmin, Teacher
router.get(
  '/dashboard',
  authorize('Admin', 'SuperAdmin', 'Teacher'),
  authorizeCollege,
  getEvaluationDashboard
);

// ── DELETE /api/exam-eval/results/:id ────────────────────────────────────────
// Accessible by: Admin, SuperAdmin
router.delete(
  '/results/:id',
  authorize('Admin', 'SuperAdmin'),
  authorizeCollege,
  [param('id').notEmpty().withMessage('id is required.')],
  handleValidation,
  deleteEvaluation
);

module.exports = router;
