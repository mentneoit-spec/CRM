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
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Styled Components
const StudentDashboardContainer = styled(Box)(({ theme }) => ({
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

const StatBox = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
  },
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

const ProgressSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  marginBottom: theme.spacing(2),
  color: '#1a1a1a',
}));

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Student Dashboard Component
const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [marks, setMarks] = useState([
    { subject: 'Mathematics', obtained: 85, total: 100, percentage: 85 },
    { subject: 'English', obtained: 78, total: 100, percentage: 78 },
    { subject: 'Science', obtained: 92, total: 100, percentage: 92 },
    { subject: 'Social Studies', obtained: 88, total: 100, percentage: 88 },
  ]);

  const [attendance, setAttendance] = useState([
    { month: 'Jan', present: 22, absent: 4 },
    { month: 'Feb', present: 20, absent: 6 },
    { month: 'Mar', present: 23, absent: 3 },
    { month: 'Apr', present: 21, absent: 5 },
  ]);

  const [assignments, setAssignments] = useState([
    { id: 1, subject: 'Mathematics', title: 'Algebra Problems', dueDate: '2026-03-15', status: 'Pending' },
    { id: 2, subject: 'English', title: 'Essay Writing', dueDate: '2026-03-18', status: 'Submitted' },
    { id: 3, subject: 'Science', title: 'Chemistry Experiment', dueDate: '2026-03-20', status: 'Pending' },
  ]);

  const [fees, setFees] = useState({
    totalDue: 5000,
    paid: 45000,
    pending: 5000,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Late':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOverallPercentage = () => {
    const total = marks.reduce((sum, mark) => sum + mark.percentage, 0);
    return (total / marks.length).toFixed(1);
  };

  return (
    <StudentDashboardContainer>
      {/* Header Section */}
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
              {user?.name?.[0] || 'S'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome, {user?.name || 'Student'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Class: 10-A | Roll Number: STU001234
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">Overall Grade</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {getOverallPercentage()}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </HeaderCard>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Attendance
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                    92%
                  </Typography>
                </Box>
                <IconCircle bgColor="#667eea">
                  <SchoolIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatBox>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatBox>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg. Score
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#764ba2' }}>
                    {getOverallPercentage()}%
                  </Typography>
                </Box>
                <IconCircle bgColor="#764ba2">
                  <AssessmentIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatBox>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatBox>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Assignments
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {assignments.filter(a => a.status === 'Pending').length}
                  </Typography>
                </Box>
                <IconCircle bgColor="#ff9800">
                  <AssignmentIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatBox>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatBox>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Fee
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                    ₹{fees.pending}
                  </Typography>
                </Box>
                <IconCircle bgColor="#f44336">
                  <PaymentIcon />
                </IconCircle>
              </Box>
            </CardContent>
          </StatBox>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
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
          <Tab label="Academic Performance" />
          <Tab label="Assignments" />
          <Tab label="Attendance" />
          <Tab label="Fee Status" />
        </Tabs>

        {/* Academic Performance Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Marks Table */}
            <Grid item xs={12} md={8}>
              <SectionTitle>Subject-wise Marks</SectionTitle>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: '#f5f7fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Obtained</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Percentage</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {marks.map((mark, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{mark.subject}</TableCell>
                        <TableCell align="right">{mark.obtained}</TableCell>
                        <TableCell align="right">{mark.total}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${mark.percentage}%`}
                            color={mark.percentage >= 80 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {mark.percentage >= 80 ? 'A' : mark.percentage >= 60 ? 'B' : 'C'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Performance Chart */}
            <Grid item xs={12} md={4}>
              <SectionTitle>Progress</SectionTitle>
              <Box sx={{ mb: 2 }}>
                {marks.map((mark, index) => (
                  <ProgressSection key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{mark.subject}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mark.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={mark.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        },
                      }}
                    />
                  </ProgressSection>
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Assignments Tab */}
        <TabPanel value={tabValue} index={1}>
          <SectionTitle>Your Assignments</SectionTitle>
          <List>
            {assignments.map((assignment, index) => (
              <Box key={assignment.id}>
                <ListItem sx={{ py: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {assignment.subject}
                        </Typography>
                      </Box>
                      <Chip
                        label={assignment.status}
                        color={getStatusColor(assignment.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Due: {assignment.dueDate}
                      </Typography>
                      {assignment.status === 'Submitted' && (
                        <Button startIcon={<DownloadIcon />} size="small">
                          View
                        </Button>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                {index < assignments.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value={tabValue} index={2}>
          <SectionTitle>Monthly Attendance</SectionTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#4caf50" />
              <Bar dataKey="absent" fill="#f44336" />
            </BarChart>
          </ResponsiveContainer>
        </TabPanel>

        {/* Fee Status Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SectionTitle>Fee Details</SectionTitle>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="textSecondary">Total Fee</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        ₹{fees.paid + fees.pending}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="textSecondary">Paid</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        ₹{fees.paid}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="textSecondary">Pending</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                        ₹{fees.pending}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <LinearProgress
                    variant="determinate"
                    value={(fees.paid / (fees.paid + fees.pending)) * 100}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mb: 2,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      },
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {((fees.paid / (fees.paid + fees.pending)) * 100).toFixed(1)}% Paid
                  </Typography>
                </CardContent>
              </Card>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Pay Fee Now
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionTitle>Recent Transactions</SectionTitle>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Monthly Fee - March 2026"
                    secondary="Paid on 2026-03-01"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    +₹10,000
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Monthly Fee - February 2026"
                    secondary="Paid on 2026-02-01"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    +₹10,000
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Monthly Fee - January 2026"
                    secondary="Paid on 2026-01-01"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    +₹10,000
                  </Typography>
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </StudentDashboardContainer>
  );
};

export default StudentDashboard;
