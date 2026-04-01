import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  IconButton,
  Chip,
  Grid,
  MenuItem,
  Alert,
  InputAdornment,
  Snackbar,
  SnackbarContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { departments, designations } from '../../../data/hr-data/employees';

const EmployeeManagement = ({ employees: initialEmployees, setEmployees, isHRRole = false }) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setLocalEmployees] = useState(initialEmployees);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success', // 'success' or 'error'
  });
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    designation: '',
    email: '',
    phone: '',
    salary: '',
    joinDate: '',
    status: 'Active',
    bankAccount: '',
    bankName: '',
    qualification: '',
    address: '',
  });

  // Fetch real teacher data on mount
  const fetchTeachersData = async () => {
    try {
      console.log('🔄 EmployeeManagement: Fetching teachers from API...');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      const apiUrl = 'http://localhost:5000/api/hr/teachers';
      console.log('📍 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      console.log('📡 API Response Status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Result:', result);
        
        if (result.success && result.data) {
          console.log('✅ Loaded', result.data.length, 'real teachers');
          setLocalEmployees(result.data);
          setEmployees(result.data);  // Update parent component too
        } else {
          console.warn('⚠️ API no data, using initial employees');
          setLocalEmployees(initialEmployees);
        }
      } else {
        const errorText = await response.text();
        console.warn('❌ API Error (Status:', response.status, '):', errorText);
        setLocalEmployees(initialEmployees);
      }
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      setLocalEmployees(initialEmployees);
    }
  };

  useEffect(() => {
    fetchTeachersData();
    // Only run once on mount, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (employee = null) => {
    // HR Role can only edit existing employees, not add new ones
    if (isHRRole && !employee) {
      return;
    }
    
    if (employee) {
      setFormData(employee);
      setEditingId(employee.id);
    } else {
      setFormData({
        name: '',
        department: '',
        designation: '',
        email: '',
        phone: '',
        salary: '',
        joinDate: '',
        status: 'Active',
        bankAccount: '',
        bankName: '',
        qualification: '',
        address: '',
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update existing employee
        if (isHRRole) {
          // HR role is updating salary - call backend API
          setSaving(true);
          console.log('💾 Saving salary for teacher:', editingId);
          console.log('📊 New salary:', formData.salary);
          
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          const apiUrl = `http://localhost:5000/api/hr/teachers/${editingId}/salary`;
          console.log('📍 API URL:', apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ salary: parseFloat(formData.salary) || 0 }),
            credentials: 'include',
          });
          
          console.log('📡 Response Status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ API Response:', result);
            
            if (result.success && result.data) {
              // Update local employees list with the response data
              const updatedEmployees = employees.map((emp) =>
                emp.id === editingId ? result.data : emp
              );
              setLocalEmployees(updatedEmployees);
              setEmployees(updatedEmployees);
              
              setNotification({
                open: true,
                message: `✅ Salary updated successfully for ${result.data.name}!`,
                type: 'success',
              });
              console.log('✅ Salary updated successfully');
              console.log('💰 Updated salary:', result.data.salary);
              handleClose();
            } else {
              throw new Error(result.message || 'Failed to update salary');
            }
          } else {
            const errorText = await response.text();
            console.error('❌ API Error (Status:', response.status, '):', errorText);
            throw new Error(`Error: ${response.status} - ${errorText}`);
          }
        } else {
          // Non-HR role just updates local state (for admin)
          setEmployees(
            employees.map((emp) =>
              emp.id === editingId ? { ...formData, id: editingId } : emp
            )
          );
          handleClose();
        }
      } else {
        // Add new employee (only for non-HR)
        const newEmployee = {
          ...formData,
          id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        };
        setEmployees([...employees, newEmployee]);
        handleClose();
      }
    } catch (error) {
      console.error('❌ Error saving employee:', error);
      setNotification({
        open: true,
        message: `❌ Error: ${error.message}`,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error';
  };

  return (
    <Box>
      {isHRRole && (
        <Alert severity="info" sx={{ mb: 2 }}>
          📌 HR Mode: You can update salaries and manage attendance. To add new employees, contact your Administrator.
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          placeholder="Search by name, email, or designation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {!isHRRole && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {filteredEmployees.length === 0 && (
        <Alert severity="info">No employees found</Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Salary
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{employee.id}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell sx={{ fontSize: '0.9rem' }}>{employee.email}</TableCell>
                <TableCell align="right">
                  ₹{(parseFloat(employee.salary) || 0).toLocaleString('en-IN', { 
                    maximumFractionDigits: 0 
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={employee.status}
                    color={getStatusColor(employee.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(employee)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {!isHRRole && (
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(employee.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? `Edit Employee${isHRRole ? ' - Update Salary' : ''}` : 'Add New Employee'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            {!isHRRole && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    select
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    select
                  >
                    {designations.map((des) => (
                      <MenuItem key={des} value={des}>
                        {des}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}
            {isHRRole && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={formData.name}
                  disabled
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                select
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            {!isHRRole && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Join Date"
                    name="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Account"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
              />
            </Grid>
            {!isHRRole && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          {editingId && (
            <Button onClick={handleSave} variant="contained" color="success" disabled={saving}>
              {saving ? '💾 Saving...' : 'Update Salary'}
            </Button>
          )}
          {!editingId && !isHRRole && (
            <Button onClick={handleSave} variant="contained" disabled={saving}>
              {saving ? '💾 Adding...' : 'Add Employee'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success/Error Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <SnackbarContent
          message={notification.message}
          sx={{
            backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: '#fff',
            fontWeight: 600,
            borderRadius: '4px',
          }}
        />
      </Snackbar>
    </Box>
  );
};

export default EmployeeManagement;
