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
import { teacherAPI, uploadAPI } from '../../services/api';

const TeacherAssignments = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [homework, setHomework] = useState([]);

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        subjectId: '',
        sectionId: '',
        title: '',
        description: '',
        dueDate: '',
        attachments: [],
    });

    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editForm, setEditForm] = useState({
        subjectId: '',
        sectionId: '',
        title: '',
        description: '',
        dueDate: '',
        attachments: [],
    });

    const isImageUrl = (url) => {
        const s = String(url || '').toLowerCase();
        return s.endsWith('.png') || s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.gif') || s.endsWith('.webp');
    };

    const getSectionsForSubject = (subjectId) => {
        const subject = subjects.find((s) => String(s?.id) === String(subjectId));
        if (!subject?.sclassId) return [];
        const sclass = classes.find((c) => String(c?.id) === String(subject.sclassId));
        return Array.isArray(sclass?.Sections) ? sclass.Sections : [];
    };

    const extractUploadedUrls = (res) => {
        const uploaded = res?.data?.data?.uploaded;
        if (Array.isArray(uploaded)) {
            return uploaded.map((x) => x?.url).filter(Boolean);
        }

        const uploadedFromS3 = res?.data?.data?.uploaded?.uploaded;
        if (Array.isArray(uploadedFromS3)) {
            return uploadedFromS3.map((x) => x?.url).filter(Boolean);
        }

        const nestedUploaded = res?.data?.data?.uploaded;
        if (nestedUploaded && Array.isArray(nestedUploaded?.uploaded)) {
            return nestedUploaded.uploaded.map((x) => x?.url).filter(Boolean);
        }

        const s3ResultUploaded = res?.data?.data?.uploaded ?? res?.data?.data?.uploaded;
        if (s3ResultUploaded && Array.isArray(s3ResultUploaded?.uploaded)) {
            return s3ResultUploaded.uploaded.map((x) => x?.url).filter(Boolean);
        }

        const maybeResult = res?.data?.data;
        if (maybeResult && Array.isArray(maybeResult?.uploaded)) {
            return maybeResult.uploaded.map((x) => x?.url).filter(Boolean);
        }

        return [];
    };

    const handleUploadPictures = async (files, mode) => {
        const list = Array.from(files || []).filter(Boolean);
        if (list.length === 0) return;

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const res = await uploadAPI.uploadDocuments(list, 'homework');
            const urls = extractUploadedUrls(res);
            if (urls.length === 0) {
                throw new Error('Upload succeeded but no file URLs returned');
            }

            if (mode === 'edit') {
                setEditForm((p) => ({ ...p, attachments: [...(p.attachments || []), ...urls] }));
            } else {
                setForm((p) => ({ ...p, attachments: [...(p.attachments || []), ...urls] }));
            }

            setMessage('Attachments uploaded');
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to upload attachments');
        } finally {
            setSaving(false);
        }
    };

    const load = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const [dashRes, hwRes, classesRes] = await Promise.all([
                teacherAPI.getDashboard(),
                teacherAPI.getHomework(),
                teacherAPI.getClasses(),
            ]);
            const teacherSubjects = dashRes?.data?.data?.teacher?.Subjects ?? [];
            const hw = hwRes?.data?.data?.homework ?? [];
            const cls = classesRes?.data?.data ?? classesRes?.data?.data?.classes ?? [];

            setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : []);
            setHomework(Array.isArray(hw) ? hw : []);
            setClasses(Array.isArray(cls) ? cls : []);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load assignments');
            setSubjects([]);
            setHomework([]);
            setClasses([]);
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
                sectionId: form.sectionId ? form.sectionId : undefined,
                title: form.title,
                description: form.description,
                dueDate: form.dueDate,
                attachments: Array.isArray(form.attachments) ? form.attachments : [],
            });
            setMessage(res?.data?.message || 'Assignment created');
            setOpen(false);
            setForm({ subjectId: '', sectionId: '', title: '', description: '', dueDate: '', attachments: [] });
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

    const openViewDialog = (hw) => {
        setSelected(hw);
        setOpenView(true);
    };

    const openEditDialog = (hw) => {
        setSelected(hw);
        setEditForm({
            subjectId: hw?.subjectId || hw?.subject?.id || '',
            sectionId: hw?.sectionId || hw?.section?.id || '',
            title: hw?.title || '',
            description: hw?.description || '',
            dueDate: hw?.dueDate ? new Date(hw.dueDate).toISOString().slice(0, 10) : '',
            attachments: Array.isArray(hw?.attachments) ? hw.attachments : [],
        });
        setOpenEdit(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selected?.id) return;
        if (!editForm.subjectId || !editForm.title || !editForm.dueDate) {
            setError('Subject, title, and due date are required');
            return;
        }
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const res = await teacherAPI.updateHomework(selected.id, {
                subjectId: editForm.subjectId,
                sectionId: editForm.sectionId ? editForm.sectionId : null,
                title: editForm.title,
                description: editForm.description,
                dueDate: editForm.dueDate,
                attachments: Array.isArray(editForm.attachments) ? editForm.attachments : [],
            });
            setMessage(res?.data?.message || 'Assignment updated');
            setOpenEdit(false);
            setSelected(null);
            await load();
        } catch (e2) {
            setError(e2?.response?.data?.message || e2?.message || 'Failed to update assignment');
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
                                    <TableCell>Section</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {homework.length === 0 ? (
                                    <TableRow><TableCell colSpan={5}>No assignments found.</TableCell></TableRow>
                                ) : homework.map((h) => (
                                    <TableRow key={h.id} hover>
                                        <TableCell>{h.title}</TableCell>
                                        <TableCell>{h.subject?.subName || '--'}</TableCell>
                                        <TableCell>{h.section?.sectionName || 'All'}</TableCell>
                                        <TableCell>{h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '--'}</TableCell>
                                        <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => openViewDialog(h)}
                                                    disabled={saving}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                    onClick={() => {
                                                        if (subjects.length === 0) {
                                                            setError('No subjects assigned to your profile. Ask Admin to assign a subject first.');
                                                            return;
                                                        }
                                                        openEditDialog(h);
                                                    }}
                                                    disabled={saving}
                                                >
                                                    Edit
                                                </Button>
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

                    {/* View Dialog */}
                    <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Assignment Details</DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                                <Typography>{selected?.title || '--'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Subject</Typography>
                                <Typography>{selected?.subject?.subName || '--'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Section</Typography>
                                <Typography>{selected?.section?.sectionName || 'All'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Due Date</Typography>
                                <Typography>
                                    {selected?.dueDate ? new Date(selected.dueDate).toLocaleDateString() : '--'}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Description</Typography>
                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selected?.description || '--'}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Attachments</Typography>
                                {Array.isArray(selected?.attachments) && selected.attachments.length > 0 ? (
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        {selected.attachments.map((url) => (
                                            <Box key={url}>
                                                {isImageUrl(url) ? (
                                                    <Box sx={{ borderRadius: 1, overflow: 'hidden', width: 220 }}>
                                                        <img
                                                            src={url}
                                                            alt="attachment"
                                                            style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <a href={url} target="_blank" rel="noreferrer">{url}</a>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography>No attachments</Typography>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenView(false)} variant="contained">Close</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Edit Dialog */}
                    <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                        <form onSubmit={handleUpdate} noValidate>
                            <DialogTitle>Edit Assignment</DialogTitle>
                            <DialogContent dividers>
                                {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
                                {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> : null}
                                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Subject *</InputLabel>
                                        <Select
                                            value={editForm.subjectId}
                                            label="Subject *"
                                            onChange={(e) => setEditForm((p) => ({ ...p, subjectId: e.target.value, sectionId: '' }))}
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

                                    <FormControl fullWidth size="small">
                                        <InputLabel>Section</InputLabel>
                                        <Select
                                            value={editForm.sectionId}
                                            label="Section"
                                            onChange={(e) => setEditForm((p) => ({ ...p, sectionId: e.target.value }))}
                                            disabled={!editForm.subjectId}
                                        >
                                            <MenuItem value="">All sections</MenuItem>
                                            {getSectionsForSubject(editForm.subjectId).map((sec) => (
                                                <MenuItem key={sec.id} value={sec.id}>{sec.sectionName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        size="small"
                                        label="Title"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                    />

                                    <TextField
                                        size="small"
                                        label="Description"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                                        multiline
                                        minRows={3}
                                    />

                                    <TextField
                                        size="small"
                                        type="date"
                                        label="Due Date *"
                                        value={editForm.dueDate}
                                        onChange={(e) => setEditForm((p) => ({ ...p, dueDate: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                    />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            disabled={saving}
                                        >
                                            Upload attachments
                                            <input
                                                hidden
                                                type="file"
                                                accept="image/*,application/pdf"
                                                multiple
                                                onChange={(e) => {
                                                    const files = e.target.files;
                                                    e.target.value = '';
                                                    handleUploadPictures(files, 'edit');
                                                }}
                                            />
                                        </Button>
                                        <Typography variant="body2" color="text.secondary">
                                            {Array.isArray(editForm.attachments) && editForm.attachments.length > 0
                                                ? `${editForm.attachments.length} attachment(s) added`
                                                : 'No attachments'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            After upload, click Save.
                                        </Typography>
                                    </Box>
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenEdit(false)} color="inherit">Cancel</Button>
                                <Button type="submit" variant="contained" disabled={saving}>
                                    {saving ? 'Saving…' : 'Save'}
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <form onSubmit={handleCreate} noValidate>
                        <DialogTitle>Create Assignment</DialogTitle>
                        <DialogContent dividers>
                            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
                            {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> : null}
                            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Subject *</InputLabel>
                                    <Select
                                        value={form.subjectId}
                                        label="Subject *"
                                        onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value, sectionId: '' }))}
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

                                <FormControl fullWidth size="small">
                                    <InputLabel>Section</InputLabel>
                                    <Select
                                        value={form.sectionId}
                                        label="Section"
                                        onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}
                                        disabled={!form.subjectId}
                                    >
                                        <MenuItem value="">All sections</MenuItem>
                                        {getSectionsForSubject(form.subjectId).map((sec) => (
                                            <MenuItem key={sec.id} value={sec.id}>{sec.sectionName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    size="small"
                                    label="Title"
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
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
                                    label="Due Date *"
                                    value={form.dueDate}
                                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={saving}
                                    >
                                        Upload attachments
                                        <input
                                            hidden
                                            type="file"
                                            accept="image/*,application/pdf"
                                            multiple
                                            onChange={(e) => {
                                                const files = e.target.files;
                                                e.target.value = '';
                                                handleUploadPictures(files, 'create');
                                            }}
                                        />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary">
                                        {Array.isArray(form.attachments) && form.attachments.length > 0
                                            ? `${form.attachments.length} attachment(s) added`
                                            : 'No attachments'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        After upload, click Create.
                                    </Typography>
                                </Box>
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
