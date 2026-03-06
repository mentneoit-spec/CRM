import React, { useState, useEffect } from 'react';
import {
  Container, Box, CircularProgress, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Card, CardContent, Stack, Chip, Typography, Alert,
  Paper, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Print as PrintIcon, Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import DataTable from '../../components/DataTable';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    rollNum: '',
    dateOfBirth: '',
    gender: '',
    sclassId: '',
    sectionId: '',
    parentName: '',
    parentPhone: '',
    admissionYear: new Date().getFullYear(),
    admissionNumber: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Mock data - replace with API call
  const mockStudents = [
    {
      id: 1,
      name: 'Arjun Kumar',
      studentId: 'STU001',
      email: 'arjun@college.com',
      phone: '9876543210',
      rollNum: 1,
      sclass: '10A',
      gender: 'Male',
      parentName: 'Rajesh Kumar',
      parentPhone: '9876543211',
      admissionYear: 2022,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Priya Singh',
      studentId: 'STU002',
      email: 'priya@college.com',
      phone: '9876543212',
      rollNum: 2,
      sclass: '10A',
      gender: 'Female',
      parentName: 'Vikram Singh',
      parentPhone: '9876543213',
      admissionYear: 2022,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Rahul Patel',
      studentId: 'STU003',
      email: 'rahul@college.com',
      phone: '9876543214',
      rollNum: 3,
      sclass: '9B',
      gender: 'Male',
      parentName: 'Dinesh Patel',
      parentPhone: '9876543215',
      admissionYear: 2023,
      status: 'Active'
    },
    {
      id: 4,
      name: 'Neha Gupta',
      studentId: 'STU004',
      email: 'neha@college.com',
      phone: '9876543216',
      rollNum: 1,
      sclass: '9B',
      gender: 'Female',
      parentName: 'Anil Gupta',
      parentPhone: '9876543217',
      admissionYear: 2023,
      status: 'Inactive'
    }
  ];

  useEffect(() => {
    // Replace with actual API call
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 800);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Student name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone) errors.phone = 'Phone is required';
    if (!formData.studentId) errors.studentId = 'Student ID is required';
    if (!formData.sclassId) errors.sclassId = 'Class selection is required';
    if (!editingId && !formData.password) errors.password = 'Password is required for new students';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '', email: '', phone: '', studentId: '', rollNum: '',
      dateOfBirth: '', gender: '', sclassId: '', sectionId: '',
      parentName: '', parentPhone: '', admissionYear: new Date().getFullYear(),
      admissionNumber: '', password: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      studentId: student.studentId,
      rollNum: student.rollNum || '',
      dateOfBirth: '',
      gender: student.gender || '',
      sclassId: student.sclass,
      sectionId: '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      admissionYear: student.admissionYear,
      admissionNumber: '',
      password: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDelete = (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      setStudents(students.filter(s => s.id !== student.id));
      setSuccessMessage(`Student ${student.name} deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        setStudents(students.map(s => s.id === editingId ? { ...s, ...formData } : s));
        setSuccessMessage('Student updated successfully');
      } else {
        const newStudent = { id: Math.max(...students.map(s => s.id)) + 1, ...formData };
        setStudents([...students, newStudent]);
        setSuccessMessage('Student added successfully');
      }
      setOpenDialog(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to save student');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !filterClass || student.sclass === filterClass;
    const matchesStatus = !filterStatus || student.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const columns = [
    { field: 'studentId', label: 'Student ID', minWidth: 100 },
    { field: 'name', label: 'Student Name', minWidth: 150 },
    { field: 'email', label: 'Email', minWidth: 180 },
    { field: 'phone', label: 'Phone', minWidth: 120 },
    {
      field: 'sclass',
      label: 'Class',
      minWidth: 80,
      render: (value) => <Chip label={value} size="small" color="primary" variant="outlined" />
    },
    { field: 'parentName', label: 'Parent Name', minWidth: 150 },
    { field: 'parentPhone', label: 'Parent Phone', minWidth: 120 },
    {
      field: 'status',
      label: 'Status',
      minWidth: 80,
      render: (value) => (
        <Chip
          label={value}
          color={value === 'Active' ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Students Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage all student records, enrollment, and information
        </Typography>
      </Box>

      {/* Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Class</InputLabel>
              <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} label="Filter by Class">
                <MenuItem value="">All Classes</MenuItem>
                <MenuItem value="10A">10A</MenuItem>
                <MenuItem value="10B">10B</MenuItem>
                <MenuItem value="9A">9A</MenuItem>
                <MenuItem value="9B">9B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Filter by Status">
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<PrintIcon />} variant="outlined" size="small" fullWidth>
              Print
            </Button>
            <Button startIcon={<DownloadIcon />} variant="outlined" size="small" fullWidth>
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table */}
      <Box sx={{ backgroundColor: 'white', borderRadius: '8px', p: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={filteredStudents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAddClick}
            searchFields={['name', 'email', 'studentId']}
            actions={true}
          />
        )}
      </Box>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
          {editingId ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Student Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              fullWidth
              error={!!formErrors.studentId}
              helperText={formErrors.studentId}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
            <TextField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth error={!!formErrors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                label="Gender"
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth error={!!formErrors.sclassId}>
              <InputLabel>Class</InputLabel>
              <Select
                name="sclassId"
                value={formData.sclassId}
                onChange={handleInputChange}
                label="Class"
              >
                <MenuItem value="">Select Class</MenuItem>
                <MenuItem value="10A">10A</MenuItem>
                <MenuItem value="10B">10B</MenuItem>
                <MenuItem value="9A">9A</MenuItem>
                <MenuItem value="9B">9B</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Parent Name"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Parent Phone"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleInputChange}
              fullWidth
            />
            {!editingId && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingId ? 'Update' : 'Add'} Student
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentsManagement;
