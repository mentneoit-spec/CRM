import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchColleges, createCollege, suspendCollege } from '../../redux/slices/superadminSlice';

const CollegesList = () => {
    const dispatch = useDispatch();
    const { colleges, loading, error } = useSelector((state) => state.superadmin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newCollege, setNewCollege] = useState({
        name: '',
        email: '',
        phone: '',
        domain: '',
        address: '',
        city: ''
    });

    useEffect(() => {
        dispatch(fetchColleges());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

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
        dispatch(createCollege(newCollege)).then((res) => {
            if (!res.error) {
                setOpenAddDialog(false);
                setNewCollege({ name: '', email: '', phone: '', domain: '', address: '', city: '' });
            }
        });
    };

    const handleSuspend = (id) => {
        if (window.confirm("Are you sure you want to suspend this college?")) {
            dispatch(suspendCollege(id));
        }
    };

    // Filter Colleges
    const filteredColleges = colleges?.filter((college) =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const paginatedColleges = filteredColleges.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <DashboardLayout role="superadmin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    College Management
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => dispatch(fetchColleges())}
                        sx={{ mr: 2 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddDialog(true)}
                    >
                        Add New College
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search colleges by name or domain..."
                        value={searchTerm}
                        onChange={handleSearch}
                        size="small"
                        sx={{ width: 350 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>College Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Domain</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Users</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedColleges.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        No colleges found extending the search criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedColleges.map((college) => (
                                    <TableRow hover key={college.id}>
                                        <TableCell>{college.id.substring(0, 8)}...</TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{college.name}</TableCell>
                                        <TableCell>
                                            {college.Domains?.[0]?.domain || college.domain || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={`${college._count?.Users || 0} Users`} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={college.status.toUpperCase()}
                                                color={college.status === 'active' ? 'success' : 'error'}
                                                size="small"
                                                icon={college.status === 'active' ? <CheckCircleIcon /> : <BlockIcon />}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit College">
                                                <IconButton color="primary" size="small">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Suspend College">
                                                <IconButton color="error" size="small" onClick={() => handleSuspend(college.id)}>
                                                    <BlockIcon fontSize="small" />
                                                </IconButton>
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
                    count={filteredColleges.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add College Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleAddSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Register New College</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="College Name"
                                    fullWidth
                                    required
                                    value={newCollege.name}
                                    onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Primary Domain (e.g., vels.edu.in)"
                                    fullWidth
                                    required
                                    value={newCollege.domain}
                                    onChange={(e) => setNewCollege({ ...newCollege, domain: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Contact Email"
                                    type="email"
                                    fullWidth
                                    value={newCollege.email}
                                    onChange={(e) => setNewCollege({ ...newCollege, email: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Contact Phone"
                                    fullWidth
                                    value={newCollege.phone}
                                    onChange={(e) => setNewCollege({ ...newCollege, phone: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="City"
                                    fullWidth
                                    value={newCollege.city}
                                    onChange={(e) => setNewCollege({ ...newCollege, city: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Creating...' : 'Register College'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </DashboardLayout>
    );
};

export default CollegesList;
