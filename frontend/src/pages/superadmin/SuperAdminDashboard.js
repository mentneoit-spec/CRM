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
  Business,
  People,
  TrendingUp,
  Security,
  CloudDone,
  Warning,
  CheckCircle,
  Assessment,
  Notifications,
  Domain,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const SuperAdminDashboard = () => {
  // Sample data
  const platformData = [
    { month: 'Jan', users: 850000, revenue: 4500000 },
    { month: 'Feb', users: 920000, revenue: 5200000 },
    { month: 'Mar', users: 980000, revenue: 5800000 },
    { month: 'Apr', users: 1050000, revenue: 6200000 },
    { month: 'May', users: 1100000, revenue: 6800000 },
  ];

  const collegeDistribution = [
    { type: 'Active', value: 95 },
    { type: 'Suspended', value: 3 },
    { type: 'Pending Setup', value: 7 },
  ];

  const topColleges = [
    { name: 'Gravity College', students: 5420, revenue: 850000, status: 'active' },
    { name: 'Tech University', students: 4850, revenue: 720000, status: 'active' },
    { name: 'Elite Academy', students: 3920, revenue: 650000, status: 'active' },
    { name: 'Science Institute', students: 3450, revenue: 580000, status: 'active' },
  ];

  const recentActivities = [
    { activity: 'New college registered', college: 'Innovation College', time: '10 mins ago' },
    { activity: 'Domain verified', college: 'Gravity College', time: '1 hour ago' },
    { activity: 'Subscription upgraded', college: 'Tech University', time: '3 hours ago' },
    { activity: 'College suspended', college: 'ABC Institute', time: '5 hours ago' },
  ];

  const pendingApprovals = [
    { type: 'Domain Verification', count: 5, priority: 'high' },
    { type: 'College Registration', count: 7, priority: 'high' },
    { type: 'Subscription Changes', count: 3, priority: 'medium' },
    { type: 'Support Tickets', count: 12, priority: 'low' },
  ];

  const COLORS = ['#2e7d32', '#d32f2f', '#ed6c02'];

  return (
    <DashboardLayout role="superadmin">
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
            Super Admin Dashboard 👑
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage the entire platform with 100+ colleges and 1M+ users
          </Typography>
        </Paper>

        {/* Critical Alerts */}
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            5 colleges pending domain verification • 7 new registrations awaiting approval
          </Typography>
          <Button size="small" variant="contained" sx={{ mt: 1 }}>
            Review Now
          </Button>
        </Alert>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 56, height: 56 }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      105
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Colleges
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={95} sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +7 new this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2, width: 56, height: 56 }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      1.1M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={88} color="success" sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +150K this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.light', mr: 2, width: 56, height: 56 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      ₹68L
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={92} color="info" sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +22% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2, width: 56, height: 56 }}>
                    <CloudDone />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      99.9%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={99.9} color="success" sx={{ height: 6, borderRadius: 3 }} />
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  Excellent performance
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
                  Platform Growth Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="users" stroke="#1976d2" strokeWidth={3} name="Total Users" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={3} name="Revenue (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  College Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={collegeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, value }) => `${type}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {collegeDistribution.map((entry, index) => (
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

        {/* Top Colleges */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Top Performing Colleges
                  </Typography>
                  <Button variant="outlined" size="small">
                    View All
                  </Button>
                </Box>
                <List>
                  {topColleges.map((college, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={college.name}
                          secondary={`${college.students.toLocaleString()} students • ₹${(college.revenue / 1000).toFixed(0)}K revenue`}
                        />
                        <Chip
                          label={college.status}
                          color="success"
                          size="small"
                          sx={{ mr: 2 }}
                        />
                        <Button size="small" variant="outlined">
                          Manage
                        </Button>
                      </ListItem>
                      {index < topColleges.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
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
                  <Chip icon={<Warning />} label={pendingApprovals.reduce((sum, item) => sum + item.count, 0)} size="small" color="warning" />
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
                        <Button size="small" variant="contained" color={item.priority === 'high' ? 'error' : 'primary'}>
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
                    Recent Platform Activities
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
                          secondary={`${item.college} • ${item.time}`}
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

export default SuperAdminDashboard;
