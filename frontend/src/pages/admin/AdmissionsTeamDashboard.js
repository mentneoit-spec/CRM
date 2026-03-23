import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    CardHeader,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DownloadIcon from '@mui/icons-material/Download';

const AdmissionsTeamDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [admissions, setAdmissions] = useState([]);
    const [filteredAdmissions, setFilteredAdmissions] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [comments, setComments] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // Statistics
    const stats = useMemo(() => {
        return {
            total: admissions.length,
            pending: admissions.filter(a => a.status === 'pending').length,
            approved: admissions.filter(a => a.status === 'approved').length,
            rejected: admissions.filter(a => a.status === 'rejected').length,
            enrolled: admissions.filter(a => a.status === 'enrolled').length,
        };
    }, [admissions]);

    // Filter admissions
    useEffect(() => {
        let filtered = admissions;

        if (statusFilter) {
            filtered = filtered.filter(a => a.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.applicantEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.applicantPhone?.includes(searchTerm)
            );
        }

        setFilteredAdmissions(filtered);
        setPage(1);
    }, [admissions, statusFilter, searchTerm]);

    // Load admissions
    useEffect(() => {
        const loadAdmissions = async () => {
            try {
                setLoading(true);
                const response = await adminAPI.getAdmissions();
                if (response.data.success) {
                    setAdmissions(response.data.data || []);
                }
            } catch (err) {
                setError('Failed to load admissions');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadAdmissions();
    }, []);

    const handleApprove = async () => {
        if (!selectedAdmission) return;

        try {
            const response = await adminAPI.approveAdmission(selectedAdmission.id, { comments });
            if (response.data.success) {
                setMessage('Admission approved successfully');
                setAdmissions(admissions.map(a =>
                    a.id === selectedAdmission.id ? { ...a, status: 'approved' } : a
                ));
                setOpenDialog(false);
                setSelectedAdmission(null);
                setComments('');
            }
        } catch (err) {
            setError('Failed to approve admission');
            console.error(err);
        }
    };

    const handleReject = async () => {
        if (!selectedAdmission || !rejectionReason) {
            setError('Please provide a rejection reason');
            return;
        }

        try {
            const response = await adminAPI.rejectAdmission(selectedAdmission.id, {
                rejectionReason,
                comments,
            });
            if (response.data.success) {
                setMessage('Admission rejected');
                setAdmissions(admissions.map(a =>
                    a.id === selectedAdmission.id ? { ...a, status: 'rejected' } : a
                ));
                setOpenDialog(false);
                setSelectedAdmission(null);
                setRejectionReason('');
                setComments('');
            }
        } catch (err) {
            setError('Failed to reject admission');
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'enrolled':
                return 'info';
            default:
                return 'warning';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon />;
            case 'rejected':
                return <CancelIcon />;
            case 'enrolled':
                return <PersonAddIcon />;
            default:
                return <PendingIcon />;
        }
    };

    const paginatedAdmissions = filteredAdmissions.slice(
        (page - 1) * limit,
        page * limit
    );

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Admissions Team Dashboard
                </Typography>

                {message && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Applications
                                </Typography>
                                <Typography variant="h5">{stats.total}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ backgroundColor: '#fff3e0' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Pending
                                </Typography>
                                <Typography variant="h5">{stats.pending}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ backgroundColor: '#e8f5e9' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Approved
                                </Typography>
                                <Typography variant="h5">{stats.approved}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ backgroundColor: '#ffebee' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Rejected
                                </Typography>
                                <Typography variant="h5">{stats.rejected}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ backgroundColor: '#e3f2fd' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Enrolled
                                </Typography>
                                <Typography variant="h5">{stats.enrolled}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search by name, email, or phone"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    label="Status"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="approved">Approved</MenuItem>
                                    <MenuItem value="rejected">Rejected</MenuItem>
                                    <MenuItem value="enrolled">Enrolled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Admissions Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Applied For</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Applied Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedAdmissions.length > 0 ? (
                                paginatedAdmissions.map((admission) => (
                                    <TableRow key={admission.id} hover>
                                        <TableCell>{admission.applicantName}</TableCell>
                                        <TableCell>{admission.applicantEmail}</TableCell>
                                        <TableCell>{admission.applicantPhone}</TableCell>
                                        <TableCell>{admission.appliedFor || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getStatusIcon(admission.status)}
                                                label={admission.status}
                                                color={getStatusColor(admission.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(admission.appliedDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {admission.status === 'pending' && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => {
                                                        setSelectedAdmission(admission);
                                                        setOpenDialog(true);
                                                    }}
                                                >
                                                    Review
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        No admissions found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {filteredAdmissions.length > limit && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                        <Button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </Button>
                        <Typography sx={{ alignSelf: 'center' }}>
                            Page {page} of {Math.ceil(filteredAdmissions.length / limit)}
                        </Typography>
                        <Button
                            disabled={page >= Math.ceil(filteredAdmissions.length / limit)}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </Box>
                )}

                {/* Review Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Review Admission Application</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        {selectedAdmission && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Applicant Name
                                    </Typography>
                                    <Typography>{selectedAdmission.applicantName}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Email
                                    </Typography>
                                    <Typography>{selectedAdmission.applicantEmail}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Phone
                                    </Typography>
                                    <Typography>{selectedAdmission.applicantPhone}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Applied For
                                    </Typography>
                                    <Typography>{selectedAdmission.appliedFor || 'N/A'}</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Comments"
                                    multiline
                                    rows={3}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Add any comments or notes"
                                />
                                <TextField
                                    fullWidth
                                    label="Rejection Reason (if rejecting)"
                                    multiline
                                    rows={2}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide reason for rejection"
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleReject}
                            color="error"
                            variant="contained"
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={handleApprove}
                            color="success"
                            variant="contained"
                        >
                            Approve
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default AdmissionsTeamDashboard;
