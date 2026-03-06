import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, CircularProgress, Tooltip, IconButton
} from '@mui/material';
import {
    Search as SearchIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchFees } from '../../redux/slices/adminSlice';

const AdminFees = () => {
    const dispatch = useDispatch();
    const { fees, loading } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchFees());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };

    const filteredFees = fees?.filter((fee) =>
        fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.feeType?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const paginatedFees = filteredFees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getStatusColor = (status) => {
        if (status === 'completed' || status === 'paid') return 'success';
        if (status === 'failed') return 'error';
        if (status === 'refunded') return 'info';
        return 'warning';
    };

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Fees Management
                </Typography>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchFees())}>
                    Refresh List
                </Button>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search by student name or fee type..."
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
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class / Section</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Fee Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Amount (₹)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Due Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Active Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedFees.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No fee records found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedFees.map((fee) => (
                                    <TableRow hover key={fee.id}>
                                        <TableCell sx={{ fontWeight: 500 }}>{fee.student?.name || 'Unknown'}</TableCell>
                                        <TableCell>{fee.student?.sclass?.sclassName || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={fee.feeType.toUpperCase()} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                                            ₹{fee.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip label={fee.isActive ? 'ACTIVE' : 'INACTIVE'} size="small" color={fee.isActive ? 'success' : 'default'} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Payments">
                                                <IconButton color="primary" size="small"><VisibilityIcon fontSize="small" /></IconButton>
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
                    count={filteredFees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </DashboardLayout>
    );
};

export default AdminFees;
