import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { bulkImportStudents, fetchStudents, clearAdminStatus } from '../../redux/slices/adminSlice';

const BulkStudentImportDialog = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.admin);

    const [mode, setMode] = useState('skip');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (open) {
            dispatch(clearAdminStatus());
        }
    }, [open, dispatch]);

    const canSubmit = useMemo(() => {
        return Boolean(file) && !loading;
    }, [file, loading]);

    const handleClose = () => {
        dispatch(clearAdminStatus());
        setFile(null);
        setResult(null);
        setMode('skip');
        onClose?.();
    };

    const handleSubmit = async () => {
        if (!file) return;
        const action = await dispatch(bulkImportStudents({ file, mode }));
        if (!action.error) {
            setResult(action.payload);
            dispatch(fetchStudents());
        }
    };

    const summary = result?.data;
    const hasErrors = Boolean(summary && summary.errorCount > 0);
    const didWork = Boolean(summary && (summary.created > 0 || summary.updated > 0 || summary.skipped > 0));
    const createdStudents = summary?.createdStudents || [];

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Bulk Import Students (CSV)</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Mode</InputLabel>
                        <Select value={mode} label="Mode" onChange={(e) => setMode(e.target.value)}>
                            <MenuItem value="skip">Skip if Student ID exists</MenuItem>
                            <MenuItem value="update">Update if Student ID exists</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" component="label">
                        Choose CSV File
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            hidden
                            onChange={(e) => {
                                const selected = e.target.files?.[0] || null;
                                setFile(selected);
                                setResult(null);
                            }}
                        />
                    </Button>
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline-block' }}>
                        {file ? file.name : 'No file selected'}
                    </Typography>
                </Box>

                {summary && (
                    <Box sx={{ mt: 1 }}>
                        <Alert severity={hasErrors ? 'warning' : 'success'} sx={{ mb: 2 }}>
                            {hasErrors ? 'Import completed with errors' : 'Import completed successfully'}
                        </Alert>
                        <Typography variant="body2"><strong>Rows:</strong> {summary.totalRows}</Typography>
                        <Typography variant="body2"><strong>Created:</strong> {summary.created} | <strong>Updated:</strong> {summary.updated} | <strong>Skipped:</strong> {summary.skipped}</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}><strong>Errors:</strong> {summary.errorCount}</Typography>
                        
                        {summary.note && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                {summary.note}
                            </Alert>
                        )}

                        {!didWork && hasErrors && (
                            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                                No students were imported. Fix the CSV errors and try again.
                            </Typography>
                        )}

                        {/* Display created students with login credentials */}
                        {createdStudents.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    📋 Login Credentials for Created Students
                                </Typography>
                                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                    <Table size="small">
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell><strong>Student ID</strong></TableCell>
                                                <TableCell><strong>Name</strong></TableCell>
                                                <TableCell><strong>Email</strong></TableCell>
                                                <TableCell><strong>Password</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {createdStudents.map((student, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{student.studentId}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{student.email}</TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{student.password}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {/* Display errors */}
                        {Array.isArray(summary.errors) && summary.errors.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    ⚠️ Errors ({summary.errors.length})
                                </Typography>
                                <Box sx={{ maxHeight: 180, overflow: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                                    {summary.errors.slice(0, 10).map((errItem, idx) => (
                                        <Typography key={idx} variant="caption" display="block" color="text.secondary">
                                            Row {errItem.row}: {errItem.message}
                                        </Typography>
                                    ))}
                                    {summary.errors.length > 10 && (
                                        <Typography variant="caption" color="text.secondary">
                                            Showing first 10 errors.
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">Close</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit}>
                    {loading ? 'Importing...' : 'Start Import'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BulkStudentImportDialog;
