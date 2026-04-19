/**
 * ExamEvaluationDashboard.jsx
 * Admin/Teacher dashboard showing all AI evaluations, stats, and per-student performance.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  People,
  Assessment,
  Refresh,
  ArrowBack,
  Delete,
  EmojiEvents,
  BarChart,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getScoreColor = (pct) => {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#3b82f6';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <motion.div whileHover={{ translateY: -4 }} transition={{ duration: 0.2 }}>
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{ bgcolor: color + '18', borderRadius: 2, p: 1.2, display: 'flex' }}>
            <Icon sx={{ color, fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.3 }}>
              {label}
            </Typography>
            {subtext && (
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>{subtext}</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ExamEvaluationDashboard = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role = user?.role || 'Admin';

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/exam-eval/dashboard');
      const data = res?.data ?? res;
      setDashData(data);
    } catch (e) {
      setError(e?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this evaluation record?')) return;
    setDeleting(id);
    try {
      await api.delete(`/exam-eval/results/${id}`);
      await load();
    } catch (e) {
      alert(e?.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const backPath = role === 'Teacher' ? '/teacher/ai' : '/admin/ai';

  // ── Pie chart data ────────────────────────────────────────────────────────
  const pieData = dashData
    ? [
        { name: 'Excellent (≥80%)', value: dashData.scoreDistribution?.excellent || 0 },
        { name: 'Good (60–79%)', value: dashData.scoreDistribution?.good || 0 },
        { name: 'Average (40–59%)', value: dashData.scoreDistribution?.average || 0 },
        { name: 'Poor (<40%)', value: dashData.scoreDistribution?.poor || 0 },
      ].filter((d) => d.value > 0)
    : [];

  // ── Bar chart data (top 8 students) ──────────────────────────────────────
  const barData = (dashData?.perStudentSummary || []).slice(0, 8).map((s) => ({
    name: s.studentName.split(' ')[0],
    percentage: s.averagePercentage,
  }));

  return (
    <DashboardLayout role={role}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(backPath)} sx={{ bgcolor: '#f3f4f6' }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: '#6366f1', borderRadius: 2, p: 1, display: 'flex' }}>
                <BarChart sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                  Evaluation Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  AI-powered exam performance analytics
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={load}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Psychology />}
              onClick={() => navigate(role === 'Teacher' ? '/teacher/exam-eval' : '/admin/exam-eval')}
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 2 }}
            >
              New Evaluation
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} sx={{ color: '#6366f1' }} />
          </Box>
        ) : !dashData || dashData.totalEvaluations === 0 ? (
          <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
            <Psychology sx={{ fontSize: 72, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#9ca3af' }}>No evaluations yet</Typography>
            <Typography variant="body2" sx={{ color: '#d1d5db', mb: 3 }}>
              Start evaluating student answers to see analytics here.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(role === 'Teacher' ? '/teacher/exam-eval' : '/admin/exam-eval')}
              sx={{ bgcolor: '#6366f1', borderRadius: 2 }}
            >
              Evaluate First Answer
            </Button>
          </Card>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              <StatCard icon={Assessment} label="Total Evaluations" value={dashData.totalEvaluations} color="#6366f1" />
              <StatCard icon={TrendingUp} label="Average Score" value={`${dashData.averagePercentage}%`} subtext={`${dashData.averageScore} pts avg`} color="#22c55e" />
              <StatCard icon={People} label="Students Evaluated" value={dashData.perStudentSummary?.length || 0} color="#3b82f6" />
              <StatCard icon={EmojiEvents} label="Top Performer" value={dashData.topPerformers?.[0]?.studentName?.split(' ')[0] || '—'} subtext={dashData.topPerformers?.[0] ? `${dashData.topPerformers[0].averagePercentage}%` : ''} color="#f59e0b" />
            </Box>

            {/* ── Charts Row ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              {/* Bar chart */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Student Performance</Typography>} subheader="Average % per student (top 8)" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <ReBarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <ReTooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={getScoreColor(entry.percentage)} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie chart */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Score Distribution</Typography>} subheader="Breakdown by performance band" />
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <ReTooltip />
                        <Legend iconType="circle" iconSize={10} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>No data</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* ── Per-Student Summary ── */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', mb: 3 }}>
              <CardHeader
                title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Student Performance Summary</Typography>}
                subheader="Ranked by average score"
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">Evaluations</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">Avg Score</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashData.perStudentSummary.map((s, idx) => (
                        <TableRow key={s.studentId} hover>
                          <TableCell>
                            {idx === 0 ? <EmojiEvents sx={{ color: '#f59e0b', fontSize: 18 }} /> : idx + 1}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 30, height: 30, bgcolor: '#6366f1', fontSize: 13 }}>
                                {s.studentName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.studentName}</Typography>
                                {s.studentCode && (
                                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>{s.studentCode}</Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={s.count} size="small" sx={{ bgcolor: '#f1f5f9' }} />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: getScoreColor(s.averagePercentage) }}>
                              {s.averagePercentage}%
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <LinearProgress
                              variant="determinate"
                              value={s.averagePercentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': { bgcolor: getScoreColor(s.averagePercentage), borderRadius: 4 },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* ── Recent Evaluations ── */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <CardHeader
                title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Evaluations</Typography>}
                subheader="Last 10 evaluated answers"
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Exam</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">Score</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">%</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        {(role === 'Admin' || role === 'SuperAdmin') && (
                          <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashData.recentEvaluations.map((ev) => (
                        <TableRow key={ev.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{ev.studentName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{ev.examName}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {ev.score}/{ev.maxMarks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${ev.percentage}%`}
                              size="small"
                              sx={{
                                bgcolor: getScoreColor(ev.percentage) + '20',
                                color: getScoreColor(ev.percentage),
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {new Date(ev.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          {(role === 'Admin' || role === 'SuperAdmin') && (
                            <TableCell align="center">
                              <Tooltip title="Delete evaluation">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(ev.id)}
                                  disabled={deleting === ev.id}
                                  sx={{ color: '#ef4444' }}
                                >
                                  {deleting === ev.id ? <CircularProgress size={16} /> : <Delete fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default ExamEvaluationDashboard;
