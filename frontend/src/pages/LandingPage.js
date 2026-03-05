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
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
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
  Menu as MenuIcon,
  ArrowForward,
  CheckCircle,
  Star,
  Event,
  Assignment,
  Notifications,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      title: 'Unified Dashboard',
      description: 'Centralized control panel for all college operations with real-time insights and analytics',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with 2FA, JWT authentication, role-based access, and encrypted data',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Optimized for 50K+ concurrent users with sub-200ms response times and Redis caching',
    },
    {
      icon: <CloudDone sx={{ fontSize: 40 }} />,
      title: 'Cloud Native',
      description: 'Scalable infrastructure supporting 1M+ users across 100+ institutions with auto-scaling',
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Multi-Tenant Architecture',
      description: 'Complete data isolation with white-label branding and custom domains for each college',
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'Advanced Analytics',
      description: 'Comprehensive reports, attendance analytics, performance tracking, and revenue dashboards',
    },
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: 'Academic Management',
      description: 'Complete class, subject, exam, and result management with online exam support',
    },
    {
      icon: <Event sx={{ fontSize: 40 }} />,
      title: 'Attendance System',
      description: 'Digital attendance tracking for students and teachers with automated reports and alerts',
    },
    {
      icon: <Assignment sx={{ fontSize: 40 }} />,
      title: 'Homework & Assignments',
      description: 'Create, assign, and track homework with file attachments and submission tracking',
    },
    {
      icon: <Payment sx={{ fontSize: 40 }} />,
      title: 'Fee Management',
      description: 'Complete fee structure, payment tracking, Razorpay integration, and automated reminders',
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Admission Portal',
      description: 'Online admission forms, document upload, approval workflow, and status tracking',
    },
    {
      icon: <Notifications sx={{ fontSize: 40 }} />,
      title: 'Communication Hub',
      description: 'Notice board, announcements, email notifications, and parent-teacher communication',
    },
  ];

  const stats = [
    { value: '1M+', label: 'Users Supported' },
    { value: '100+', label: 'Colleges' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50K', label: 'Concurrent Users' },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Principal, Gravity College',
      content: 'This platform transformed our college management. Everything is now streamlined and efficient.',
      rating: 5,
    },
    {
      name: 'Prof. Michael Chen',
      role: 'Dean, Tech University',
      content: 'The best ERP solution we\'ve used. Intuitive, powerful, and reliable.',
      rating: 5,
    },
    {
      name: 'Admin Team, Elite Academy',
      role: 'Administrative Staff',
      content: 'Reduced our administrative workload by 60%. Highly recommended!',
      rating: 5,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation */}
      <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              College ERP
            </Typography>
          </Box>
          {!isMobile && (
            <Stack direction="row" spacing={3} sx={{ mr: 3 }}>
              <Button color="inherit" onClick={() => scrollToSection('features')}>Features</Button>
              <Button color="inherit" onClick={() => scrollToSection('roles')}>Roles</Button>
              <Button color="inherit" onClick={() => scrollToSection('testimonials')}>Testimonials</Button>
              <Button color="inherit" onClick={() => scrollToSection('contact')}>Contact</Button>
            </Stack>
          )}
          <Button variant="outlined" sx={{ mr: 1 }} onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button variant="contained" onClick={() => navigate('/admission')}>
            Apply Now
          </Button>
          {isMobile && (
            <IconButton sx={{ ml: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 15 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="🚀 Trusted by 100+ Institutions"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 3 }}
              />
              <Typography variant="h1" sx={{ mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Modern College Management Platform
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.8 }}>
                Enterprise-grade ERP & CRM solution designed for educational institutions.
                Streamline operations, enhance collaboration, and drive excellence.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    px: 4,
                    py: 1.5,
                  }}
                  onClick={() => navigate('/admission')}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Watch Demo
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Dashboard sx={{ fontSize: 200, opacity: 0.3 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 1 }}>
        <Card elevation={3}>
          <CardContent sx={{ py: 4 }}>
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }} id="features">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            Powerful Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need to manage your educational institution efficiently
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Role-Based Features */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }} id="roles">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              Features by Role
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Tailored experiences for every user
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {/* Super Admin */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56, mr: 2 }}>
                    <Security />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Super Admin
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platform Owner
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Create & manage colleges" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Approve custom domains" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Platform analytics & monitoring" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Subscription management" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Audit logs & security" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* College Admin */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                    <Dashboard />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      College Admin
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Institution Management
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Manage students & teachers" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Approve admissions" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Define fee structure" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Customize branding" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="View comprehensive reports" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Teacher */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, mr: 2 }}>
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Teacher
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Academic Management
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Mark attendance" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Upload homework & assignments" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Conduct online exams" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Upload marks & grades" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="View student reports" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Student */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56, mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Learning Portal
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="View attendance & marks" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Access homework & assignments" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Take online exams" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="View fee details" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Download reports" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Parent */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mr: 2 }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Parent
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Child Monitoring
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Track child's attendance" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="View academic progress" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Pay fees online (Razorpay)" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="View payment history" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Submit feedback" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Accounts Team */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mr: 2 }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Accounts Team
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Financial Management
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="View all payments" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Manual payment entry" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Process refunds" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Generate payment reports" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Export to CSV" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Admission Team */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56, mr: 2 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Admission Team
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Admission Management
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Create admission forms" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Enter student details" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Upload documents" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Submit for approval" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Track application status" />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Transport Team */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mr: 2 }}>
                    <Event />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Transport Team
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transport Management
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Manage bus routes" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Assign buses to students" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Track bus attendance" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Update bus fees" />
                  </ListItem>
                  <ListItem>
                    <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                    <ListItemText primary="Generate transport reports" />
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }} id="testimonials">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              Trusted by Educators
            </Typography>
            <Typography variant="h6" color="text.secondary">
              See what our clients say about us
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "{testimonial.content}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{testimonial.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 3 }}>
            Ready to Transform Your Institution?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join 100+ colleges already using our platform
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                px: 5,
                py: 2,
              }}
              onClick={() => navigate('/admission')}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 5,
                py: 2,
              }}
            >
              Contact Sales
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }} id="contact">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  College ERP
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Enterprise-grade college management platform trusted by institutions worldwide.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Features
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Pricing
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Security
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  About
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Careers
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  Contact
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Stay Updated
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                Subscribe to our newsletter for updates
              </Typography>
              <Button variant="contained" fullWidth sx={{ bgcolor: 'primary.main' }}>
                Subscribe
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 6, pt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2026 College ERP. All rights reserved. | Privacy Policy | Terms of Service
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
