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
  School,
  Payment,
  TrendingUp,
  PersonAdd,
  Assessment,
  Notifications,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const AdminDashboardModern = () => {
  // Sample data
  const revenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 480000 },
    { month: 'Apr', revenue: 550000 },
    { month: 'May', revenue: 600000 },
  ];

  const admissionData = [
    { status: 'Approved', value: 145 },
    { status: 'Pending', value: 32 },
    { status: 'Rejected', value: 8 },
  ];

  const departmentData = [
    { dept: 'Science', students: 450 },
    { dept: 'Commerce', students: 380 },
    { dept: 'Arts', students: 320 },
    { dept: 'Engineering', students: 520 },
  ];

  const recentActivities = [
    { activity: 'New student admission approved', user: 'John Doe', time: '5 mins ago' },
    { activity: 'Fee payment received', user: 'Jane Smith', time: '15 mins ago' },
    { activity: 'Teacher profile updated', user: 'Prof. Kumar', time: '1 hour ago' },
  ];

  const pendingApprovals = [
    { type: 'Student Admission', count: 32, priority: 'high' },
    { type: 'Leave Requests', count: 12, priority: 'medium' },
    { type: 'Fee Waivers', count: 5, priority: 'low' },
  ];

  const COLORS = ['#2e7d32', '#ed6c02', '#d32f2f'];

  return (
    <DashboardLayout role="admin">
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
            Admin Dashboard 🎓
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage your institution efficiently with real-time insights
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
                      1,670
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +12% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      85
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Teachers
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={95} color="success" sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +5 new this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                    <PersonAdd />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      32
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Admissions
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={40} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                  Requires attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ₹6L
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={75} color="info" sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +18% from last month
                </Typography>
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
                  Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Admission Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={admissionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, value }) => `${status}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {admissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Department-wise Student Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#1976d2" radius={[8, 8, 0, 0]} />
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
                    Pending Approvals
                  </Typography>
                  <Chip icon={<Warning />} label={pendingApprovals.length} size="small" color="warning" />
                </Box>
                <List>
                  {pendingApprovals.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: item.priority === 'high' ? 'error.light' : item.priority === 'medium' ? 'warning.light' : 'info.light' }}>
                            <Assessment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.type}
                          secondary={`${item.count} pending • Priority: ${item.priority}`}
                        />
                        <Button size="small" variant="contained">
                          Review
                        </Button>
                      </ListItem>
                      {index < pendingApprovals.length - 1 && <Divider />}
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
                    Recent Activities
                  </Typography>
                  <Chip icon={<Notifications />} label="Live" size="small" color="success" />
                </Box>
                <List>
                  {recentActivities.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <CheckCircle />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.activity}
                          secondary={`${item.user} • ${item.time}`}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider />}
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

export default AdminDashboardModern;
