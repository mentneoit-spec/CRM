import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Card, CardContent, Typography, Button,
  LinearProgress, CircularProgress, Stack, Chip,
  Tab, Tabs, Container, CardHeader, Divider
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = '#2196F3', subtext = '' }) => (
  <Card sx={{
    background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`,
    borderLeft: `4px solid ${color}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      transform: 'translateY(-2px)'
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.9rem' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
            {value}
          </Typography>
          {subtext && (
            <Typography variant="caption" sx={{ color: 'success.main' }}>
              {subtext}
            </Typography>
          )}
        </Box>
        <Icon sx={{ fontSize: 40, color: color, opacity: 0.7 }} />
      </Box>
    </CardContent>
  </Card>
);

const ComprehensiveAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 1250,
    totalTeachers: 85,
    totalRevenue: 2500000,
    pendingAdmissions: 45,
    revenueByMonth: [
      { month: 'Jan', revenue: 450000 },
      { month: 'Feb', revenue: 520000 },
      { month: 'Mar', revenue: 480000 },
      { month: 'Apr', revenue: 550000 },
      { month: 'May', revenue: 600000 },
      { month: 'Jun', revenue: 720000 }
    ],
    classDistribution: [
      { name: 'Class 1', value: 120 },
      { name: 'Class 2', value: 115 },
      { name: 'Class 3', value: 125 },
      { name: 'Class 4', value: 130 },
      { name: 'Class 5', value: 140 }
    ],
    recentAdmissions: [
      { id: 1, name: 'John Doe', class: '10 A', status: 'Approved', date: '2024-03-01' },
      { id: 2, name: 'Jane Smith', class: '9 B', status: 'Pending', date: '2024-03-02' },
      { id: 3, name: 'Mike Wilson', class: '8 A', status: 'Approved', date: '2024-03-03' }
    ],
    pendingFees: [
      { studentName: 'Alex', amount: 5000, dueDate: '2024-03-15' },
      { studentName: 'Beth', amount: 3500, dueDate: '2024-03-10' },
      { studentName: 'Charlie', amount: 2000, dueDate: '2024-03-20' }
    ],
    systemHealth: {
      database: 95,
      storage: 65,
      api: 99,
      backup: 100
    }
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const COLORS = ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#9C27B0'];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          College Administration Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Overview of all college operations and statistics
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Students"
            value={dashboardData.totalStudents}
            icon={PeopleIcon}
            color="#2196F3"
            subtext="+45 this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Teachers"
            value={dashboardData.totalTeachers}
            icon={SchoolIcon}
            color="#4CAF50"
            subtext="+5 new hires"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Revenue"
            value={`₹${(dashboardData.totalRevenue / 100000).toFixed(1)}L`}
            icon={AttachMoneyIcon}
            color="#FFC107"
            subtext="+12% YoY"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Admissions"
            value={dashboardData.pendingAdmissions}
            icon={AssignmentIcon}
            color="#F44336"
            subtext="Requires action"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Revenue Trend (Last 6 Months)"
              subheader="Monthly fee collection and payments"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2196F3"
                    strokeWidth={2}
                    dot={{ fill: '#2196F3', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Student Distribution"
              subheader="By class/grade"
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.classDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.classDistribution.map((entry, index) => (
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

      {/* Tabbed Content */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Recent Admissions" />
            <Tab label="Pending Fees" />
            <Tab label="System Health" />
            <Tab label="Quick Actions" />
          </Tabs>
        </Box>

        {/* Recent Admissions Tab */}
        {tabValue === 0 && (
          <CardContent>
            <Stack spacing={2}>
              {dashboardData.recentAdmissions.map((admission, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { backgroundColor: '#fafafa' }
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {admission.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Class {admission.class} • {admission.date}
                    </Typography>
                  </Box>
                  <Chip
                    label={admission.status}
                    color={admission.status === 'Approved' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        )}

        {/* Pending Fees Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Stack spacing={2}>
              {dashboardData.pendingFees.map((fee, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{fee.studentName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Due: {fee.dueDate}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                    ₹{fee.amount}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        )}

        {/* System Health Tab */}
        {tabValue === 2 && (
          <CardContent>
            <Stack spacing={3}>
              {Object.entries(dashboardData.systemHealth).map(([key, value]) => (
                <Box key={key}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {key}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{
                      height: 8,
                      borderRadius: '4px',
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: value > 80 ? '#4CAF50' : value > 50 ? '#FFC107' : '#F44336'
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        )}

        {/* Quick Actions Tab */}
        {tabValue === 3 && (
          <CardContent>
            <Grid container spacing={2}>
              {[
                { label: 'Add Student', icon: '👤' },
                { label: 'Upload Attendance', icon: '✓' },
                { label: 'Process Payment', icon: '💳' },
                { label: 'Generate Report', icon: '📊' },
                { label: 'Send Notice', icon: '📢' },
                { label: 'Create Exam', icon: '✏️' }
              ].map((action, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      py: 2,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{action.icon}</span>
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        )}
      </Card>
    </Container>
  );
};

export default ComprehensiveAdminDashboard;
