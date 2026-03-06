import React, { useState } from 'react';
import {
  Container, Box, Card, CardContent, Grid, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Stack,
  Typography, Tab, Tabs, CardHeader, Divider, Alert
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const ClassesSubjectsManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [classes, setClasses] = useState([
    { id: 1, className: '10A', sectionName: 'A', capacity: 50, enrolledCount: 45, classTeacher: 'Dr. Sharma', academicYear: '2023-24' },
    { id: 2, className: '10B', sectionName: 'B', capacity: 50, enrolledCount: 48, classTeacher: 'Ms. Singh', academicYear: '2023-24' },
    { id: 3, className: '9A', sectionName: 'A', capacity: 50, enrolledCount: 42, classTeacher: 'Mr. Patel', academicYear: '2023-24' }
  ]);

  const [subjects, setSubjects] = useState([
    { id: 1, subName: 'Physics', subCode: 'PHY001', class: '10A', teacher: 'Dr. Rajesh Sharma', creditHours: 3, maxMarks: 100, passingMarks: 40 },
    { id: 2, subName: 'Chemistry', subCode: 'CHM001', class: '10A', teacher: 'Dr. Rajesh Sharma', creditHours: 3, maxMarks: 100, passingMarks: 40 },
    { id: 3, subName: 'Mathematics', subCode: 'MAT001', class: '10A', teacher: 'Ms. Priya Singh', creditHours: 4, maxMarks: 100, passingMarks: 40 },
    { id: 4, subName: 'English', subCode: 'ENG001', class: '10B', teacher: 'Mr. John Doe', creditHours: 3, maxMarks: 100, passingMarks: 35 }
  ]);

  const [formData, setFormData] = useState({
    className: '', sectionName: '', capacity: 50, classTeacher: '', academicYear: '2023-24'
  });

  const [subjectFormData, setSubjectFormData] = useState({
    subName: '', subCode: '', class: '', teacher: '', creditHours: 3, maxMarks: 100, passingMarks: 40
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddClass = () => {
    setEditingId(null);
    setFormData({ className: '', sectionName: '', capacity: 50, classTeacher: '', academicYear: '2023-24' });
    setOpenDialog(true);
  };

  const handleEditClass = (cls) => {
    setEditingId(cls.id);
    setFormData(cls);
    setOpenDialog(true);
  };

  const handleDeleteClass = (id) => {
    if (window.confirm('Delete this class?')) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  const handleSaveClass = () => {
    if (editingId) {
      setClasses(classes.map(c => c.id === editingId ? { ...c, ...formData } : c));
    } else {
      const newClass = { id: Math.max(...classes.map(c => c.id), 0) + 1, ...formData };
      setClasses([...classes, newClass]);
    }
    setOpenDialog(false);
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm('Delete this subject?')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Classes & Subjects Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage classes, sections, and subject allocations
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Classes & Sections (${classes.length})`} />
            <Tab label={`Subjects (${subjects.length})`} />
          </Tabs>
        </Box>

        {/* Classes Tab */}
        {tabValue === 0 && (
          <CardContent>
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Total Classes</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                      {classes.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Total Students</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1, color: '#2196F3' }}>
                      {classes.reduce((sum, c) => sum + c.enrolledCount, 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Total Capacity</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1, color: '#4CAF50' }}>
                      {classes.reduce((sum, c) => sum + c.capacity, 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Occupancy Rate</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1, color: '#FFC107' }}>
                      {(classes.reduce((sum, c) => sum + c.enrolledCount, 0) / classes.reduce((sum, c) => sum + c.capacity, 0) * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Add Button */}
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClass}>
                Add Class
              </Button>
            </Box>

            {/* Classes Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Enrolled</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class Teacher</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Academic Year</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Occupancy</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((cls) => {
                    const occupancy = (cls.enrolledCount / cls.capacity * 100).toFixed(1);
                    return (
                      <TableRow key={cls.id} hover>
                        <TableCell sx={{ fontWeight: '500' }}>Class {cls.className}</TableCell>
                        <TableCell>{cls.sectionName}</TableCell>
                        <TableCell>{cls.capacity}</TableCell>
                        <TableCell sx={{ color: '#2196F3', fontWeight: 'bold' }}>{cls.enrolledCount}</TableCell>
                        <TableCell>{cls.classTeacher}</TableCell>
                        <TableCell>{cls.academicYear}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Box sx={{ flex: 1, mr: 1 }}>
                              <Chip
                                label={`${occupancy}%`}
                                size="small"
                                color={occupancy > 80 ? 'error' : occupancy > 50 ? 'warning' : 'success'}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditClass(cls)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClass(cls.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Subjects Tab */}
        {tabValue === 1 && (
          <CardContent>
            {/* Add Subject Button */}
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add Subject
              </Button>
            </Box>

            {/* Subjects Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Credit Hours</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Max Marks</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Passing Marks</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id} hover>
                      <TableCell sx={{ fontWeight: '500' }}>{subject.subCode}</TableCell>
                      <TableCell>{subject.subName}</TableCell>
                      <TableCell>
                        <Chip label={subject.class} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{subject.teacher}</TableCell>
                      <TableCell>{subject.creditHours}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{subject.maxMarks}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#4CAF50' }}>{subject.passingMarks}</TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<EditIcon />} sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* Class Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Class Name"
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              fullWidth
              placeholder="e.g., 10"
            />
            <TextField
              label="Section"
              value={formData.sectionName}
              onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
              fullWidth
              placeholder="e.g., A, B, C"
            />
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Class Teacher"
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                label="Academic Year"
              >
                <MenuItem value="2023-24">2023-24</MenuItem>
                <MenuItem value="2024-25">2024-25</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveClass} variant="contained" color="primary">
            {editingId ? 'Update' : 'Add'} Class
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassesSubjectsManagement;
