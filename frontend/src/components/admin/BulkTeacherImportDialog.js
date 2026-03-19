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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { bulkImportTeachers, fetchTeachers, clearAdminStatus } from '../../redux/slices/adminSlice';

const BulkTeacherImportDialog = ({ open, onClose }) => {
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
        const action = await dispatch(bulkImportTeachers({ file, mode }));
        if (!action.error) {
            setResult(action.payload);
            dispatch(fetchTeachers());
        }
    };

    const summary = result?.data;
    const hasErrors = Boolean(summary && summary.errorCount > 0);
    const didWork = Boolean(summary && (summary.created > 0 || summary.updated > 0 || summary.skipped > 0));

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Bulk Import Teachers (CSV)</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Mode</InputLabel>
                        <Select value={mode} label="Mode" onChange={(e) => setMode(e.target.value)}>
                            <MenuItem value="skip">Skip if Email exists</MenuItem>
                            <MenuItem value="update">Update if Email exists</MenuItem>
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
                            {hasErrors ? 'Import completed with errors' : 'Import completed'}
                        </Alert>
                        <Typography variant="body2">Rows: {summary.totalRows}</Typography>
                        <Typography variant="body2">Created: {summary.created} | Updated: {summary.updated} | Skipped: {summary.skipped}</Typography>
                        {typeof summary.defaultPasswordUsed === 'number' && summary.defaultPasswordUsed > 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Default password used for {summary.defaultPasswordUsed} new teachers.
                            </Typography>
                        )}
                        <Typography variant="body2" sx={{ mb: 1 }}>Errors: {summary.errorCount}</Typography>
                        {!didWork && hasErrors && (
                            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                                No teachers were imported. Fix the CSV errors and try again.
                            </Typography>
                        )}
                        {Array.isArray(summary.errors) && summary.errors.length > 0 && (
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

export default BulkTeacherImportDialog;
