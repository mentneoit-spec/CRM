import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button,
  Paper, List, ListItem, ListItemText, ListItemAvatar, Divider, LinearProgress, CircularProgress
} from '@mui/material';
import {
  People, School, Payment, TrendingUp, PersonAdd, Assessment, Notifications, CheckCircle, Warning
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAdminDashboard } from '../../redux/slices/dashboardSlice';

const AdminDashboardModern = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  // Use real data if available, fallback to empty/defaults
  const stats = data?.stats || { students: 0, teachers: 0, classes: 0, revenue: 0, pendingAdmissions: 0 };
  const recentPayments = data?.recentPayments || [];

  // Temporary mock data for charts until fully implemented in backend aggregation
  const revenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 480000 },
    { month: 'Apr', revenue: 550000 },
    { month: 'May', revenue: stats?.revenue ?? 600000 },
  ];

  const admissionData = [
    { status: 'Approved', value: 145 },
    { status: 'Pending', value: stats.pendingAdmissions || 32 },
    { status: 'Rejected', value: 8 },
  ];

  const departmentData = [
    { dept: 'Grade 10', students: stats.students > 0 ? Math.floor(stats.students * 0.4) : 450 },
    { dept: 'Grade 11', students: stats.students > 0 ? Math.floor(stats.students * 0.3) : 380 },
    { dept: 'Grade 12', students: stats.students > 0 ? Math.floor(stats.students * 0.3) : 320 },
  ];

  const pendingApprovals = [
    { type: 'Student Admission', count: stats.pendingAdmissions, priority: 'high' },
    { type: 'Leave Requests', count: 12, priority: 'medium' },
  ];

  const COLORS = ['#2e7d32', '#ed6c02', '#d32f2f'];

  if (loading && !data) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box>
        {/* Welcome Banner */}
        <Paper
          sx={{
            p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', borderRadius: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Admin Dashboard 🎓
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {data?.college?.name ? `Manage ${data.college.name} efficiently with real-time insights` : 'Manage your institution efficiently with real-time insights'}
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}><People /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.students}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Students</Typography>
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
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}><School /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.teachers}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Teachers</Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={100} color="success" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}><PersonAdd /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.pendingAdmissions}</Typography>
                    <Typography variant="body2" color="text.secondary">Pending Admissions</Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={stats.pendingAdmissions > 0 ? 50 : 0} color="warning" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}><Payment /></Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{stats.revenue.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={75} color="info" sx={{ height: 6, borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Revenue Trend</Typography>
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
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Admission Status</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={admissionData} cx="50%" cy="50%" labelLine={false} label={({ status, value }) => `${status}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {admissionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Pending Approvals</Typography>
                  <Chip icon={<Warning />} label={pendingApprovals.length} size="small" color="warning" />
                </Box>
                <List>
                  {pendingApprovals.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: item.priority === 'high' ? 'error.light' : 'warning.light' }}><Assessment /></Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={item.type} secondary={`${item.count} pending • Priority: ${item.priority}`} />
                        <Button size="small" variant="contained">Review</Button>
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Payments (Live)</Typography>
                  <Chip icon={<Notifications />} label="Live" size="small" color="success" />
                </Box>
                <List>
                  {recentPayments.length === 0 ? <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No recent payments.</Typography> :
                    recentPayments.map((payment, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'success.light' }}><CheckCircle /></Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={`₹${payment.amount} by ${payment.student?.name || 'Unknown'}`} secondary={new Date(payment.createdAt).toLocaleString()} />
                        </ListItem>
                        {index < recentPayments.length - 1 && <Divider />}
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
