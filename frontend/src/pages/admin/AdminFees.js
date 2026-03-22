import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, CircularProgress, Tooltip, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
    Select, MenuItem, Alert
} from '@mui/material';
import {
    Search as SearchIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon,
    UploadFile as UploadFileIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchFees, fetchStudents } from '../../redux/slices/adminSlice';
import { adminAPI } from '../../config/api';
import StudentFeesDetailModal from './StudentFeesDetailModal';

const AdminFees = () => {
    const dispatch = useDispatch();
    const { fees, students, loading } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // UI State
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [importing, setImporting] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openStudentFeesDialog, setOpenStudentFeesDialog] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        feeType: '',
        feeCategory: '',
        amount: '',
        dueDate: '',
        frequency: 'yearly',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        dispatch(fetchFees());
        dispatch(fetchStudents());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };

    const filteredFees = fees?.filter((fee) =>
        fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.feeType?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const paginatedFees = filteredFees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const resetMessages = () => {
        setSuccessMessage('');
        setErrorMessage('');
    };

    const openAdd = () => {
        resetMessages();
        setEditingFee(null);
        setFormData({
            studentId: '',
            feeType: '',
            feeCategory: '',
            amount: '',
            dueDate: '',
            frequency: 'yearly',
            description: '',
            isActive: true,
        });
        setOpenDialog(true);
    };

    const openEdit = (fee) => {
        resetMessages();
        setEditingFee(fee);
        const dueDate = fee?.dueDate ? new Date(fee.dueDate) : null;
        const dueDateValue = dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toISOString().slice(0, 10) : '';
        setFormData({
            studentId: fee?.studentId || '',
            feeType: fee?.feeType || '',
            feeCategory: fee?.feeCategory || '',
            amount: fee?.amount ?? '',
            dueDate: dueDateValue,
            frequency: fee?.frequency || 'yearly',
            description: fee?.description || '',
            isActive: fee?.isActive ?? true,
        });
        setOpenDialog(true);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        resetMessages();

        if (!editingFee && !formData.studentId) {
            setErrorMessage('Student is required');
            return;
        }
        if (!formData.feeType?.trim()) {
            setErrorMessage('Fee Type is required');
            return;
        }
        if (formData.amount === '' || Number.isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
            setErrorMessage('Amount must be a non-negative number');
            return;
        }
        if (!formData.dueDate) {
            setErrorMessage('Due Date is required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                studentId: formData.studentId,
                feeType: formData.feeType,
                feeCategory: formData.feeCategory || undefined,
                amount: Number(formData.amount),
                dueDate: formData.dueDate,
                frequency: formData.frequency,
                description: formData.description || undefined,
                isActive: Boolean(formData.isActive),
            };

            if (editingFee?.id) {
                await adminAPI.updateFee(editingFee.id, payload);
                setSuccessMessage('Fee updated successfully');
            } else {
                await adminAPI.createFee(payload);
                setSuccessMessage('Fee created successfully');
            }

            setOpenDialog(false);
            dispatch(fetchFees());
        } catch (error) {
            setErrorMessage(error?.message || 'Failed to save fee');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (fee) => {
        resetMessages();
        if (!fee?.id) return;
        const ok = window.confirm('Delete this fee record?');
        if (!ok) return;

        try {
            await adminAPI.deleteFee(fee.id);
            setSuccessMessage('Fee deleted');
            dispatch(fetchFees());
        } catch (error) {
            setErrorMessage(error?.message || 'Failed to delete fee');
        }
    };

    const handleViewStudentFees = (fee) => {
        setSelectedStudent(fee.student);
        setOpenStudentFeesDialog(true);
    };

    const handleImportCsv = async (file) => {
        resetMessages();
        if (!file) return;

        setImporting(true);
        try {
            const response = await adminAPI.bulkImportFees(file, 'update');
            const result = response?.data;
            const created = result?.created ?? 0;
            const updated = result?.updated ?? 0;
            const skipped = result?.skipped ?? 0;
            const errorCount = Array.isArray(result?.errors) ? result.errors.length : 0;
            setSuccessMessage(`Import complete: created ${created}, updated ${updated}, skipped ${skipped}, errors ${errorCount}`);
            dispatch(fetchFees());
        } catch (error) {
            setErrorMessage(error?.message || 'Failed to import CSV');
        } finally {
            setImporting(false);
        }
    };

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Fees Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        disabled={importing}
                    >
                        Import CSV
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                handleImportCsv(file);
                            }}
                        />
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
                        Add Fee
                    </Button>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchFees())}>
                        Refresh List
                    </Button>
                </Box>
            </Box>

            {errorMessage ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert> : null}

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
                    {(loading || importing) && <CircularProgress size={24} sx={{ ml: 2 }} />}
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
                                            <Tooltip title="View Student Fees">
                                                <IconButton color="primary" size="small" onClick={() => handleViewStudentFees(fee)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Fee">
                                                <IconButton color="primary" size="small" onClick={() => openEdit(fee)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Fee">
                                                <IconButton color="error" size="small" onClick={() => handleDelete(fee)}>
                                                    <DeleteIcon fontSize="small" />
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
                    count={filteredFees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{editingFee ? 'Edit Fee' : 'Add Fee'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                        <FormControl fullWidth size="small" disabled={Boolean(editingFee)}>
                            <InputLabel>Student</InputLabel>
                            <Select
                                label="Student"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleFormChange}
                            >
                                <MenuItem value="">Select Student</MenuItem>
                                {(students || []).map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.studentId ? `${s.studentId} - ` : ''}{s.name}{s.sclass?.sclassName ? ` (${s.sclass.sclassName})` : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Fee Type"
                            name="feeType"
                            value={formData.feeType}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Fee Category (optional)"
                            name="feeCategory"
                            value={formData.feeCategory}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Amount"
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            label="Due Date"
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>Frequency</InputLabel>
                            <Select
                                label="Frequency"
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleFormChange}
                            >
                                <MenuItem value="yearly">Yearly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="one-time">One-time</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                name="isActive"
                                value={formData.isActive}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === true || e.target.value === 'true' }))}
                            >
                                <MenuItem value={true}>Active</MenuItem>
                                <MenuItem value={false}>Inactive</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Description (optional)"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                            sx={{ gridColumn: '1 / -1' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {editingFee ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Student Fees Detail Modal */}
            <StudentFeesDetailModal
                open={openStudentFeesDialog}
                student={selectedStudent}
                onClose={() => setOpenStudentFeesDialog(false)}
                onRefresh={() => dispatch(fetchFees())}
            />
        </DashboardLayout>
    );
};

export default AdminFees;
