import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, CircularProgress, Tooltip, IconButton, Alert,
    FormControl, InputLabel, Select, MenuItem, Tabs, Tab
} from '@mui/material';
import {
    Search as SearchIcon, Refresh as RefreshIcon, Download as DownloadIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI, accountsAPI } from '../../config/api';

const AdminReceipts = () => {
    const dispatch = useDispatch();

    // Tab State
    const [activeTab, setActiveTab] = useState(0);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter State
    const [filterClass, setFilterClass] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');

    // Data State
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            // Fetch students with pagination (first 100)
            const studentsRes = await adminAPI.getStudents({ limit: 100 });
            const allStudents = studentsRes?.data?.data || [];
            setStudents(allStudents);

            // Extract unique classes
            const uniqueClasses = [...new Set(allStudents.map(s => s.sclass?.sclassName).filter(Boolean))];
            setClasses(uniqueClasses);

            // Fetch payments with pagination (first 100)
            try {
                const paymentsRes = await accountsAPI.getPayments({ limit: 100 });
                // The API interceptor returns response.data, which is { success: true, data: payments, pagination: {...} }
                const allPayments = paymentsRes?.data || [];
                
                // Payments already include student data from backend
                const enrichedPayments = allPayments.map(payment => ({
                    ...payment,
                    studentName: payment.student?.name || 'Unknown',
                    studentEmail: payment.student?.email || 'N/A',
                    studentClass: payment.student?.sclass?.sclassName || 'N/A',
                    studentRoll: payment.student?.rollNum || 'N/A'
                }));

                enrichedPayments.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB - dateA;
                });

                setPayments(enrichedPayments);
            } catch (err) {
                console.error('Error loading payments:', err);
                setPayments([]);
            }
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to load data');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { 
        setRowsPerPage(parseInt(event.target.value, 10)); 
        setPage(0); 
    };
    const handleSearch = (event) => { 
        setSearchTerm(event.target.value); 
        setPage(0); 
    };

    // Filter payments for Receipts tab
    const filteredPayments = payments.filter((payment) =>
        payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get student-wise payment summary for Payments tab (optimized with Map for O(n) lookup)
    const getStudentPaymentSummary = () => {
        // Create Map for O(1) lookups instead of O(n) filter
        const paymentsByStudent = new Map();
        payments.forEach(p => {
            if (!paymentsByStudent.has(p.studentId)) {
                paymentsByStudent.set(p.studentId, []);
            }
            paymentsByStudent.get(p.studentId).push(p);
        });

        const summary = {};
        
        students.forEach(student => {
            const studentPayments = paymentsByStudent.get(student.id) || [];
            const studentFees = student.Fees || [];
            
            const totalFees = studentFees.reduce((sum, f) => sum + (f.amount || 0), 0);
            const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const totalPending = totalFees - totalPaid;
            
            // Create Map for fee lookups
            const feePaymentMap = new Map();
            studentPayments.forEach(p => {
                if (p.feeId) {
                    if (!feePaymentMap.has(p.feeId)) {
                        feePaymentMap.set(p.feeId, 0);
                    }
                    feePaymentMap.set(p.feeId, feePaymentMap.get(p.feeId) + (p.amount || 0));
                }
            });
            
            summary[student.id] = {
                studentId: student.id,
                studentName: student.name,
                studentEmail: student.email,
                studentClass: student.sclass?.sclassName || 'N/A',
                studentRoll: student.rollNum || 'N/A',
                totalFees,
                totalPaid,
                totalPending,
                paymentPercentage: totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0,
                paymentCount: studentPayments.length,
                paymentStatus: totalPending <= 0 ? 'Paid' : 'Pending',
                pendingFees: studentFees.filter(f => {
                    const feePaid = feePaymentMap.get(f.id) || 0;
                    return feePaid < (f.amount || 0);
                }).map(f => ({
                    feeType: f.feeType,
                    amount: f.amount,
                    paid: feePaymentMap.get(f.id) || 0,
                    pending: Math.max(0, (f.amount || 0) - (feePaymentMap.get(f.id) || 0))
                }))
            };
        });
        
        return Object.values(summary);
    };

    // Filter student payments for Payments tab
    const studentPaymentSummary = getStudentPaymentSummary();
    const filteredStudentPayments = studentPaymentSummary.filter(student => {
        const matchesSearch = student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !filterClass || student.studentClass === filterClass;
        const matchesStatus = !filterPaymentStatus || student.paymentStatus === filterPaymentStatus;
        
        return matchesSearch && matchesClass && matchesStatus;
    });

    const paginatedPayments = filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const paginatedStudentPayments = filteredStudentPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Calculate statistics
    const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        completedPayments: payments.filter(p => p.status === 'completed').length,
        pendingPayments: payments.filter(p => p.status !== 'completed').length,
    };

    const handleDownloadReceipt = async (paymentId) => {
        try {
            const receiptRes = await adminAPI.downloadPaymentReceipt(paymentId);
            const url = window.URL.createObjectURL(new Blob([receiptRes.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setErrorMessage('Failed to download receipt');
            console.error('Error downloading receipt:', error);
        }
    };

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Receipts & Payments
                </Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />} 
                    onClick={loadAllData}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => { setActiveTab(newValue); setPage(0); }}>
                    <Tab label="All Receipts" />
                    <Tab label="Student Payments" />
                </Tabs>
            </Paper>

            {errorMessage && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>{errorMessage}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

            {/* TAB 1: ALL RECEIPTS */}
            {activeTab === 0 && (
                <>
                    {/* Statistics Cards */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 4 }}>
                        <Paper sx={{ p: 3, bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
                            <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                                Total Payments
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mt: 1 }}>
                                {payments.length}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, bgcolor: '#c8e6c9', borderLeft: '4px solid #388e3c' }}>
                            <Typography variant="body2" sx={{ color: '#388e3c', fontWeight: 600 }}>
                                Total Amount Received
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c', mt: 1 }}>
                                ₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, bgcolor: '#c8e6c9', borderLeft: '4px solid #388e3c' }}>
                            <Typography variant="body2" sx={{ color: '#388e3c', fontWeight: 600 }}>
                                Completed Payments
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c', mt: 1 }}>
                                {payments.filter(p => p.status === 'completed').length}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, bgcolor: '#fff3e0', borderLeft: '4px solid #f57c00' }}>
                            <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 600 }}>
                                Pending Payments
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f57c00', mt: 1 }}>
                                {payments.filter(p => p.status !== 'completed').length}
                            </Typography>
                        </Paper>
                    </Box>

                    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                            <TextField
                                variant="outlined"
                                placeholder="Search by student name, email, fee type, or transaction ID..."
                                value={searchTerm}
                                onChange={handleSearch}
                                size="small"
                                sx={{ width: 500 }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                            />
                            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                        </Box>

                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Student Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Fee Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'right' }}>Amount (₹)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Payment Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPayments.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                                No receipts found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedPayments.map((payment) => (
                                            <TableRow hover key={payment.id}>
                                                <TableCell sx={{ fontWeight: 500 }}>{payment.studentName || payment.student?.name || 'Unknown'}</TableCell>
                                                <TableCell sx={{ fontSize: '0.9rem' }}>{payment.studentEmail || payment.student?.email || 'N/A'}</TableCell>
                                                <TableCell>{payment.studentClass || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Chip label={payment.notes || 'Fee Payment'} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'success.main', textAlign: 'right' }}>
                                                    ₹{payment.amount?.toLocaleString() || 0}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={payment.status?.toUpperCase() || 'PENDING'} 
                                                        size="small" 
                                                        color={payment.status === 'completed' ? 'success' : 'warning'}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Download Receipt">
                                                        <IconButton 
                                                            color="primary" 
                                                            size="small"
                                                            onClick={() => handleDownloadReceipt(payment.id)}
                                                        >
                                                            <DownloadIcon fontSize="small" />
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
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={filteredPayments.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </>
            )}

            {/* TAB 2: STUDENT PAYMENTS */}
            {activeTab === 1 && (
                <>
                    {/* Filter Section */}
                    <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Filters</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                            <TextField
                                variant="outlined"
                                placeholder="Search by student name or email..."
                                value={searchTerm}
                                onChange={handleSearch}
                                size="small"
                                fullWidth
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                            />
                            <FormControl size="small" fullWidth>
                                <InputLabel>Class</InputLabel>
                                <Select
                                    label="Class"
                                    value={filterClass}
                                    onChange={(e) => { setFilterClass(e.target.value); setPage(0); }}
                                >
                                    <MenuItem value="">All Classes</MenuItem>
                                    {classes.map(cls => (
                                        <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Payment Status</InputLabel>
                                <Select
                                    label="Payment Status"
                                    value={filterPaymentStatus}
                                    onChange={(e) => { setFilterPaymentStatus(e.target.value); setPage(0); }}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="Paid">Paid</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Paper>

                    {/* Student Payment Summary */}
                    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Student Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'right' }}>Total Fees (₹)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'right' }}>Paid (₹)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'right' }}>Pending (₹)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Progress</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Payments</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Pending Fees Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedStudentPayments.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedStudentPayments.map((student) => (
                                            <TableRow hover key={student.studentId}>
                                                <TableCell sx={{ fontWeight: 500 }}>{student.studentName}</TableCell>
                                                <TableCell sx={{ fontSize: '0.9rem' }}>{student.studentEmail}</TableCell>
                                                <TableCell>{student.studentClass}</TableCell>
                                                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>
                                                    ₹{student.totalFees.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'success.main', textAlign: 'right' }}>
                                                    ₹{student.totalPaid.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: student.totalPending > 0 ? 'error.main' : 'success.main', textAlign: 'right' }}>
                                                    ₹{student.totalPending.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 60, height: 6, bgcolor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                                                            <Box sx={{ width: `${student.paymentPercentage}%`, height: '100%', bgcolor: '#4caf50', transition: 'width 0.3s' }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                            {student.paymentPercentage}%
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={student.paymentStatus} 
                                                        size="small" 
                                                        color={student.paymentStatus === 'Paid' ? 'success' : 'warning'}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Chip 
                                                        label={`${student.paymentCount} payment${student.paymentCount !== 1 ? 's' : ''}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>
                                                    {student.pendingFees && student.pendingFees.length > 0 ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                            {student.pendingFees.map((fee, idx) => (
                                                                <Box key={idx} sx={{ p: 0.5, bgcolor: '#fff3e0', borderRadius: 1 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                                        {fee.feeType}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                                                                        Pending: ₹{fee.pending.toLocaleString()}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Chip label="All Paid" size="small" color="success" />
                                                    )}
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
                            count={filteredStudentPayments.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </>
            )}
        </DashboardLayout>
    );
};

export default AdminReceipts;
