import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button,
  Paper, List, ListItem, ListItemText, ListItemAvatar, Divider, LinearProgress, CircularProgress,
  Container
} from '@mui/material';
import {
  People, School, Payment, TrendingUp, PersonAdd, Assessment, Notifications, CheckCircle, Warning,
  AttachMoney, PieChart as PieChartIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
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

  // Chart/list data comes from backend aggregates (no mock values)
  const revenueData = Array.isArray(data?.revenueByMonth) ? data.revenueByMonth : [];

  const admissionData = Array.isArray(data?.admissionsByStatus)
    ? data.admissionsByStatus
    : [
      { status: 'Approved', value: 0 },
      { status: 'Pending', value: stats.pendingAdmissions || 0 },
      { status: 'Rejected', value: 0 },
    ];

  const pendingApprovals = stats.pendingAdmissions > 0
    ? [{ type: 'Student Admission', count: stats.pendingAdmissions, priority: 'high' }]
    : [];

  if (loading && !data) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Welcome Banner - Colorful Gradient */}
          <Paper
            sx={{
              p: 4, mb: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              color: 'white', 
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Welcome Back! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 300 }}>
                {data?.college?.name ? `${data.college.name} - Dashboard` : 'Admin Dashboard'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mt: 1 }}>
                Manage your institution efficiently with real-time insights and analytics
              </Typography>
            </Box>
          </Paper>

          {/* Stats Cards - Colorful Design */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Students Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Students</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>{stats.students}</Typography>
                      <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <People sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Teachers Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(245, 87, 108, 0.4)',
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Teachers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>{stats.teachers}</Typography>
                      <Chip label="Verified" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <School sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <LinearProgress variant="determinate" value={100} color="inherit" sx={{ height: 6, borderRadius: 3, mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Pending Admissions Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(79, 172, 254, 0.4)',
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Pending Admissions</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>{stats.pendingAdmissions}</Typography>
                      <Chip label="Awaiting" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <PersonAdd sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <LinearProgress variant="determinate" value={stats.pendingAdmissions > 0 ? 50 : 0} sx={{ height: 6, borderRadius: 3, mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(67, 233, 123, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(67, 233, 123, 0.4)',
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Revenue</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>₹{stats.revenue.toLocaleString()}</Typography>
                      <Chip label="This Month" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <AttachMoney sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3, mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Revenue Trend Chart */}
            <Grid item xs={12} md={8}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                      <TrendingUp sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Revenue Trend</Typography>
                      <Typography variant="body2" color="text.secondary">Monthly revenue analysis</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Admission Status Pie Chart */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#f5576c', mr: 2 }}>
                      <PieChartIcon sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Admission Status</Typography>
                      <Typography variant="body2" color="text.secondary">Current distribution</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={admissionData} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        label={({ status, value }) => `${status}: ${value}`} 
                        outerRadius={90} 
                        fill="#8884d8" 
                        dataKey="value"
                      >
                        {admissionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#43e97b', '#fa709a', '#fee140'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '2px solid #f5576c',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Bottom Section - Lists */}
          <Grid container spacing={3}>
            {/* Pending Approvals */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                borderTop: '4px solid #fa709a'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#fa709a', mr: 2 }}>
                        <Assessment sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Pending Approvals</Typography>
                    </Box>
                    <Chip 
                      icon={<Warning />} 
                      label={pendingApprovals.length} 
                      size="small" 
                      sx={{ bgcolor: '#ffe0e6', color: '#fa709a', fontWeight: 700 }}
                    />
                  </Box>
                  <List>
                    {pendingApprovals.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        ✓ No pending approvals
                      </Typography>
                    ) : pendingApprovals.map((item, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#ffe0e6' }}>
                              <Assessment sx={{ color: '#fa709a' }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={item.type}
                            secondary={`${item.count} pending • Priority: ${item.priority}`}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                          <Button size="small" variant="contained" sx={{ bgcolor: '#fa709a' }}>Review</Button>
                        </ListItem>
                        {index < pendingApprovals.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Payments */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                borderTop: '4px solid #43e97b'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#43e97b', mr: 2 }}>
                        <Payment sx={{ color: 'white' }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Payments</Typography>
                    </Box>
                    <Chip 
                      icon={<Notifications />} 
                      label="Live" 
                      size="small" 
                      sx={{ bgcolor: '#e0f7e0', color: '#43e97b', fontWeight: 700 }}
                    />
                  </Box>
                  <List>
                    {recentPayments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        No recent payments
                      </Typography>
                    ) : recentPayments.map((payment, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#e0f7e0' }}>
                              <CheckCircle sx={{ color: '#43e97b' }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={`₹${payment.amount} by ${payment.student?.name || 'Unknown'}`}
                            secondary={new Date(payment.createdAt).toLocaleString()}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                        </ListItem>
                        {index < recentPayments.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboardModern;
