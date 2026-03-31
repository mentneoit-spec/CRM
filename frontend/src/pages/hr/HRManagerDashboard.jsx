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
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import hrAPI from '../../config/hrAPI';
import AIHRAssistant from './AIHRAssistant';

const HRManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [stats, setStats] = useState({ totalEmployees: 0, activeEmployees: 0, totalSalary: 0, attendanceToday: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    designation: '',
    salary: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    bankAccount: '',
    bankName: '',
  });
  const [newSalary, setNewSalary] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear(),
    baseSalary: '',
    allowances: '',
    deductions: '',
    workingDays: 30,
    attendedDays: 30,
  });

  useEffect(() => {
    fetchHRData();
  }, []);

  const fetchHRData = async () => {
    try {
      setLoading(true);
      const [dashResponse, empResponse] = await Promise.all([
        hrAPI.getHRDashboard(),
        hrAPI.getEmployees({}),
      ]);

      if (dashResponse.data?.success) {
        setStats(dashResponse.data.data.stats);
      }

      if (empResponse.data?.success) {
        setEmployees(empResponse.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load HR data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.employeeId) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await hrAPI.addEmployee(newEmployee);
      if (response.data?.success) {
        setEmployees([response.data.data, ...employees]);
        setOpenEmployeeDialog(false);
        setNewEmployee({
          name: '',
          email: '',
          phone: '',
          employeeId: '',
          department: '',
          designation: '',
          salary: '',
          dateOfJoining: new Date().toISOString().split('T')[0],
          bankAccount: '',
          bankName: '',
        });
        alert('Employee added successfully!');
        fetchHRData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const response = await hrAPI.deleteEmployee(employeeId);
      if (response.data?.success) {
        setEmployees(employees.filter((e) => e.id !== employeeId));
        alert('Employee deleted successfully');
        fetchHRData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleCreateSalaryRecord = async () => {
    if (!newSalary.employeeId || !newSalary.baseSalary) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await hrAPI.createSalaryRecord(newSalary);
      if (response.data?.success) {
        setSalaryRecords([response.data.data, ...salaryRecords]);
        setOpenSalaryDialog(false);
        setNewSalary({
          employeeId: '',
          month: new Date().toISOString().slice(0, 7),
          year: new Date().getFullYear(),
          baseSalary: '',
          allowances: '',
          deductions: '',
          workingDays: 30,
          attendedDays: 30,
        });
        alert('Salary record created successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create salary record');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Dashboard Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Total Employees</Typography>
              <Typography variant="h4" sx={{ color: '#1976d2' }}>{stats.totalEmployees || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Active</Typography>
              <Typography variant="h4" sx={{ color: '#4caf50' }}>{stats.activeEmployees || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Total Salary</Typography>
              <Typography variant="h6" sx={{ color: '#f57c00' }}>₹{(stats.totalSalary / 100000).toFixed(1)}L</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Today Attendance</Typography>
              <Typography variant="h4" sx={{ color: '#7b1fa2' }}>{stats.attendanceToday || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Employees" />
          <Tab label="Salaries" />
          <Tab label="Attendance" />
          <Tab label="AI Assistant" icon={<AIIcon />} />
        </Tabs>
      </Box>

      {/* Employees Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Employee Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenEmployeeDialog(true)}
              >
                Add Employee
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id} hover>
                      <TableCell>{emp.employeeId}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>₹{emp.salary?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status}
                          size="small"
                          color={emp.status === 'Active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEmployee(emp.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No employees yet. Click "Add Employee" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Salaries Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Payroll Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenSalaryDialog(true)}
              >
                Create Salary Record
              </Button>
            </Box>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Salary records will appear here. Click "Create Salary Record" to add new payroll entries.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Attendance Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Attendance Management</Typography>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Attendance tracking will be available here. HR can mark and view employee attendance records.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* AI Assistant Tab */}
      {activeTab === 3 && (
        <AIHRAssistant />
      )}

      {/* Add Employee Dialog */}
      <Dialog open={openEmployeeDialog} onClose={() => setOpenEmployeeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent sx={{ pt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
          <TextField
            fullWidth
            label="Full Name *"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email *"
            type="email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={newEmployee.phone}
            onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Employee ID *"
            value={newEmployee.employeeId}
            onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Department *"
            value={newEmployee.department}
            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Designation *"
            value={newEmployee.designation}
            onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Salary"
            type="number"
            value={newEmployee.salary}
            onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date of Joining"
            type="date"
            value={newEmployee.dateOfJoining}
            onChange={(e) => setNewEmployee({ ...newEmployee, dateOfJoining: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Bank Account"
            value={newEmployee.bankAccount}
            onChange={(e) => setNewEmployee({ ...newEmployee, bankAccount: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bank Name"
            value={newEmployee.bankName}
            onChange={(e) => setNewEmployee({ ...newEmployee, bankName: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmployeeDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEmployee} variant="contained">
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Salary Record Dialog */}
      <Dialog open={openSalaryDialog} onClose={() => setOpenSalaryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Salary Record</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            select
            label="Employee *"
            value={newSalary.employeeId}
            onChange={(e) => setNewSalary({ ...newSalary, employeeId: e.target.value })}
            margin="normal"
          >
            <MenuItem value="">-- Select Employee --</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField
              label="Month"
              type="month"
              value={newSalary.month}
              onChange={(e) => setNewSalary({ ...newSalary, month: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Year"
              type="number"
              value={newSalary.year}
              onChange={(e) => setNewSalary({ ...newSalary, year: parseInt(e.target.value) })}
              margin="normal"
            />
          </Box>
          <TextField
            fullWidth
            label="Base Salary *"
            type="number"
            value={newSalary.baseSalary}
            onChange={(e) => setNewSalary({ ...newSalary, baseSalary: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Allowances"
            type="number"
            value={newSalary.allowances}
            onChange={(e) => setNewSalary({ ...newSalary, allowances: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Deductions"
            type="number"
            value={newSalary.deductions}
            onChange={(e) => setNewSalary({ ...newSalary, deductions: e.target.value })}
            margin="normal"
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField
              label="Working Days"
              type="number"
              value={newSalary.workingDays}
              onChange={(e) => setNewSalary({ ...newSalary, workingDays: parseInt(e.target.value) })}
              margin="normal"
            />
            <TextField
              label="Attended Days"
              type="number"
              value={newSalary.attendedDays}
              onChange={(e) => setNewSalary({ ...newSalary, attendedDays: parseInt(e.target.value) })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSalaryDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSalaryRecord} variant="contained">
            Create Record
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HRManagerDashboard;
