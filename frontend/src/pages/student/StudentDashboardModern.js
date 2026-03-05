import React, { useState, useEffect } from 'react';
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
  Divider,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Event,
  Payment,
  School,
  CheckCircle,
  ArrowForward,
  Book,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { studentAPI } from '../../services/api';

const StudentDashboardModern = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getDashboard();
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      // Set fallback data for demo
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setDashboardData({
        student: { 
          name: user.name || 'Student', 
          studentId: 'STU001',
          sclass: { sclassName: 'Not Assigned' } 
        },
        stats: {
          attendance: { percentage: 0, present: 0, total: 0 },
          marks: null,
          fees: { totalDue: 0, pendingCount: 0 },
          homework: 0,
        },
        recentMarks: [],
        upcomingHomework: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout role="student">
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="info">No dashboard data available</Alert>
        </Container>
      </DashboardLayout>
    );
  }

  const { student, stats, recentMarks, upcomingHomework } = dashboardData;

  return (
    <DashboardLayout role="student">
      <Box>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          >
            {error} - Showing sample data
          </Alert>
        )}

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
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: '#667eea' }}>
                <School fontSize="large" />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back, {student.name}! 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Class: {student.sclass?.sclassName || 'Not Assigned'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Student ID: {student.studentId}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Attendance Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.attendance.percentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {stats.attendance.present} / {stats.attendance.total} days
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.attendance.percentage}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Homework Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.homework}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Homework
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Pending assignments
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/student/homework')}
                  fullWidth
                  variant="outlined"
                >
                  View All
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Fees Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ₹{stats.fees.totalDue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fees Due
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {stats.fees.pendingCount} pending payments
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/student/fees')}
                  fullWidth
                  variant="outlined"
                  color="warning"
                >
                  Pay Now
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.marks ? `${stats.marks.percentage?.toFixed(1)}%` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Performance
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Latest exam result
                </Typography>
                <Button 
                  size="small" 
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/student/marks')}
                  fullWidth
                  variant="outlined"
                  color="info"
                >
                  View Results
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Recent Marks */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    <Book sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Recent Exam Results
                  </Typography>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/student/marks')}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {recentMarks && recentMarks.length > 0 ? (
                  <List>
                    {recentMarks.map((mark, index) => (
                      <React.Fragment key={mark.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={mark.subject?.subName || 'Subject'}
                            secondary={`Exam: ${mark.exam?.examName || 'N/A'}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={`${mark.marksObtained}/${mark.subject?.maxMarks || 100}`}
                            color={mark.marksObtained >= (mark.subject?.passingMarks || 40) ? 'success' : 'error'}
                          />
                        </ListItem>
                        {index < recentMarks.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" py={3}>
                    No exam results available yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Homework */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Upcoming Homework
                  </Typography>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/student/homework')}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {upcomingHomework && upcomingHomework.length > 0 ? (
                  <List>
                    {upcomingHomework.map((hw, index) => (
                      <React.Fragment key={hw.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={hw.title}
                            secondary={`Subject: ${hw.subject?.subName || 'N/A'} | Due: ${new Date(hw.dueDate).toLocaleDateString()}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={new Date(hw.dueDate) < new Date() ? 'Overdue' : 'Pending'}
                            color={new Date(hw.dueDate) < new Date() ? 'error' : 'warning'}
                            size="small"
                          />
                        </ListItem>
                        {index < upcomingHomework.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" py={3}>
                    No pending homework
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<CheckCircle />}
                onClick={() => navigate('/student/attendance')}
              >
                Attendance
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Assignment />}
                onClick={() => navigate('/student/homework')}
              >
                Homework
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Event />}
                onClick={() => navigate('/student/timetable')}
              >
                Timetable
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Payment />}
                onClick={() => navigate('/student/fees')}
              >
                Pay Fees
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default StudentDashboardModern;
