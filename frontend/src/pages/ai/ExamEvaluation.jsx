/**
 * ExamEvaluation.jsx
 * AI-powered answer evaluation page.
 * Accessible by Admin, Teacher, and Student roles.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Psychology,
  Send,
  CheckCircle,
  Refresh,
  ArrowBack,
  Lightbulb,
  Assessment,
  Warning,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import api from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getScoreColor = (pct) => {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#3b82f6';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (pct) => {
  if (pct >= 80) return 'Excellent';
  if (pct >= 60) return 'Good';
  if (pct >= 40) return 'Average';
  return 'Needs Improvement';
};

const ScoreRing = ({ score, maxMarks }) => {
  const pct = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;
  const color = getScoreColor(pct);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={130} height={130}>
        <circle cx={65} cy={65} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={10} />
        <circle
          cx={65} cy={65} r={radius} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{pct}%</Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>{score}/{maxMarks}</Typography>
      </Box>
    </Box>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const ExamEvaluation = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role = user?.role || 'Admin';

  // Form state
  const [question, setQuestion] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [maxMarks, setMaxMarks] = useState(10);
  const [studentId, setStudentId] = useState('');
  const [examId, setExamId] = useState('');

  // Data lists
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Evaluation state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // ── Load students & exams ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        if (role === 'Student') {
          // Students evaluate their own answers — pre-fill studentId
          setStudentId(user?.StudentProfile?.id || user?.id || '');
          const examsRes = await api.get('/student/exams');
          setExams(Array.isArray(examsRes?.data) ? examsRes.data : []);
        } else if (role === 'Teacher') {
          const [studentsRes, examsRes] = await Promise.all([
            api.get('/teacher/students-all').catch(() => ({ data: [] })),
            api.get('/teacher/exams'),
          ]);
          setStudents(Array.isArray(studentsRes?.data) ? studentsRes.data : []);
          setExams(Array.isArray(examsRes?.data) ? examsRes.data : []);
        } else {
          // Admin / SuperAdmin
          const [studentsRes, examsRes] = await Promise.all([
            adminAPI.getAllStudents(),
            adminAPI.getExams(),
          ]);
          const sArr = studentsRes?.data ?? studentsRes ?? [];
          const eArr = examsRes?.data ?? examsRes ?? [];
          setStudents(Array.isArray(sArr) ? sArr : []);
          setExams(Array.isArray(eArr) ? eArr : []);
        }
      } catch (e) {
        console.warn('Could not load students/exams:', e?.message);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit evaluation ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!question.trim() || !studentAnswer.trim()) {
      setError('Please fill in both the question and the student answer.');
      return;
    }
    if (!studentId) {
      setError('Please select a student.');
      return;
    }
    if (!examId) {
      setError('Please select an exam.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/exam-eval/evaluate', {
        question: question.trim(),
        studentAnswer: studentAnswer.trim(),
        maxMarks: parseInt(maxMarks, 10),
        studentId,
        examId,
      });

      // api interceptor returns response.data directly
      const data = res?.data ?? res;
      setResult(data);
    } catch (err) {
      setError(err?.message || 'Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setStudentAnswer('');
    setMaxMarks(10);
    setResult(null);
    setError('');
  };

  const backPath = role === 'Teacher' ? '/teacher/ai' : role === 'Student' ? '/student/ai' : '/admin/ai';

  return (
    <DashboardLayout role={role}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(backPath)} sx={{ bgcolor: '#f3f4f6' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#6366f1', borderRadius: 2, p: 1, display: 'flex' }}>
              <Psychology sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                AI Exam Evaluator
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Powered by Groq AI — instant, detailed answer evaluation
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* ── Left: Input Form ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', height: '100%' }}>
              <CardHeader
                title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Evaluate Answer</Typography>}
                subheader="Fill in the details and let AI score the response"
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  {/* Student selector */}
                  {role !== 'Student' && (
                    <FormControl fullWidth size="small" disabled={loadingData}>
                      <InputLabel>Student</InputLabel>
                      <Select
                        value={studentId}
                        label="Student"
                        onChange={(e) => setStudentId(e.target.value)}
                      >
                        <MenuItem value=""><em>Select student…</em></MenuItem>
                        {students.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name} {s.studentId ? `(${s.studentId})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Exam selector */}
                  <FormControl fullWidth size="small" disabled={loadingData}>
                    <InputLabel>Exam</InputLabel>
                    <Select
                      value={examId}
                      label="Exam"
                      onChange={(e) => setExamId(e.target.value)}
                    >
                      <MenuItem value=""><em>Select exam…</em></MenuItem>
                      {exams.map((ex) => (
                        <MenuItem key={ex.id} value={ex.id}>{ex.examName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Max marks */}
                  <TextField
                    label="Maximum Marks"
                    type="number"
                    size="small"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Math.max(1, Math.min(1000, parseInt(e.target.value, 10) || 1)))}
                    inputProps={{ min: 1, max: 1000 }}
                    fullWidth
                  />

                  {/* Question */}
                  <TextField
                    label="Question"
                    multiline
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter the exam question here…"
                    fullWidth
                    inputProps={{ maxLength: 2000 }}
                    helperText={`${question.length}/2000`}
                  />

                  {/* Student Answer */}
                  <TextField
                    label="Student Answer"
                    multiline
                    rows={5}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Paste or type the student's answer here…"
                    fullWidth
                    inputProps={{ maxLength: 5000 }}
                    helperText={`${studentAnswer.length}/5000`}
                  />

                  {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
                      sx={{
                        flex: 1,
                        bgcolor: '#6366f1',
                        '&:hover': { bgcolor: '#4f46e5' },
                        borderRadius: 2,
                        py: 1.2,
                        fontWeight: 700,
                      }}
                    >
                      {loading ? 'Evaluating…' : 'Evaluate with AI'}
                    </Button>
                    <Tooltip title="Reset form">
                      <IconButton onClick={handleReset} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {loading && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        AI is evaluating the answer…
                      </Typography>
                      <LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Right: Result Panel ── */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', height: '100%' }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: '#22c55e' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Evaluation Result</Typography>
                      </Box>
                    }
                    subheader={`${result.studentName || 'Student'} · ${result.examName || 'Exam'}`}
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Score ring */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ScoreRing score={result.score} maxMarks={result.maxMarks} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: getScoreColor(result.percentage) }}>
                          {result.score} / {result.maxMarks}
                        </Typography>
                        <Chip
                          label={getScoreLabel(result.percentage)}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: getScoreColor(result.percentage) + '20',
                            color: getScoreColor(result.percentage),
                            fontWeight: 700,
                          }}
                        />
                        {result.similarityScore !== undefined && (
                          <Tooltip title="Similarity between question and answer (high = possible copy-paste)">
                            <Chip
                              icon={<Warning sx={{ fontSize: 14 }} />}
                              label={`Similarity: ${Math.round(result.similarityScore * 100)}%`}
                              size="small"
                              sx={{ mt: 0.5, ml: 0.5, bgcolor: '#fef3c7', color: '#92400e' }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Divider />

                    {/* Feedback */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Assessment sx={{ color: '#6366f1', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151' }}>
                          Feedback
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>
                          {result.feedback}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Suggestions */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Lightbulb sx={{ color: '#f59e0b', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151' }}>
                          Suggestions for Improvement
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#fffbeb', borderRadius: 2, p: 2, border: '1px solid #fde68a' }}>
                        <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>
                          {result.suggestions}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={handleReset}
                      sx={{ borderRadius: 2, borderColor: '#6366f1', color: '#6366f1' }}
                    >
                      Evaluate Another Answer
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#fafafa',
                    border: '2px dashed #e5e7eb',
                  }}
                >
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Psychology sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                      Results will appear here
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#d1d5db', mt: 1 }}>
                      Fill in the form and click "Evaluate with AI"
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default ExamEvaluation;
