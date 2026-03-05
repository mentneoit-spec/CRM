import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Styled Components
const ParentDashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#f5f7fa',
  padding: theme.spacing(3),
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
  },
}));

const StudentCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
  },
  cursor: 'pointer',
}));

const IconCircle = styled(Box)(({ theme, bgColor }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '12px',
  background: bgColor || '#667eea',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '32px',
}));

// Tab Panel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Parent Dashboard Component
const ParentDashboard = () => {
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      class: '10-A',
      rollNo: '001',
      attendance: 92,
      avgMarks: 85,
      totalFee: 50000,
      paidFee: 45000,
      pendingFee: 5000,
      nextExamDate: '2026-04-15',
    },
    {
      id: 2,
      name: 'Priya Kumar',
      class: '8-B',
      rollNo: '012',
      attendance: 88,
      avgMarks: 78,
      totalFee: 45000,
      paidFee: 45000,
      pendingFee: 0,
      nextExamDate: '2026-04-20',
    },
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Annual Sports Day',
      date: '2026-03-25',
      description: 'Annual sports day will be held on March 25, 2026',
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting',
      date: '2026-03-22',
      description: 'PTM scheduled for March 22, 2026 at 4:00 PM',
    },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handlePaymentClick = (student) => {
    setSelectedStudent(student);
    setPaymentDialog(true);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Call backend to create Razorpay order
      const response = await axios.post('/api/parent/create-payment', {
        studentId: selectedStudent.id,
        amount: selectedStudent.pendingFee,
      });

      if (response.data.success) {
        // Open Razorpay modal
        window.open(response.data.paymentUrl, '_blank');
        setPaymentDialog(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParentDashboardContainer>
      {/* Header */}
      <HeaderCard>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.2)',
                fontSize: '36px',
              }}
            >
              {user?.name?.[0] || 'P'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome, {user?.name || 'Parent'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Monitor your children's academic progress and manage fees
            </Typography>
          </Grid>
        </Grid>
      </HeaderCard>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Children
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {students.length}
                  </Typography>
                </Box>
                <IconCircle bgColor="#667eea">
                  <SchoolIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Pending
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                    ₹{students.reduce((sum, s) => sum + s.pendingFee, 0)}
                  </Typography>
                </Box>
                <IconCircle bgColor="#f44336">
                  <PaymentIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg. Attendance
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)}%
                  </Typography>
                </Box>
                <IconCircle bgColor="#4caf50">
                  <TrendingUpIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Messages
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    12
                  </Typography>
                </Box>
                <IconCircle bgColor="#2196f3">
                  <MessageIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid #e0e0e0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
            },
            '& .Mui-selected': {
              color: '#667eea',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#667eea',
            },
          }}
        >
          <Tab label="Children" />
          <Tab label="Fees" />
          <Tab label="Announcements" />
        </Tabs>

        {/* Children Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Your Children
            </Typography>
            {students.map((student) => (
              <StudentCard key={student.id} onClick={() => handleStudentSelect(student)}>
                <CardContent>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          {student.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {student.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Class: {student.class} | Roll: {student.rollNo}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Attendance
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {student.attendance}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.attendance}
                              sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Avg Marks
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {student.avgMarks}%
                            </Typography>
                            <Chip label="Good" size="small" color="success" sx={{ mt: 1 }} />
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </StudentCard>
            ))}
          </Box>
        </TabPanel>

        {/* Fees Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Fee Management
            </Typography>
            {students.map((student) => (
              <Card key={student.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Class {student.class}
                      </Typography>
                    </Box>
                    {student.pendingFee > 0 && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                        onClick={() => handlePaymentClick(student)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="textSecondary">
                        Total Fee
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{student.totalFee}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="textSecondary">
                        Paid
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        ₹{student.paidFee}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="textSecondary">
                        Pending
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                        ₹{student.pendingFee}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={student.pendingFee === 0 ? 'Paid' : 'Pending'}
                        color={student.pendingFee === 0 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <LinearProgress
                    variant="determinate"
                    value={(student.paidFee / student.totalFee) * 100}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Announcements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              School Announcements
            </Typography>
            <List>
              {announcements.map((announcement, index) => (
                <Box key={announcement.id}>
                  <ListItem sx={{ py: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {announcement.title}
                        </Typography>
                        <Chip
                          icon={<EventIcon />}
                          label={announcement.date}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {announcement.description}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < announcements.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Box>
        </TabPanel>
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedStudent && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Payment for {selectedStudent.name}
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Amount to Pay
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                  ₹{selectedStudent.pendingFee}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                You'll be redirected to Razorpay for secure payment
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={loading}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Pay via Razorpay'}
          </Button>
        </DialogActions>
      </Dialog>
    </ParentDashboardContainer>
  );
};

export default ParentDashboard;
