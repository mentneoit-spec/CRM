import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  MenuItem,
  Avatar,
  Container,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon,
  People as PeopleIcon,
  SchoolOutlined as TeacherIcon,
  AttachMoney as SalaryIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import hrAPI from '../../config/hrAPI';

const AdminHRManagement = () => {
  const navigate = useNavigate();
  const [hrManagers, setHRManagers] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [stats, setStats] = useState({ hrManagers: 0, totalEmployees: 0, activeEmployees: 0, totalSalaryBill: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingAddHR, setLoadingAddHR] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openHRDialog, setOpenHRDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [newHRForm, setNewHRForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'HR Manager',
    department: 'Human Resources',
  });

  // Fetch HR Dashboard Data
  useEffect(() => {
    fetchHRDashboard();
    fetchAvailableTeachers();
  }, []);

  const fetchAvailableTeachers = async () => {
    try {
      const response = await hrAPI.getAvailableTeachers();
      console.log('Available teachers response:', response);
      if (response.success) {
        setAvailableTeachers(response.data || []);
      } else {
        console.error('Failed to load teachers:', response.message);
      }
    } catch (err) {
      console.error('Teachers fetch error:', err);
    }
  };

  const fetchHRDashboard = async () => {
    try {
      setLoading(true);
      const response = await hrAPI.getAdminHRDashboard();
      console.log('Dashboard response:', response);
      if (response.success) {
        const { stats: dashStats, hrManagers: managers } = response.data;
        setStats(dashStats);
        setHRManagers(managers || []);
        setError(null);
      } else {
        setError(response.message || 'Failed to load HR data');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load HR data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHRManager = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!newHRForm.name || !newHRForm.email) {
      setError('Please fill all required fields');
      return;
    }

    if (!emailRegex.test(newHRForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoadingAddHR(true);
    setError(null);

    try {
      console.log('Submitting HR Manager form:', newHRForm);
      const response = await hrAPI.addHRManager(newHRForm);
      console.log('HR Manager response:', response);
      
      if (response.success) {
        const tempPassword = response.data?.tempPassword || 'Check email for credentials';
        alert(`✅ HR Manager Added Successfully!\n\nName: ${newHRForm.name}\nEmail: ${newHRForm.email}\nTemporary Password: ${tempPassword}\n\nShare these credentials with the HR Manager.`);
        setOpenHRDialog(false);
        setNewHRForm({ name: '', email: '', phone: '', designation: 'HR Manager', department: 'Human Resources' });
        setError(null);
        fetchHRDashboard();
      } else {
        setError(response.message || 'Failed to add HR Manager');
      }
    } catch (err) {
      console.error('Error adding HR Manager:', err);
      const errorMsg = err.message || 'Failed to add HR Manager';
      setError(errorMsg);
    } finally {
      setLoadingAddHR(false);
    }
  };

  const handleDeleteHRManager = async (hrManagerId) => {
    if (!window.confirm('Are you sure you want to delete this HR Manager?')) return;
    try {
      const response = await hrAPI.deleteHRManager(hrManagerId);
      if (response.success) {
        alert('HR Manager deleted successfully');
        fetchHRDashboard();
      } else {
        setError(response.message || 'Failed to delete HR Manager');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete HR Manager');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const handleRegeneratePasswords = async () => {
    if (!window.confirm('This will generate and store passwords for all HR Managers without passwords. Continue?')) return;
    try {
      const response = await hrAPI.regenerateHRManagerPasswords();
      if (response.success) {
        alert(`✅ Passwords generated for ${response.data.updated} HR Managers!\n\nPlease refresh to see the updated passwords.`);
        fetchHRDashboard(); // Refresh the list
      } else {
        alert('No HR Managers needed password generation.');
      }
    } catch (err) {
      alert('Error generating passwords: ' + (err.message || 'Unknown error'));
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
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
              👔 HR Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 300 }}>
              Create and manage HR Managers, view available teachers, and oversee salary information
            </Typography>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

          {/* Stats Cards - Clickable & Animated */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
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
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>HR Managers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.hrManagers || 0}</Typography>
                      <Chip label="Active" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <PeopleIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)',
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
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Available Teachers</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>{availableTeachers.length || 0}</Typography>
                      <Chip label="Ready" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <TeacherIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(250, 112, 154, 0.5)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Salary Bill</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>₹{(stats.totalSalaryBill || 0).toLocaleString()}</Typography>
                      <Chip label="Monthly" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 60, height: 60 }}>
                      <SalaryIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs Navigation */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
            <Button
              onClick={() => setActiveTab('dashboard')}
              sx={{
                pb: 2,
                px: 2,
                borderBottom: activeTab === 'dashboard' ? '3px solid #667eea' : 'none',
                color: activeTab === 'dashboard' ? '#667eea' : '#999',
                fontWeight: activeTab === 'dashboard' ? 700 : 500,
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': { color: '#667eea' }
              }}
            >
              📊 Dashboard
            </Button>
            <Button
              onClick={() => setActiveTab('managers')}
              sx={{
                pb: 2,
                px: 2,
                borderBottom: activeTab === 'managers' ? '3px solid #667eea' : 'none',
                color: activeTab === 'managers' ? '#667eea' : '#999',
                fontWeight: activeTab === 'managers' ? 700 : 500,
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': { color: '#667eea' }
              }}
            >
              👔 HR Managers
            </Button>
            <Button
              onClick={() => setActiveTab('employees')}
              sx={{
                pb: 2,
                px: 2,
                borderBottom: activeTab === 'employees' ? '3px solid #667eea' : 'none',
                color: activeTab === 'employees' ? '#667eea' : '#999',
                fontWeight: activeTab === 'employees' ? 700 : 500,
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': { color: '#667eea' }
              }}
            >
              🧑‍🏫 Available Teachers
            </Button>
          </Box>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Dashboard Overview</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Total HR Managers</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#667eea' }}>{stats.hrManagers || 0}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Available Teachers for Assignment</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f5576c' }}>{availableTeachers.length || 0}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Total Managed Employees</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#4facfe' }}>{stats.totalEmployees || 0}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Monthly Salary Bill</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fa709a' }}>₹{(stats.totalSalaryBill || 0).toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* HR Managers Tab */}
          {activeTab === 'managers' && (
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6">HR Managers</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={handleRegeneratePasswords}
                  title="Generate passwords for all HR managers without passwords"
                  size="small"
                >
                  🔐 Generate Passwords
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenHRDialog(true)}
                >
                  Add HR Manager
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Employees</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hrManagers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell>{manager.name}</TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>{manager.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip label={manager.Employees?.length || 0} size="small" />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setSelectedManager(manager);
                            setShowCredentials(true);
                          }}
                        >
                          View
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteHRManager(manager.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {hrManagers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No HR Managers yet. Click "Add HR Manager" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Available Teachers Tab */}
      {activeTab === 'employees' && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Available Teachers</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Qualification</TableCell>
                    <TableCell>Experience</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone || '-'}</TableCell>
                      <TableCell>{teacher.specialization || '-'}</TableCell>
                      <TableCell>{teacher.qualification || '-'}</TableCell>
                      <TableCell>{teacher.experience ? `${teacher.experience} yrs` : '-'}</TableCell>
                    </TableRow>
                  ))}
                  {availableTeachers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        No teachers available. HR Managers can assign teachers through their dashboard.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Add HR Manager Dialog */}
      <Dialog open={openHRDialog} onClose={() => !loadingAddHR && setOpenHRDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New HR Manager</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: '#ffebee', 
              borderRadius: 1, 
              border: '1px solid #ef5350',
              color: '#c62828'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                ⚠️ {error}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Full Name"
            value={newHRForm.name}
            onChange={(e) => setNewHRForm({ ...newHRForm, name: e.target.value })}
            margin="normal"
            disabled={loadingAddHR}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newHRForm.email}
            onChange={(e) => setNewHRForm({ ...newHRForm, email: e.target.value })}
            margin="normal"
            disabled={loadingAddHR}
          />
          <TextField
            fullWidth
            label="Phone"
            value={newHRForm.phone}
            onChange={(e) => setNewHRForm({ ...newHRForm, phone: e.target.value })}
            margin="normal"
            disabled={loadingAddHR}
          />
          <TextField
            fullWidth
            label="Designation"
            value={newHRForm.designation}
            onChange={(e) => setNewHRForm({ ...newHRForm, designation: e.target.value })}
            margin="normal"
            disabled={loadingAddHR}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHRDialog(false)} disabled={loadingAddHR}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddHRManager} 
            variant="contained"
            disabled={loadingAddHR}
            sx={{ minWidth: 140 }}
          >
            {loadingAddHR ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Adding...
              </>
            ) : (
              'Add HR Manager'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* HR Manager Credentials Dialog */}
      <Dialog open={showCredentials} onClose={() => setShowCredentials(false)} maxWidth="sm" fullWidth>
        <DialogTitle>HR Manager Credentials</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedManager && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">EMAIL</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <TextField
                    fullWidth
                    value={selectedManager.email}
                    InputProps={{ readOnly: true }}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => copyToClipboard(selectedManager.email)}
                    sx={{ minWidth: 60 }}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                  🔐 TEMPORARY PASSWORD
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <TextField
                    fullWidth
                    value={selectedManager.user?.tempPassword || 'Password not available'}
                    InputProps={{ readOnly: true }}
                    size="small"
                    sx={{ mr: 1, bgcolor: 'white' }}
                    type="text"
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => copyToClipboard(selectedManager.user?.tempPassword || '')}
                    disabled={!selectedManager.user?.tempPassword}
                    sx={{ minWidth: 60, bgcolor: '#ffc107', color: 'black', '&:hover': { bgcolor: '#ffb300' } }}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">MANAGER NAME</Typography>
                <TextField
                  fullWidth
                  value={selectedManager.name}
                  InputProps={{ readOnly: true }}
                  size="small"
                  margin="normal"
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">DESIGNATION</Typography>
                <TextField
                  fullWidth
                  value={selectedManager.designation || 'HR Manager'}
                  InputProps={{ readOnly: true }}
                  size="small"
                  margin="normal"
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">PHONE</Typography>
                <TextField
                  fullWidth
                  value={selectedManager.phone || '-'}
                  InputProps={{ readOnly: true }}
                  size="small"
                  margin="normal"
                />
              </Box>

              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Login Instructions:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  1. Use the email and temporary password above to log in
                </Typography>
                <Typography variant="body2">
                  2. Change your password immediately after first login
                </Typography>
                <Typography variant="body2">
                  3. You can now manage employees, track attendance, and handle payroll
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCredentials(false)}>Close</Button>
        </DialogActions>
      </Dialog>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default AdminHRManagement;
