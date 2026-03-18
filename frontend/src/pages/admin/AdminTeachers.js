import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, CircularProgress, Tooltip, Alert
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
    Delete as DeleteIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchTeachers, createTeacher, clearAdminError } from '../../redux/slices/adminSlice';

const AdminTeachers = () => {
    const dispatch = useDispatch();
    const { teachers, loading, error } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newTeacher, setNewTeacher] = useState({
        name: '', email: '', phone: '', password: '',
        qualification: '', experience: '', specialization: ''
    });

    useEffect(() => {
        dispatch(fetchTeachers());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        dispatch(clearAdminError());
        dispatch(createTeacher(newTeacher)).then((res) => {
            if (!res.error) {
                setOpenAddDialog(false);
                setNewTeacher({ name: '', email: '', phone: '', password: '', qualification: '', experience: '', specialization: '' });
            }
        });
    };

    const filteredTeachers = teachers?.filter((teacher) =>
        teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const paginatedTeachers = filteredTeachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Teacher Management
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchTeachers())} sx={{ mr: 2 }}>
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            dispatch(clearAdminError());
                            setOpenAddDialog(true);
                        }}
                    >
                        Add New Teacher
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search teachers by name or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        size="small"
                        sx={{ width: 350 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                    />
                    {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Specialization</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Experience</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedTeachers.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No teachers found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedTeachers.map((teacher) => (
                                    <TableRow hover key={teacher.id}>
                                        <TableCell sx={{ fontWeight: 500 }}>{teacher.name}</TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell><Chip label={teacher.specialization || 'General'} size="small" color="primary" variant="outlined" /></TableCell>
                                        <TableCell>{teacher.experience ? `${teacher.experience} Years` : 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Teacher">
                                                <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Teacher">
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
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredTeachers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add Teacher Dialog */}
            <Dialog
                open={openAddDialog}
                onClose={() => {
                    setOpenAddDialog(false);
                    dispatch(clearAdminError());
                }}
                maxWidth="sm"
                fullWidth
            >
                <form onSubmit={handleAddSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Register New Teacher</DialogTitle>
                    <DialogContent dividers>
                        {error ? (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
                                {error}
                            </Alert>
                        ) : null}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField label="Full Name" fullWidth required value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Email" type="email" fullWidth required value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Phone" fullWidth value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Temporary Password" type="password" fullWidth required value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Qualification" fullWidth value={newTeacher.qualification} onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Years of Experience" type="number" fullWidth value={newTeacher.experience} onChange={(e) => setNewTeacher({ ...newTeacher, experience: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Specialization / Subject" fullWidth value={newTeacher.specialization} onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Registering...' : 'Add Teacher'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminTeachers;
