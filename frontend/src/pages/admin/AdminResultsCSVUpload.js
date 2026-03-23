import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';

const AdminResultsCSVUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            setError('Please select a CSV file');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setMessage(null);

        // Parse CSV preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result;
            const lines = csv.split('\n').slice(0, 6); // First 5 rows + header
            const rows = lines.map((line) => line.split(','));
            setPreview(rows);
            setOpenDialog(true);
        };
        reader.readAsText(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await adminAPI.uploadResultsCSV(formData);
            setMessage(res?.data?.message || 'Results uploaded successfully');
            setFile(null);
            setPreview([]);
            setOpenDialog(false);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to upload results');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="admin">
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Upload Results (CSV)</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>CSV Format</Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: 'textSecondary' }}>
                        Your CSV file should have the following columns:
                    </Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            student_id, exam_id, subject_id, marks_obtained
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                        Example:
                    </Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            STU001, exam-123, subject-456, 85<br />
                            STU002, exam-123, subject-456, 92<br />
                            STU003, exam-123, subject-456, 78
                        </Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3, border: '2px dashed #ccc', textAlign: 'center' }}>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="csv-upload"
                    />
                    <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
                        <Box sx={{ py: 3 }}>
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">Click to upload CSV file</Typography>
                            <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                                or drag and drop
                            </Typography>
                            {file && (
                                <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
                                    ✓ {file.name}
                                </Typography>
                            )}
                        </Box>
                    </label>
                </Paper>

                {file && (
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={loading}
                            sx={{ mr: 2 }}
                        >
                            {loading ? 'Uploading...' : 'Upload Results'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setFile(null);
                                setPreview([]);
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </Box>
                )}

                {/* Preview Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>CSV Preview</DialogTitle>
                    <DialogContent>
                        {preview.length > 0 && (
                            <TableContainer sx={{ mt: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            {preview[0]?.map((header, idx) => (
                                                <TableCell key={idx} sx={{ fontWeight: 600 }}>
                                                    {header.trim()}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {preview.slice(1).map((row, idx) => (
                                            <TableRow key={idx}>
                                                {row.map((cell, cellIdx) => (
                                                    <TableCell key={cellIdx}>{cell.trim()}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button onClick={handleUpload} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Confirm Upload'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default AdminResultsCSVUpload;
