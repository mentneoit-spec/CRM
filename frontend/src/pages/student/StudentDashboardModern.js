import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Event,
  Payment,
  School,
  CheckCircle,
  ArrowForward,
  Notifications,
  Book,
} from '@mui/icons-material';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const StudentDashboardModern = () => {
  // Sample data
  const attendanceData = [
    { month: 'Jan', percentage: 92 },
    { month: 'Feb', percentage: 88 },
    { month: 'Mar', percentage: 95 },
    { month: 'Apr', percentage: 90 },
    { month: 'May', percentage: 93 },
  ];

  const subjectMarks = [
    { subject: 'Mathematics', marks: 85, total: 100 },
    { subject: 'Physics', marks: 78, total: 100 },
    { subject: 'Chemistry', marks: 92, total: 100 },
    { subject: 'English', marks: 88, total: 100 },
    { subject: 'Computer Sci', marks: 95, total: 100 },
  ];

  const upcomingEvents = [
    { title: 'Mid-term Exam - Mathematics', date: '2026-03-15', type: 'exam' },
    { title: 'Assignment Due - Physics Lab', date: '2026-03-10', type: 'assignment' },
    { title: 'Parent-Teacher Meeting', date: '2026-03-20', type: 'event' },
    { title: 'Sports Day', date: '2026-03-25', type: 'event' },
  ];

  const recentNotices = [
    { title: 'Holiday Notice', date: '2 hours ago', priority: 'high' },
    { title: 'Library Timing Update', date: '1 day ago', priority: 'medium' },
    { title: 'New Course Material Available', date: '2 days ago', priority: 'low' },
  ];

  const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0'];

  return (
    <DashboardLayout role="student">
      <Box>
        {/* Welcome Section */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back, John! 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                You have 3 assignments due this week and 2 upcoming exams
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Chip
                label="Class 10-A"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1 }}
              />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Roll No: 2024001
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      92%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={92}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      12/15
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assignments
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={80}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      87.5%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={87.5}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.light', mr: 2 }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ₹0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Fees
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label="All Paid"
                  size="small"
                  color="success"
                  icon={<CheckCircle />}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Attendance Trend */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Attendance Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#1976d2"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Subject Performance */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Subject Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectMarks}
                      dataKey="marks"
                      nameKey="subject"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {subjectMarks.map((entry, index) => (
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

        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Upcoming Events
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />}>
                    View All
                  </Button>
                </Box>
                <List>
                  {upcomingEvents.map((event, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                event.type === 'exam'
                                  ? 'error.light'
                                  : event.type === 'assignment'
                                  ? 'warning.light'
                                  : 'primary.light',
                            }}
                          >
                            {event.type === 'exam' ? (
                              <Assignment />
                            ) : event.type === 'assignment' ? (
                              <Book />
                            ) : (
                              <Event />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={event.title}
                          secondary={event.date}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {index < upcomingEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Notices */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Notices
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />}>
                    View All
                  </Button>
                </Box>
                <List>
                  {recentNotices.map((notice, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                notice.priority === 'high'
                                  ? 'error.light'
                                  : notice.priority === 'medium'
                                  ? 'warning.light'
                                  : 'info.light',
                            }}
                          >
                            <Notifications />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notice.title}
                          secondary={notice.date}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <Chip
                          label={notice.priority}
                          size="small"
                          color={
                            notice.priority === 'high'
                              ? 'error'
                              : notice.priority === 'medium'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </ListItem>
                      {index < recentNotices.length - 1 && <Divider />}
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

export default StudentDashboardModern;
