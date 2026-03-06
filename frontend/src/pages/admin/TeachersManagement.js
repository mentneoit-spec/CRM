import React, { useState, useEffect } from 'react';
import {
  Container, Box, CircularProgress, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Card, CardContent, Stack, Chip, Typography, Alert,
  Paper
} from '@mui/material';
import { Search as SearchIcon, Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import DataTable from '../../components/DataTable';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', employeeId: '', qualification: '',
    specialization: '', experience: 0, gender: '', dateOfBirth: '',
    department: '', designation: '', password: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const mockTeachers = [
    {
      id: 1, name: 'Dr. Rajesh Sharma', employeeId: 'EMP001', email: 'rajesh@college.com',
      phone: '9876543210', qualification: 'M.Sc, B.Ed', specialization: 'Physics',
      experience: 15, department: 'Science', designation: 'Senior Teacher', gender: 'Male', status: 'Active'
    },
    {
      id: 2, name: 'Ms. Priya Singh', employeeId: 'EMP002', email: 'priya@college.com',
      phone: '9876543211', qualification: 'M.A, B.Ed', specialization: 'English',
      experience: 8, department: 'Languages', designation: 'Teacher', gender: 'Female', status: 'Active'
    },
    {
      id: 3, name: 'Mr. Arun Kumar', employeeId: 'EMP003', email: 'arun@college.com',
      phone: '9876543212', qualification: 'B.Tech, B.Ed', specialization: 'Computer Science',
      experience: 10, department: 'IT', designation: 'Teacher', gender: 'Male', status: 'Active'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setTeachers(mockTeachers);
      setLoading(false);
    }, 800);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Teacher name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.employeeId) errors.employeeId = 'Employee ID is required';
    if (!formData.department) errors.department = 'Department is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '', email: '', phone: '', employeeId: '', qualification: '',
      specialization: '', experience: 0, gender: '', dateOfBirth: '',
      department: '', designation: '', password: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setFormData({
      name: teacher.name, email: teacher.email, phone: teacher.phone,
      employeeId: teacher.employeeId, qualification: teacher.qualification,
      specialization: teacher.specialization, experience: teacher.experience,
      gender: teacher.gender, dateOfBirth: '', department: teacher.department,
      designation: teacher.designation, password: ''
    });
    setOpenDialog(true);
  };

  const handleDelete = (teacher) => {
    if (window.confirm(`Delete ${teacher.name}?`)) {
      setTeachers(teachers.filter(t => t.id !== teacher.id));
      setSuccessMessage('Teacher deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (editingId) {
      setTeachers(teachers.map(t => t.id === editingId ? { ...t, ...formData } : t));
      setSuccessMessage('Teacher updated successfully');
    } else {
      const newTeacher = { id: Math.max(...teachers.map(t => t.id), 0) + 1, ...formData, status: 'Active' };
      setTeachers([...teachers, newTeacher]);
      setSuccessMessage('Teacher added successfully');
    }
    setOpenDialog(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.includes(searchQuery);
    const matchesDept = !filterDept || teacher.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const columns = [
    { field: 'employeeId', label: 'Employee ID', minWidth: 100 },
    { field: 'name', label: 'Teacher Name', minWidth: 160 },
    { field: 'email', label: 'Email', minWidth: 180 },
    { field: 'phone', label: 'Phone', minWidth: 120 },
    { field: 'specialization', label: 'Specialization', minWidth: 140 },
    { field: 'experience', label: 'Experience (Yrs)', minWidth: 80 },
    { field: 'department', label: 'Department', minWidth: 120 },
    {
      field: 'status',
      label: 'Status',
      render: (value) => <Chip label={value} color="success" size="small" variant="outlined" />
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Teachers Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage teacher profiles, assignments, and performance data
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Department</InputLabel>
              <Select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} label="Filter by Department">
                <MenuItem value="">All Departments</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Languages">Languages</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Commerce">Commerce</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ backgroundColor: 'white', borderRadius: '8px', p: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTeachers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAddClick}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Teacher Name" name="name" value={formData.name} onChange={handleInputChange} fullWidth error={!!formErrors.name} />
            <TextField label="Email" name="email" value={formData.email} onChange={handleInputChange} fullWidth error={!!formErrors.email} />
            <TextField label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} fullWidth />
            <TextField label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleInputChange} fullWidth error={!!formErrors.employeeId} />
            <TextField label="Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} fullWidth />
            <TextField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} fullWidth />
            <TextField label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={handleInputChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select name="department" value={formData.department} onChange={handleInputChange} label="Department">
                <MenuItem value="">Select Department</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Languages">Languages</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Commerce">Commerce</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">{editingId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeachersManagement;
