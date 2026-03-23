import { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Grid, CircularProgress, Alert,
    Card, CardContent, Button
} from '@mui/material';
import {
    BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    Book as BookOpenIcon,
    AttachMoney as AttachMoneyIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ClockIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    Assessment as AssessmentIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../config/api';

const GRADIENT_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

const StatCard = ({ icon: Icon, label, value, color, bgColor, gradient }) => (
    <Paper 
        sx={{ 
            p: 2.5, 
            background: gradient ? `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)` : bgColor,
            borderLeft: `5px solid ${color}`,
            borderRadius: 2,
            boxShadow: `0 4px 15px ${color}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 8px 25px ${color}40`,
            }
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem' }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color, mt: 0.5 }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
            </Box>
        </Box>
    </Paper>
);

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await adminAPI.getAnalytics();
            // The API interceptor returns response.data, which is { success: true, data: {...} }
            if (response?.success && response?.data) {
                setAnalytics(response.data);
            } else {
                setError(response?.message || 'Failed to load analytics');
            }
        } catch (err) {
            console.error('Analytics error:', err);
            setError(err?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} sx={{ color: '#667eea' }} />
                </Box>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="admin">
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            </DashboardLayout>
        );
    }

    const { summary, charts } = analytics || {};

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            📊 Analytics Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Real-time insights and performance metrics
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<RefreshIcon />}
                        onClick={loadAnalytics}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textTransform: 'none', fontWeight: 600 }}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Primary Statistics */}
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={PeopleIcon}
                            label="Total Students"
                            value={summary?.totalStudents || 0}
                            color="#FF6B6B"
                            bgColor="#FFE5E5"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={SchoolIcon}
                            label="Total Teachers"
                            value={summary?.totalTeachers || 0}
                            color="#4ECDC4"
                            bgColor="#E0F7F6"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={BookOpenIcon}
                            label="Total Classes"
                            value={summary?.totalClasses || 0}
                            color="#45B7D1"
                            bgColor="#E0F4FF"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={AttachMoneyIcon}
                            label="Total Revenue"
                            value={`₹${(summary?.totalPayments || 0).toLocaleString()}`}
                            color="#FFA07A"
                            bgColor="#FFE8D6"
                            gradient
                        />
                    </Grid>
                </Grid>

                {/* Secondary Statistics */}
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard
                            icon={CheckCircleIcon}
                            label="Completed"
                            value={summary?.completedPayments || 0}
                            color="#43E97B"
                            bgColor="#E8F8F0"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard
                            icon={ClockIcon}
                            label="Pending"
                            value={summary?.pendingPayments || 0}
                            color="#F7DC6F"
                            bgColor="#FFF9E6"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard
                            icon={PersonIcon}
                            label="Admissions"
                            value={summary?.totalAdmissions || 0}
                            color="#BB8FCE"
                            bgColor="#F5E6FF"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard
                            icon={AssessmentIcon}
                            label="Exams"
                            value={summary?.totalExams || 0}
                            color="#85C1E2"
                            bgColor="#E6F4FF"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard
                            icon={TrendingUpIcon}
                            label="Results"
                            value={summary?.totalResults || 0}
                            color="#FF6B9D"
                            bgColor="#FFE6F0"
                            gradient
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <StatCard
                            icon={BookOpenIcon}
                            label="Avg Marks"
                            value={`${summary?.averageMarks || 0}%`}
                            color="#C44569"
                            bgColor="#FFE6E6"
                            gradient
                        />
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Students by Class - Bar Chart */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                                📚 Students by Class
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts?.studentsByClass || []}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#764ba2" stopOpacity={0.3}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                                    <Bar dataKey="students" fill="url(#colorStudents)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Admissions by Status - Pie Chart */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                                📋 Admissions by Status
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={charts?.admissionsByStatus || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ status, value }) => `${status}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {(charts?.admissionsByStatus || []).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Fees by Type - Bar Chart */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                                💰 Fees by Type
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts?.feesByType || []}>
                                    <defs>
                                        <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f5576c" stopOpacity={0.3}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                                    <Bar dataKey="total" fill="url(#colorFees)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Revenue by Month - Area Chart */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                                📈 Revenue by Month
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={charts?.revenueByMonth || []}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="month" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#4facfe"
                                        strokeWidth={2}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Detailed Stats Cards */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <CardContent>
                                <Typography color="inherit" sx={{ opacity: 0.9 }} gutterBottom>
                                    Total Subjects
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {summary?.totalSubjects || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                            <CardContent>
                                <Typography color="inherit" sx={{ opacity: 0.9 }} gutterBottom>
                                    Total Fees
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {summary?.totalFees || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                            <CardContent>
                                <Typography color="inherit" sx={{ opacity: 0.9 }} gutterBottom>
                                    Total Attendance
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {summary?.totalAttendance || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: 2, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                            <CardContent>
                                <Typography color="inherit" sx={{ opacity: 0.9 }} gutterBottom>
                                    Success Rate
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {summary?.totalPayments > 0
                                        ? Math.round((summary?.completedPayments / summary?.totalPayments) * 100)
                                        : 0}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
};

export default AdminAnalytics;
