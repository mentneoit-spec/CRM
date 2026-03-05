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
} from '@mui/material';
import {
  People,
  Assignment,
  CheckCircle,
  Schedule,
  TrendingUp,
  Notifications,
  Book,
  Assessment,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const TeacherDashboardModern = () => {
  // Sample data
  const classData = [
    { name: 'Class A', students: 45, attendance: 92 },
    { name: 'Class B', students: 42, attendance: 88 },
    { name: 'Class C', students: 48, attendance: 95 },
  ];

  const performanceData = [
    { subject: 'Math', average: 85 },
    { subject: 'Science', average: 78 },
    { subject: 'English', average: 82 },
    { subject: 'History', average: 76 },
  ];

  const upcomingClasses = [
    { class: 'Class A - Mathematics', time: '09:00 AM', room: 'Room 101' },
    { class: 'Class B - Physics', time: '11:00 AM', room: 'Room 203' },
    { class: 'Class C - Chemistry', time: '02:00 PM', room: 'Lab 1' },
  ];

  const pendingTasks = [
    { task: 'Grade Math Assignments', count: 45, deadline: 'Today' },
    { task: 'Prepare Quiz Questions', count: 1, deadline: 'Tomorrow' },
    { task: 'Update Attendance', count: 3, deadline: 'Today' },
  ];

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
            You have 3 classes scheduled today and 45 assignments to review
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
                      135
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
                      92%
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
                      45
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
                      6
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
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Today's Schedule
                  </Typography>
                  <Chip icon={<Schedule />} label="3 Classes" size="small" color="primary" />
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
                          secondary={`${item.time} • ${item.room}`}
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
