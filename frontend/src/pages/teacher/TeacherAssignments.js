import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';

const TeacherAssignments = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [homework, setHomework] = useState([]);

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        subjectId: '',
        title: '',
        description: '',
        dueDate: '',
    });

    const load = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const [dashRes, hwRes] = await Promise.all([
                teacherAPI.getDashboard(),
                teacherAPI.getHomework(),
            ]);
            const teacherSubjects = dashRes?.data?.data?.teacher?.Subjects ?? [];
            const hw = hwRes?.data?.data?.homework ?? [];

            setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : []);
            setHomework(Array.isArray(hw) ? hw : []);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load assignments');
            setSubjects([]);
            setHomework([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.subjectId || !form.title || !form.dueDate) {
            setError('Subject, title, and due date are required');
            return;
        }
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const res = await teacherAPI.createHomework({
                subjectId: form.subjectId,
                title: form.title,
                description: form.description,
                dueDate: form.dueDate,
            });
            setMessage(res?.data?.message || 'Assignment created');
            setOpen(false);
            setForm({ subjectId: '', title: '', description: '', dueDate: '' });
            await load();
        } catch (e2) {
            setError(e2?.response?.data?.message || e2?.message || 'Failed to create assignment');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const res = await teacherAPI.deleteHomework(id);
            setMessage(res?.data?.message || 'Assignment deleted');
            await load();
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to delete assignment');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Assignments / Homework</Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (subjects.length === 0) {
                                setError('No subjects assigned to your profile. Ask Admin to assign a subject first.');
                                return;
                            }
                            setOpen(true);
                        }}
                        disabled={loading}
                    >
                        Create
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {homework.length === 0 ? (
                                    <TableRow><TableCell colSpan={4}>No assignments found.</TableCell></TableRow>
                                ) : homework.map((h) => (
                                    <TableRow key={h.id} hover>
                                        <TableCell>{h.title}</TableCell>
                                        <TableCell>{h.subject?.subName || '--'}</TableCell>
                                        <TableCell>{h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '--'}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                color="error"
                                                disabled={saving}
                                                onClick={() => handleDelete(h.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <form onSubmit={handleCreate}>
                        <DialogTitle>Create Assignment</DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                                <FormControl fullWidth size="small" required>
                                    <InputLabel>Subject</InputLabel>
                                    <Select
                                        value={form.subjectId}
                                        label="Subject"
                                        onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
                                        disabled={subjects.length === 0}
                                    >
                                        {subjects.length === 0 && (
                                            <MenuItem value="" disabled>No subjects assigned</MenuItem>
                                        )}
                                        {subjects.map((s) => (
                                            <MenuItem key={s.id} value={s.id}>{s?.subName || 'Subject'}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    size="small"
                                    label="Title"
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    required
                                />

                                <TextField
                                    size="small"
                                    label="Description"
                                    value={form.description}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    multiline
                                    minRows={3}
                                />

                                <TextField
                                    size="small"
                                    type="date"
                                    label="Due Date"
                                    value={form.dueDate}
                                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                            <Button type="submit" variant="contained" disabled={saving}>
                                {saving ? 'Creating…' : 'Create'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default TeacherAssignments;
