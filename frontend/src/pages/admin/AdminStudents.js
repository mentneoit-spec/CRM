import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, CircularProgress, Tooltip, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
    Delete as DeleteIcon, Refresh as RefreshIcon, ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchStudents, createStudent, fetchClasses } from '../../redux/slices/adminSlice';

const AdminStudents = () => {
    const dispatch = useDispatch();
    const { students, classes, loading } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '', studentId: '', email: '', phone: '', password: '',
        sclassId: '', parentName: '', parentPhone: ''
    });

    useEffect(() => {
        dispatch(fetchStudents());
        dispatch(fetchClasses());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        dispatch(createStudent(newStudent)).then((res) => {
            if (!res.error) {
                setOpenAddDialog(false);
                setNewStudent({ name: '', studentId: '', email: '', phone: '', password: '', sclassId: '', parentName: '', parentPhone: '' });
            }
        });
    };

    const filteredStudents = students?.filter((student) =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Student Directory
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchStudents())} sx={{ mr: 2 }}>
                        Refresh
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
                        Admit Student
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search by name, email, or roll number..."
                        value={searchTerm}
                        onChange={handleSearch}
                        size="small"
                        sx={{ width: 400 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                    />
                    {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Student ID / Roll No</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class / Section</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Contact</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Parent Info</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedStudents.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No students found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedStudents.map((student) => (
                                    <TableRow hover key={student.id}>
                                        <TableCell>
                                            <Chip label={student.studentId} size="small" variant="filled" color="default" sx={{ fontWeight: 700 }} />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{student.name}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{student.sclass?.sclassName || 'N/A'}</Typography>
                                            {student.section && <Typography variant="caption" color="text.secondary">Sec: {student.section.name}</Typography>}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{student.email}</Typography>
                                            <Typography variant="caption" color="text.secondary">{student.phone}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{student.parentName || 'N/A'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{student.parentPhone}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Student">
                                                <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Student">
                                                <IconButton color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredStudents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add Student Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
                <form onSubmit={handleAddSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>New Student Admission</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            {/* Student Details */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Student Information</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Full Name" fullWidth required value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Student ID / Roll No" fullWidth required value={newStudent.studentId} onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Email" type="email" fullWidth required value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Contact Number" fullWidth value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Class</InputLabel>
                                    <Select
                                        value={newStudent.sclassId}
                                        onChange={(e) => setNewStudent({ ...newStudent, sclassId: e.target.value })}
                                        label="Class"
                                    >
                                        {classes?.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>{cls.sclassName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Temporary Login Password" type="password" fullWidth required value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} />
                            </Grid>

                            {/* Parent Details */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Parent/Guardian Information</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Parent/Guardian Name" fullWidth required value={newStudent.parentName} onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Parent Contact Number" fullWidth required value={newStudent.parentPhone} onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Admitting...' : 'Complete Admission'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminStudents;
