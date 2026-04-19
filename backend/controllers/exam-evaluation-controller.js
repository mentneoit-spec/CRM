/**
 * Exam Evaluation Controller
 * Handles AI-powered answer evaluation, result storage, and dashboard queries.
 */

const prisma = require('../lib/prisma');
const { evaluateAnswer } = require('../services/exam-evaluation-service');

// ─────────────────────────────────────────────
// POST /api/exam-eval/evaluate
// ─────────────────────────────────────────────
const evaluateStudentAnswer = async (req, res) => {
  try {
    const { question, studentAnswer, maxMarks, studentId, examId, subjectId } = req.body;
    const collegeId = req.collegeId;

    // ── Input validation ──────────────────────
    if (!question || !studentAnswer || !maxMarks || !studentId || !examId) {
      return res.status(400).json({
        success: false,
        message: 'question, studentAnswer, maxMarks, studentId, and examId are required.',
      });
    }

    const parsedMaxMarks = parseInt(maxMarks, 10);
    if (isNaN(parsedMaxMarks) || parsedMaxMarks <= 0 || parsedMaxMarks > 1000) {
      return res.status(400).json({
        success: false,
        message: 'maxMarks must be a positive integer ≤ 1000.',
      });
    }

    if (String(studentAnswer).trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Student answer is too short to evaluate.',
      });
    }

    // ── Verify student belongs to this college ─
    const student = await prisma.student.findFirst({
      where: { id: studentId, collegeId },
      select: { id: true, name: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in this college.',
      });
    }

    // ── Verify exam belongs to this college ────
    const exam = await prisma.exam.findFirst({
      where: { id: examId, collegeId },
      select: { id: true, examName: true },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found in this college.',
      });
    }

    // ── Call AI evaluation service ─────────────
    const aiResult = await evaluateAnswer(
      String(question).trim(),
      String(studentAnswer).trim(),
      parsedMaxMarks
    );

    // ── Persist result in DB ───────────────────
    const evaluation = await prisma.aIExamEvaluation.create({
      data: {
        question: String(question).trim(),
        studentAnswer: String(studentAnswer).trim(),
        maxMarks: parsedMaxMarks,
        score: aiResult.score,
        feedback: aiResult.feedback,
        suggestions: aiResult.suggestions,
        similarityScore: aiResult.similarityScore,
        studentId,
        examId,
        subjectId: subjectId || null,
        collegeId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Answer evaluated successfully.',
      data: {
        id: evaluation.id,
        score: evaluation.score,
        maxMarks: evaluation.maxMarks,
        percentage: parseFloat(((evaluation.score / evaluation.maxMarks) * 100).toFixed(1)),
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
        similarityScore: evaluation.similarityScore,
        studentName: student.name,
        examName: exam.examName,
        createdAt: evaluation.createdAt,
      },
    });
  } catch (error) {
    console.error('[ExamEval] evaluateStudentAnswer error:', error);

    // Surface AI-specific errors clearly
    if (error.response?.data?.error) {
      return res.status(502).json({
        success: false,
        message: 'AI service error: ' + error.response.data.error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate answer. Please try again.',
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/exam-eval/results
// Query params: studentId, examId, page, limit
// ─────────────────────────────────────────────
const getEvaluationResults = async (req, res) => {
  try {
    const collegeId = req.collegeId;
    const { studentId, examId, page = 1, limit = 20 } = req.query;

    const where = { collegeId };
    if (studentId) where.studentId = studentId;
    if (examId) where.examId = examId;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [evaluations, total] = await Promise.all([
      prisma.aIExamEvaluation.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, studentId: true } },
          exam: { select: { id: true, examName: true } },
          subject: { select: { id: true, subName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.aIExamEvaluation.count({ where }),
    ]);

    // Enrich with percentage
    const enriched = evaluations.map((e) => ({
      ...e,
      percentage: parseFloat(((e.score / e.maxMarks) * 100).toFixed(1)),
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('[ExamEval] getEvaluationResults error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch results.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/exam-eval/dashboard
// Returns aggregate stats for the admin dashboard
// ─────────────────────────────────────────────
const getEvaluationDashboard = async (req, res) => {
  try {
    const collegeId = req.collegeId;

    // Fetch all evaluations for this college (last 500 for performance)
    const evaluations = await prisma.aIExamEvaluation.findMany({
      where: { collegeId },
      include: {
        student: { select: { id: true, name: true, studentId: true } },
        exam: { select: { id: true, examName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    if (evaluations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalEvaluations: 0,
          averageScore: 0,
          averagePercentage: 0,
          topPerformers: [],
          recentEvaluations: [],
          scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
          perStudentSummary: [],
        },
      });
    }

    // ── Aggregate stats ────────────────────────
    const totalEvaluations = evaluations.length;
    const totalScore = evaluations.reduce((s, e) => s + e.score, 0);
    const totalMax = evaluations.reduce((s, e) => s + e.maxMarks, 0);
    const averagePercentage = parseFloat(((totalScore / totalMax) * 100).toFixed(1));
    const averageScore = parseFloat((totalScore / totalEvaluations).toFixed(1));

    // ── Score distribution ─────────────────────
    const scoreDistribution = { excellent: 0, good: 0, average: 0, poor: 0 };
    evaluations.forEach((e) => {
      const pct = (e.score / e.maxMarks) * 100;
      if (pct >= 80) scoreDistribution.excellent++;
      else if (pct >= 60) scoreDistribution.good++;
      else if (pct >= 40) scoreDistribution.average++;
      else scoreDistribution.poor++;
    });

    // ── Per-student summary ────────────────────
    const studentMap = {};
    evaluations.forEach((e) => {
      const sid = e.studentId;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          studentId: sid,
          studentName: e.student?.name || 'Unknown',
          studentCode: e.student?.studentId || '',
          totalScore: 0,
          totalMax: 0,
          count: 0,
        };
      }
      studentMap[sid].totalScore += e.score;
      studentMap[sid].totalMax += e.maxMarks;
      studentMap[sid].count++;
    });

    const perStudentSummary = Object.values(studentMap)
      .map((s) => ({
        ...s,
        averagePercentage: parseFloat(((s.totalScore / s.totalMax) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage);

    // ── Top performers (top 5) ─────────────────
    const topPerformers = perStudentSummary.slice(0, 5);

    // ── Recent evaluations (last 10) ──────────
    const recentEvaluations = evaluations.slice(0, 10).map((e) => ({
      id: e.id,
      studentName: e.student?.name || 'Unknown',
      examName: e.exam?.examName || 'Unknown',
      score: e.score,
      maxMarks: e.maxMarks,
      percentage: parseFloat(((e.score / e.maxMarks) * 100).toFixed(1)),
      createdAt: e.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalEvaluations,
        averageScore,
        averagePercentage,
        topPerformers,
        recentEvaluations,
        scoreDistribution,
        perStudentSummary,
      },
    });
  } catch (error) {
    console.error('[ExamEval] getEvaluationDashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/exam-eval/results/:id
// ─────────────────────────────────────────────
const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.collegeId;

    const existing = await prisma.aIExamEvaluation.findFirst({
      where: { id, collegeId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Evaluation not found.' });
    }

    await prisma.aIExamEvaluation.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Evaluation deleted.' });
  } catch (error) {
    console.error('[ExamEval] deleteEvaluation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete evaluation.' });
  }
};

module.exports = {
  evaluateStudentAnswer,
  getEvaluationResults,
  getEvaluationDashboard,
  deleteEvaluation,
};
