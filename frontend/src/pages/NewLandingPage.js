import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Stack,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  School,
  Dashboard,
  Security,
  Speed,
  CloudDone,
  People,
  Assessment,
  Payment,
  Event,
  Assignment,
  Notifications,
  CheckCircle,
  ArrowForward,
  Menu as MenuIcon,
  TrendingUp,
  Verified,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NewLandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Dashboard sx={{ fontSize: 48 }} />,
      title: 'Unified Dashboard',
      description: 'Centralized control panel with real-time insights for all college operations',
      color: theme.palette.primary.main,
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with 2FA, JWT, role-based access, and encrypted data',
      color: theme.palette.error.main,
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: 'Lightning Fast',
      description: 'Optimized for 50K+ concurrent users with sub-200ms response times',
      color: theme.palette.warning.main,
    },
    {
      icon: <CloudDone sx={{ fontSize: 48 }} />,
      title: 'Cloud Native',
      description: 'Scalable infrastructure supporting 1M+ users across 100+ institutions',
      color: theme.palette.info.main,
    },
    {
      icon: <People sx={{ fontSize: 48 }} />,
      title: 'Multi-Tenant',
      description: 'Complete data isolation with white-label branding and custom domains',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Assessment sx={{ fontSize: 48 }} />,
      title: 'Advanced Analytics',
      description: 'Comprehensive reports, attendance tracking, and performance dashboards',
      color: theme.palette.success.main,
    },
    {
      icon: <Event sx={{ fontSize: 48 }} />,
      title: 'Attendance System',
      description: 'Digital attendance tracking with automated reports and alerts',
      color: theme.palette.primary.main,
    },
    {
      icon: <Assignment sx={{ fontSize: 48 }} />,
      title: 'Homework Management',
      description: 'Create, assign, and track homework with file attachments',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Payment sx={{ fontSize: 48 }} />,
      title: 'Fee Management',
      description: 'Complete fee structure with Razorpay integration and automated reminders',
      color: theme.palette.success.main,
    },
    {
      icon: <School sx={{ fontSize: 48 }} />,
      title: 'Admission Portal',
      description: 'Online admission forms with document upload and approval workflow',
      color: theme.palette.info.main,
    },
    {
      icon: <Notifications sx={{ fontSize: 48 }} />,
      title: 'Communication Hub',
      description: 'Notice board, announcements, and parent-teacher communication',
      color: theme.palette.warning.main,
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Performance Tracking',
      description: 'Track student progress, exam results, and academic performance',
      color: theme.palette.error.main,
    },
  ];

  const stats = [
    { value: '1M+', label: 'Users Supported', icon: <People /> },
    { value: '100+', label: 'Colleges', icon: <School /> },
    { value: '99.9%', label: 'Uptime', icon: <Verified /> },
    { value: '50K', label: 'Concurrent Users', icon: <Speed /> },
  ];

  const roles = [
    {
      title: 'Super Admin',
      subtitle: 'Platform Owner',
      color: theme.palette.error.main,
      icon: <Security />,
      features: [
        'Create & manage colleges',
        'Approve custom domains',
        'Platform analytics & monitoring',
        'Subscription management',
        'Audit logs & security',
      ],
    },
    {
      title: 'College Admin',
      subtitle: 'Institution Management',
      color: theme.palette.primary.main,
      icon: <Dashboard />,
      features: [
        'Manage students & teachers',
        'Approve admissions',
        'Define fee structure',
        'Customize branding',
        'View comprehensive reports',
      ],
    },
    {
      title: 'Teacher',
      subtitle: 'Academic Management',
      color: theme.palette.success.main,
      icon: <School />,
      features: [
        'Mark attendance',
        'Upload homework & assignments',
        'Conduct online exams',
        'Upload marks & grades',
        'View student reports',
      ],
    },
    {
      title: 'Student',
      subtitle: 'Learning Portal',
      color: theme.palette.info.main,
      icon: <Assignment />,
      features: [
        'View attendance & marks',
        'Access homework & assignments',
        'Take online exams',
        'View fee details',
        'Download reports',
      ],
    },
    {
      title: 'Parent',
      subtitle: 'Child Monitoring',
      color: theme.palette.warning.main,
      icon: <People />,
      features: [
        "Track child's attendance",
        'View academic progress',
        'Pay fees online (Razorpay)',
        'View payment history',
        'Submit feedback',
      ],
    },
    {
      title: 'Accounts Team',
      subtitle: 'Financial Management',
      color: theme.palette.secondary.main,
      icon: <Payment />,
      features: [
        'View all payments',
        'Manual payment entry',
        'Process refunds',
        'Generate payment reports',
        'Export to CSV',
      ],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation */}
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ fontSize: 36, color: 'primary.main', mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              College ERP
            </Typography>
          </Box>
          {!isMobile && (
            <S