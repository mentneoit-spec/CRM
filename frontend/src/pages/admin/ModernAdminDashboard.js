import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  AttachMoney as AttachMoneyIcon,
  LocalActivity as LocalActivityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  background: '#f5f7fa',
}));

const Sidebar = styled(Box)(({ theme }) => ({
  width: '280px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(3),
  position: 'fixed',
  height: '100vh',
  overflowY: 'auto',
  [theme.breakpoints.down('sm')]: {
    width: '70px',
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  marginLeft: '280px',
  flex: 1,
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginLeft: '70px',
    padding: theme.spacing(2),
  },
}));

const TopBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(3),
  background: 'white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
  },
  height: '100%',
}));

const StatCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}));

const IconBox = styled(Box)(({ theme, color }) => ({
  background: color || '#667eea',
  borderRadius: '12px',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  minWidth: '60px',
  minHeight: '60px',
}));

const SidebarLink = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(1),
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.2)',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: '#764ba2',
  fontSize: '24px',
}));

// Admin Dashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalTeachers: 85,
    totalRevenue: 2540000,
    pendingAdmissions: 23,
  });
  const [students, setStudents] = useState([
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', class: '10-A', status: 'Active' },
    { id: 2, name: 'Priya Singh', email: 'priya@example.com', class: '10-B', status: 'Active' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', class: '10-C', status: 'Inactive' },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddStudent = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <DashboardContainer>
      {/* Sidebar */}
      <Sidebar>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Mentneo
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            College Management
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <UserAvatar>{user?.name?.[0] || 'A'}</UserAvatar>
          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
            {user?.name || 'Admin'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {user?.role || 'College Admin'}
          </Typography>
        </Box>

        {/* Navigation Links */}
        <SidebarLink onClick={() => navigateTo('/admin/dashboard')}>
          <DashboardIcon fontSize="small" />
          <Typography variant="body2">Dashboard</Typography>
        </SidebarLink>

        <SidebarLink onClick={() => navigateTo('/admin/students')}>
          <SchoolIcon fontSize="small" />
          <Typography variant="body2">Students</Typography>
        </SidebarLink>

        <SidebarLink onClick={() => navigateTo('/admin/teachers')}>
          <PeopleIcon fontSize="small" />
          <Typography variant="body2">Teachers</Typography>
        </SidebarLink>

        <SidebarLink onClick={() => navigateTo('/admin/finance')}>
          <PaymentIcon fontSize="small" />
          <Typography variant="body2">Finance</Typography>
        </SidebarLink>

        <SidebarLink onClick={() => navigateTo('/admin/settings')}>
          <SettingsIcon fontSize="small" />
          <Typography variant="body2">Settings</Typography>
        </SidebarLink>

        <Box sx={{ mt: 'auto', pt: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </Box>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        {/* Top Bar */}
        <TopBar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Welcome back, {user?.name || 'Admin'}!
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
              Here's your college overview
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
            }}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
        </TopBar>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <StatCardContent>
                <Box flex={1}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4caf50' }}>
                    ↑ 12% from last month
                  </Typography>
                </Box>
                <IconBox color="#667eea">
                  <SchoolIcon fontSize="large" />
                </IconBox>
              </StatCardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <StatCardContent>
                <Box flex={1}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#764ba2' }}>
                    {stats.totalTeachers}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4caf50' }}>
                    ↑ 5% from last month
                  </Typography>
                </Box>
                <IconBox color="#764ba2">
                  <PeopleIcon fontSize="large" />
                </IconBox>
              </StatCardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <StatCardContent>
                <Box flex={1}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    ₹{(stats.totalRevenue / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4caf50' }}>
                    ↑ 8% from last month
                  </Typography>
                </Box>
                <IconBox color="#ff9800">
                  <AttachMoneyIcon fontSize="large" />
                </IconBox>
              </StatCardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <StatCardContent>
                <Box flex={1}>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Admissions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {stats.pendingAdmissions}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#f44336' }}>
                    Needs approval
                  </Typography>
                </Box>
                <IconBox color="#f44336">
                  <LocalActivityIcon fontSize="large" />
                </IconBox>
              </StatCardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Students Table */}
        <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Box sx={{ padding: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Students
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.status}
                        color={student.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, student)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedStudent?.id === student.id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} />
                          Edit
                        </MenuItem>
                        <MenuItem>
                          <Delete Icon fontSize="small" sx={{ mr: 1 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </MainContent>

      {/* Add Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Student ID"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Class"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Add Student
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default AdminDashboard;
