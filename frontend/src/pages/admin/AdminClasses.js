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
    Delete as DeleteIcon, Refresh as RefreshIcon, Class as ClassIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchClasses, createClass, fetchTeachers } from '../../redux/slices/adminSlice';

const AdminClasses = () => {
    const dispatch = useDispatch();
    const { classes, teachers, loading } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newClass, setNewClass] = useState({
        sclassName: '', sclassCode: '', academicYear: new Date().getFullYear().toString(),
        description: '', classTeacherId: ''
    });

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchTeachers());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        dispatch(createClass(newClass)).then((res) => {
            if (!res.error) {
                setOpenAddDialog(false);
                setNewClass({
                    sclassName: '', sclassCode: '', academicYear: new Date().getFullYear().toString(),
                    description: '', classTeacherId: ''
                });
            }
        });
    };

    const filteredClasses = classes?.filter((cls) =>
        cls.sclassName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.sclassCode?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const paginatedClasses = filteredClasses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Class Management
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchClasses())} sx={{ mr: 2 }}>
                        Refresh
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
                        Add New Class
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search classes by name or code..."
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
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Academic Year</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class Teacher</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Stats</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedClasses.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No classes found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedClasses.map((cls) => (
                                    <TableRow hover key={cls.id}>
                                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ClassIcon sx={{ mr: 1, color: 'primary.light' }} />
                                                {cls.sclassName}
                                            </Box>
                                        </TableCell>
                                        <TableCell><Chip label={cls.sclassCode || 'N/A'} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{cls.academicYear}</TableCell>
                                        <TableCell>
                                            {cls.classTeacher?.name || <Typography variant="caption" color="error">Not Assigned</Typography>}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Total Students">
                                                    <Chip label={`${cls._count?.Students || 0} S`} size="small" color="info" />
                                                </Tooltip>
                                                <Tooltip title="Total Subjects">
                                                    <Chip label={`${cls._count?.Subjects || 0} Sub`} size="small" color="secondary" />
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Class">
                                                <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Class">
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
                    count={filteredClasses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add Class Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleAddSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Class</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <TextField label="Class Name (e.g., Grade 10, 1st Year B.Tech)" fullWidth required value={newClass.sclassName} onChange={(e) => setNewClass({ ...newClass, sclassName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Class Code" fullWidth value={newClass.sclassCode} onChange={(e) => setNewClass({ ...newClass, sclassCode: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Academic Year" fullWidth required value={newClass.academicYear} onChange={(e) => setNewClass({ ...newClass, academicYear: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Class Teacher (Optional)</InputLabel>
                                    <Select
                                        value={newClass.classTeacherId}
                                        onChange={(e) => setNewClass({ ...newClass, classTeacherId: e.target.value })}
                                        label="Class Teacher (Optional)"
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {teachers?.map((t) => (
                                            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Description / Notes" multiline rows={3} fullWidth value={newClass.description} onChange={(e) => setNewClass({ ...newClass, description: e.target.value })} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Class'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminClasses;
