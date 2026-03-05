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
import { studentAPI } from '../../services/api';

const StudentDashboardNew = () => {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">No dashboard data available</Alert>
      </Container>
    );
  }

  const { student, stats, recentMarks, upcomingHomework } = dashboardData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: '#667eea' }}>
              <School fontSize="large" />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Welcome back, {student.name}!
            </Typography>
            <Typography variant="body1">
              Class: {student.sclass?.sclassName || 'Not Assigned'}
            </Typography>
            <Typography variant="body2">
              Student ID: {student.studentId}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Attendance Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Attendance</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {stats.attendance.percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.attendance.present} / {stats.attendance.total} days
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.attendance.percentage} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Homework Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Homework</Typography>
              </Box>
              <Typography variant="h3" color="primary.main">
                {stats.homework}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending assignments
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForward />} 
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/homework')}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Fees Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Payment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Fees</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                ₹{stats.fees.totalDue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.fees.pendingCount} pending payments
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForward />} 
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/fees')}
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Performance</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {stats.marks ? `${stats.marks.percentage}%` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest exam result
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForward />} 
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/marks')}
              >
                View Results
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Marks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Book sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Exam Results
              </Typography>
              <Divider sx={{ my: 2 }} />
              {recentMarks.length > 0 ? (
                <List>
                  {recentMarks.map((mark, index) => (
                    <React.Fragment key={mark.id}>
                      <ListItem>
                        <ListItemText
                          primary={mark.subject.subName}
                          secondary={`Exam: ${mark.exam.examName}`}
                        />
                        <Chip 
                          label={`${mark.marksObtained}/${mark.subject.maxMarks}`}
                          color={mark.marksObtained >= mark.subject.passingMarks ? 'success' : 'error'}
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
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/marks')}
              >
                View All Results
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Homework */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Upcoming Homework
              </Typography>
              <Divider sx={{ my: 2 }} />
              {upcomingHomework.length > 0 ? (
                <List>
                  {upcomingHomework.map((hw, index) => (
                    <React.Fragment key={hw.id}>
                      <ListItem>
                        <ListItemText
                          primary={hw.title}
                          secondary={`Subject: ${hw.subject.subName} | Due: ${new Date(hw.dueDate).toLocaleDateString()}`}
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
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/student/homework')}
              >
                View All Homework
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
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
    </Container>
  );
};

export default StudentDashboardNew;
