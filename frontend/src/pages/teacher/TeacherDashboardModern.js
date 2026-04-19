import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Assignment,
  CheckCircle,
  Schedule,
  Notifications,
  Book,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TeacherDashboardModern = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [classes, setClasses] = useState([]);
  const [avgAttendance, setAvgAttendance] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [dashboardRes, classesRes] = await Promise.all([
          teacherAPI.getDashboard(),
          teacherAPI.getClasses(),
        ]);

        if (!isMounted) return;

        const dashboardData = dashboardRes?.data?.data ?? null;
        const classesData = classesRes?.data?.data ?? [];
        setDashboard(dashboardData);
        setClasses(Array.isArray(classesData) ? classesData : []);

        const firstClassId = classesData?.[0]?.id;
        if (firstClassId) {
          const attendanceRes = await teacherAPI.getAttendance(firstClassId, { month, year });
          const byStudent = attendanceRes?.data?.data?.byStudent ?? [];
          const percentages = byStudent
            .map((s) => Number.parseFloat(s?.percentage))
            .filter((n) => Number.isFinite(n));
          if (percentages.length) {
            const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
            setAvgAttendance(avg);
          } else {
            setAvgAttendance(null);
          }

          // Build subject performance chart from real marks (average percentage per subject)
          try {
            const marksRes = await teacherAPI.getMarks({ classId: firstClassId });
            const results = marksRes?.data?.data?.results ?? [];
            const bySubject = new Map();
            for (const r of results) {
              const subjectName = r?.subject?.subName || 'Subject';
              const pct = Number.parseFloat(r?.percentage);
              if (!Number.isFinite(pct)) continue;
              const prev = bySubject.get(subjectName) || { sum: 0, count: 0 };
              prev.sum += pct;
              prev.count += 1;
              bySubject.set(subjectName, prev);
            }

            const computed = Array.from(bySubject.entries())
              .map(([subject, agg]) => ({
                subject,
                average: agg.count ? Math.round(agg.sum / agg.count) : 0,
              }))
              .sort((a, b) => b.average - a.average)
              .slice(0, 8);
            setPerformanceData(computed);
          } catch (e) {
            setPerformanceData([]);
          }
        } else {
          setAvgAttendance(null);
          setPerformanceData([]);
        }
      } catch (e) {
        if (!isMounted) return;
        setDashboard(null);
        setClasses([]);
        setAvgAttendance(null);
        setPerformanceData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = dashboard?.stats || { totalStudents: 0, classes: 0, subjects: 0, homeworkCount: 0 };

  const classData = useMemo(() => {
    if (!classes?.length) {
      return [
        { name: 'Class --', students: 0, attendance: 0 },
      ];
    }
    return classes.slice(0, 6).map((c) => ({
      name: c?.sclassName || 'Class',
      students: c?._count?.Students ?? 0,
      attendance: 0,
    }));
  }, [classes]);

  const upcomingClasses = useMemo(() => {
    if (!classes?.length) {
      return [
        { class: 'No classes assigned', details: '' },
      ];
    }
    return classes.slice(0, 3).map((c) => ({
      class: `${c?.sclassName || 'Class'}${c?.Subjects?.length ? ` • ${c.Subjects.length} subjects` : ''}`,
      details: Array.isArray(c?.Subjects)
        ? c.Subjects.map((s) => s?.subName).filter(Boolean).join(', ')
        : '',
    }));
  }, [classes]);

  const pendingTasks = useMemo(() => {
    const items = dashboard?.recentHomework || [];
    if (!items.length) {
      return [
        { task: 'No pending tasks', count: 0, deadline: '--' },
      ];
    }
    return items.slice(0, 3).map((h) => ({
      task: h?.title || 'Homework',
      count: 1,
      deadline: h?.dueDate ? new Date(h.dueDate).toLocaleDateString() : '--',
    }));
  }, [dashboard]);

  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f'];

  return (
    <DashboardLayout role="teacher">
      <Box>
        {/* Welcome Banner */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome Back, Professor! 👨‍🏫
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {loading ? 'Loading your schedule…' : `You have ${stats.classes} classes and ${stats.homeworkCount} recent assignments`}
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {loading ? '--' : stats.totalStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {loading ? '--' : `${avgAttendance === null ? '--' : Math.round(avgAttendance)}%`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Attendance
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={92} color="success" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {loading ? '--' : stats.homeworkCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Reviews
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={65} color="warning" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                    <Book />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {loading ? '--' : stats.subjects}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subjects
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={100} color="info" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Class Performance Overview
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#1976d2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Class Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={classData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, students }) => `${name}: ${students}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="students"
                    >
                      {classData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Lists */}
        <Grid container spacing={3}>
          {/* AI Exam Evaluator Card */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 52, height: 52 }}>
                    <AIIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                      AI Exam Evaluator
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Evaluate student answers instantly with Groq AI — get score, feedback & suggestions
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/teacher/exam-eval')}
                    sx={{
                      bgcolor: 'white',
                      color: '#6366f1',
                      fontWeight: 700,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      borderRadius: 2,
                    }}
                  >
                    Evaluate Answer
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/teacher/exam-eval/dashboard')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.6)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                      borderRadius: 2,
                    }}
                  >
                    View Dashboard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Today's Schedule
                  </Typography>
                  <Chip
                    icon={<Schedule />}
                    label={classes.length ? `${classes.length} Classes` : 'No Classes'}
                    size="small"
                    color="primary"
                  />
                </Box>
                <List>
                  {upcomingClasses.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <Book />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.class}
                          secondary={item.details || null}
                        />
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </ListItem>
                      {index < upcomingClasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Pending Tasks
                  </Typography>
                  <Chip icon={<Notifications />} label={pendingTasks.length} size="small" color="warning" />
                </Box>
                <List>
                  {pendingTasks.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.light' }}>
                            <Assignment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.task}
                          secondary={`${item.count} items • Due: ${item.deadline}`}
                        />
                        <Button size="small" variant="contained">
                          Start
                        </Button>
                      </ListItem>
                      {index < pendingTasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherDashboardModern;
