import React from 'react';
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
  Alert,
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Assignment,
  Payment,
  TrendingUp,
  Notifications,
  School,
  Event,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const ParentDashboardModern = () => {
  // Sample data
  const attendanceData = [
    { month: 'Jan', attendance: 95 },
    { month: 'Feb', attendance: 92 },
    { month: 'Mar', attendance: 96 },
    { month: 'Apr', attendance: 94 },
    { month: 'May', attendance: 97 },
  ];

  const performanceData = [
    { subject: 'Math', marks: 85 },
    { subject: 'Science', marks: 78 },
    { subject: 'English', marks: 92 },
    { subject: 'History', marks: 88 },
    { subject: 'Geography', marks: 82 },
  ];

  const upcomingEvents = [
    { event: 'Parent-Teacher Meeting', date: 'March 15, 2026', time: '10:00 AM' },
    { event: 'Annual Sports Day', date: 'March 20, 2026', time: '09:00 AM' },
    { event: 'Science Exhibition', date: 'March 25, 2026', time: '11:00 AM' },
  ];

  const recentNotices = [
    { title: 'Mid-term Exam Schedule Released', date: '2 days ago' },
    { title: 'School Timing Change Notice', date: '5 days ago' },
    { title: 'Fee Payment Reminder', date: '1 week ago' },
  ];

  return (
    <DashboardLayout role="parent">
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
            Welcome, Parent! 👨‍👩‍👧
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Track your child's academic progress and stay connected with school
          </Typography>
        </Paper>

        {/* Fee Payment Alert */}
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Fee Payment Due: ₹15,000 for Q2 2026
          </Typography>
          <Typography variant="body2">
            Last date: March 31, 2026
          </Typography>
          <Button size="small" variant="contained" sx={{ mt: 1 }}>
            Pay Now
          </Button>
        </Alert>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      94%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={94} color="success" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      85%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall Grade
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3 }} />
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
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Homework
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={40} color="warning" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.light', mr: 2 }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ₹15K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fee Due
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={75} color="error" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={7}>
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
                    <Line type="monotone" dataKey="attendance" stroke="#2e7d32" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Subject Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="marks" fill="#1976d2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Lists */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Upcoming Events
                  </Typography>
                  <Chip icon={<Event />} label={upcomingEvents.length} size="small" color="primary" />
                </Box>
                <List>
                  {upcomingEvents.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <Event />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.event}
                          secondary={`${item.date} • ${item.time}`}
                        />
                        <Button size="small" variant="outlined">
                          Details
                        </Button>
                      </ListItem>
                      {index < upcomingEvents.length - 1 && <Divider />}
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
                    Recent Notices
                  </Typography>
                  <Chip icon={<Notifications />} label="New" size="small" color="error" />
                </Box>
                <List>
                  {recentNotices.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light' }}>
                            <Notifications />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.title}
                          secondary={item.date}
                        />
                        <Button size="small" variant="text">
                          Read
                        </Button>
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

export default ParentDashboardModern;
