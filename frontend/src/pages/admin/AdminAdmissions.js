import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, CircularProgress, Tooltip, Alert, Snackbar
} from '@mui/material';
import {
    Search as SearchIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
    Refresh as RefreshIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAdmissions, approveAdmission, rejectAdmission } from '../../redux/slices/adminSlice';
import BulkAdmissionImportDialog from '../../components/admin/BulkAdmissionImportDialog';

const AdminAdmissions = () => {
    const dispatch = useDispatch();
    const { admissions, loading, error, success, message } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Reject Dialog
    const [openReject, setOpenReject] = useState(false);
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [openImportDialog, setOpenImportDialog] = useState(false);
    
    // Snackbar state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        dispatch(fetchAdmissions());
    }, [dispatch]);

    useEffect(() => {
        if (success && message) {
            setSnackbar({ open: true, message, severity: 'success' });
        }
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
        }
    }, [success, message, error]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };

    const handleApprove = async (id) => {
        if (window.confirm("Approve this admission application and create a student profile?")) {
            const result = await dispatch(approveAdmission(id));
            if (!result.error) {
                setSnackbar({ open: true, message: 'Admission approved successfully!', severity: 'success' });
                dispatch(fetchAdmissions());
            } else {
                setSnackbar({ open: true, message: result.payload || 'Failed to approve admission', severity: 'error' });
            }
        }
    };

    const handleOpenReject = (id) => {
        setRejectId(id);
        setOpenReject(true);
    };

    const submitReject = async () => {
        if (!rejectReason.trim()) {
            setSnackbar({ open: true, message: 'Please provide a rejection reason', severity: 'warning' });
            return;
        }
        
        const result = await dispatch(rejectAdmission({ id: rejectId, reason: rejectReason }));
        if (!result.error) {
            setSnackbar({ open: true, message: 'Admission rejected successfully!', severity: 'success' });
            setOpenReject(false);
            setRejectId(null);
            setRejectReason('');
            dispatch(fetchAdmissions());
        } else {
            setSnackbar({ open: true, message: result.payload || 'Failed to reject admission', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredAdmissions = admissions?.filter((app) => {
        const name = (app.applicantName || app.studentName || '').toLowerCase();
        const email = (app.applicantEmail || app.email || '').toLowerCase();
        const phone = (app.applicantPhone || app.phone || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term) || phone.includes(term);
    }) || [];

    const paginatedAdmissions = filteredAdmissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getStatusColor = (status) => {
        if (status === 'approved') return 'success';
        if (status === 'rejected') return 'error';
        return 'warning';
    };

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Admissions Management
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchAdmissions())} sx={{ mr: 2 }}>
                        Refresh List
                    </Button>
                    <Button variant="outlined" onClick={() => setOpenImportDialog(true)}>
                        Import CSV
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search by student name, email, or phone..."
                        value={searchTerm}
                        onChange={handleSearch}
                        size="small"
                        sx={{ width: 400 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                    />
                    {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                        Total: {filteredAdmissions.length} admissions
                    </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Student Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Contact Info</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class Applied</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedAdmissions.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        {searchTerm ? 'No admissions found matching your search.' : 'No admissions found. Import CSV to add admissions.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAdmissions.map((app) => (
                                    <TableRow hover key={app.id}>
                                        <TableCell sx={{ fontWeight: 500 }}>{app.applicantName || app.studentName}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{app.applicantEmail || app.email}</Typography>
                                            <Typography variant="caption" color="text.secondary">{app.applicantPhone || app.phone}</Typography>
                                        </TableCell>
                                        <TableCell>{app.appliedFor || app.sclass?.sclassName || 'N/A'}</TableCell>
                                        <TableCell>{new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip label={app.status.toUpperCase()} size="small" color={getStatusColor(app.status)} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton color="info" size="small"><VisibilityIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            {app.status === 'pending' && (
                                                <>
                                                    <Tooltip title="Approve & Admit">
                                                        <IconButton color="success" size="small" onClick={() => handleApprove(app.id)}>
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject Application">
                                                        <IconButton color="error" size="small" onClick={() => handleOpenReject(app.id)}>
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
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
                    count={filteredAdmissions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Reject Dialog */}
            <Dialog open={openReject} onClose={() => setOpenReject(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Reject Admission Application</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 2 }}>Please provide a reason for rejecting this admission application. This reason may be shared with the applicant.</Typography>
                    <TextField
                        label="Rejection Reason"
                        multiline
                        rows={4}
                        fullWidth
                        required
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenReject(false)} color="inherit">Cancel</Button>
                    <Button onClick={submitReject} variant="contained" color="error" disabled={!rejectReason.trim() || loading}>
                        {loading ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <BulkAdmissionImportDialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} />
        </DashboardLayout>
    );
};

export default AdminAdmissions;
