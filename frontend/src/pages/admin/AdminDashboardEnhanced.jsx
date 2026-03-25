import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button,
  Paper, Container, CircularProgress, Divider
} from '@mui/material';
import {
  People, School, Payment, TrendingUp, PersonAdd, Assessment,
  AttachMoney, Class as ClassIcon, Subject, CheckCircle, Warning
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAdminDashboard } from '../../redux/slices/dashboardSlice';
import { useNavigate } from 'react-router-dom';

const AdminDashboardEnhanced = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const stats = data?.stats || { students: 0, teachers: 0, classes: 0, revenue: 0, pendingAdmissions: 0 };

  // Mock data for analytics (replace with real API data)
  const studentGrowthData = [
    { month: 'Jan', students: 120 },
    { month: 'Feb', students: 145 },
    { month: 'Mar', students: 180 },
    { month: 'Apr', students: 210 },
    { month: 'May', students: 245 },
    { month: 'Jun', students: stats.students || 280 }
  ];

  const teacherData = [
    { name: 'Verified', count: Math.floor((stats.teachers || 50) * 0.8), fill: '#43e97b' },
    { name: 'Unverified', count: Math.floor((stats.teachers || 50) * 0.2), fill: '#fa709a' }
  ];

  const subjectsPerClassData = [
    { class: 'Class 1', subjects: 8 },
    { class: 'Class 2', subjects: 8 },
    { class: 'Class 3', subjects: 9 },
    { class: 'Class 4', subjects: 9 },
    { class: 'Class 5', subjects: 10 },
    { class: 'Class 6', subjects: 12 }
  ];

  const feesData = [
    { name: 'Collected', value: stats.revenue || 450000, fill: '#43e97b' },
    { name: 'Pending', value: 150000, fill: '#fa709a' },
    { name: 'Overdue', value: 50000, fill: '#ff6b6b' }
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 78000 },
    { month: 'Apr', revenue: 95000 },
    { month: 'May', revenue: 88000 },
    { month: 'Jun', revenue: stats.revenue || 102000 }
  ];

  const COLORS = ['#667eea', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#fee140'];

  if (loading && !data) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Welcome Banner */}
          <Paper
            sx={{
              p: 4, mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              📊 Analytics Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 300 }}>
              Complete insights and visualizations for your institution
            </Typography>
          </Paper>

          {/* Stats Cards - Clickable */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/students')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.5)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Students</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.students}</Typography>
                      <Chip label="Active" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <People sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/teachers')}
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(245, 87, 108, 0.5)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Teachers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.teachers}</Typography>
                      <Chip label="Verified" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <School sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/admissions')}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(79, 172, 254, 0.5)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Pending Admissions</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.pendingAdmissions}</Typography>
                      <Chip label="Awaiting" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <PersonAdd sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/fees')}
                sx={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(67, 233, 123, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(67, 233, 123, 0.5)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Revenue</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>₹{stats.revenue.toLocaleString()}</Typography>
                      <Chip label="This Month" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <AttachMoney sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Analytics Section */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
            <Assessment sx={{ mr: 1, color: '#667eea' }} />
            Detailed Analytics & Visualizations
          </Typography>

          {/* Row 1: Student Growth & Teacher Analytics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Student Growth Over Time */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Student Growth Trend</Typography>
                      <Typography variant="body2" color="text.secondary">Total students over time</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={studentGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '2px solid #667eea',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="#667eea"
                        strokeWidth={3}
                        dot={{ fill: '#667eea', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Teacher Analytics */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#f5576c', mr: 2 }}>
                      <School />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Teacher Status</Typography>
                      <Typography variant="body2" color="text.secondary">Verified vs Unverified</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teacherData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '2px solid #f5576c',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {teacherData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 2: Subjects & Fees Analytics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Subjects Per Class */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#4facfe', mr: 2 }}>
                      <Subject />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Subjects Distribution</Typography>
                      <Typography variant="body2" color="text.secondary">Number of subjects per class</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectsPerClassData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="class" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '2px solid #4facfe',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="subjects" fill="#4facfe" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Fees Analytics */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#43e97b', mr: 2 }}>
                      <Payment />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Fees Collection Status</Typography>
                      <Typography variant="body2" color="text.secondary">Collected vs Pending vs Overdue</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={feesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}K`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {feesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        contentStyle={{
                          background: '#fff',
                          border: '2px solid #43e97b',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 3: Monthly Revenue Trend */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#fa709a', mr: 2 }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Revenue Trend</Typography>
                      <Typography variant="body2" color="text.secondary">Revenue collection over the last 6 months</Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fa709a" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#fa709a" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        contentStyle={{
                          background: '#fff',
                          border: '2px solid #fa709a',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#fa709a"
                        strokeWidth={3}
                        fill="url(#colorRevenue)"
                        dot={{ fill: '#fa709a', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboardEnhanced;
