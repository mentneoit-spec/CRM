import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, CircularProgress, Tooltip, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
    Delete as DeleteIcon, Refresh as RefreshIcon, MenuBook as SubjectIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchSubjects, createSubject, fetchClasses, fetchTeachers } from '../../redux/slices/adminSlice';
import { adminAPI } from '../../config/api';
import BulkSubjectImportDialog from '../../components/admin/BulkSubjectImportDialog';

const AdminSubjects = () => {
    const dispatch = useDispatch();
    const { subjects, classes, teachers, loading } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [newSubject, setNewSubject] = useState({
        subName: '', subCode: '', sessions: '10', sclassId: '', teacherId: '', maxMarks: 100, passingMarks: 40
    });

    const [editSubject, setEditSubject] = useState({
        subName: '',
        subCode: '',
        sessions: '10',
        sclassId: '',
        teacherId: '',
        maxMarks: 100,
        passingMarks: 40,
        description: '',
    });

    useEffect(() => {
        dispatch(fetchSubjects());
        dispatch(fetchClasses());
        dispatch(fetchTeachers());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        dispatch(createSubject(newSubject)).then((res) => {
            if (!res.error) {
                setOpenAddDialog(false);
                setNewSubject({ subName: '', subCode: '', sessions: '10', sclassId: '', teacherId: '', maxMarks: 100, passingMarks: 40 });
                dispatch(fetchSubjects()); // Refresh to get the associated class data
            }
        });
    };

    const openEdit = (subject) => {
        setEditingSubject(subject);
        setEditSubject({
            subName: subject?.subName || '',
            subCode: subject?.subCode || '',
            sessions: String(subject?.sessions ?? '10'),
            sclassId: subject?.sclassId || '',
            teacherId: subject?.teacherId || '',
            maxMarks: Number(subject?.maxMarks ?? 100),
            passingMarks: Number(subject?.passingMarks ?? 40),
            description: subject?.description || '',
        });
        setOpenEditDialog(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingSubject?.id) return;
        setEditSaving(true);
        try {
            await adminAPI.updateSubject(editingSubject.id, {
                subName: editSubject.subName,
                subCode: editSubject.subCode,
                description: editSubject.description,
                sclassId: editSubject.sclassId,
                sessions: String(editSubject.sessions || ''),
                maxMarks: Number(editSubject.maxMarks),
                passingMarks: Number(editSubject.passingMarks),
                teacherId: editSubject.teacherId || null,
            });
            setOpenEditDialog(false);
            setEditingSubject(null);
            dispatch(fetchSubjects());
        } catch {
            // errors are already handled globally by api interceptor
        } finally {
            setEditSaving(false);
        }
    };

    const handleDeleteSubject = async (subject) => {
        const ok = window.confirm(`Delete subject "${subject?.subName || ''}"? This cannot be undone.`);
        if (!ok) return;

        try {
            await adminAPI.deleteSubject(subject.id);
            dispatch(fetchSubjects());
        } catch {
            // errors are already handled globally by api interceptor
        }
    };

    const filteredSubjects = subjects?.filter((sub) =>
        sub.subName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.sclass?.sclassName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const paginatedSubjects = filteredSubjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Academic Subjects
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchSubjects())} sx={{ mr: 2 }}>
                        Refresh
                    </Button>
                    <Button variant="outlined" onClick={() => setOpenImportDialog(true)} sx={{ mr: 2 }}>
                        Import CSV
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
                        Add Subject
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search subjects by name, code, or class..."
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
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Subject Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Class / Section</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Sessions</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Marks (Pass/Max)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedSubjects.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No subjects found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedSubjects.map((sub) => (
                                    <TableRow hover key={sub.id}>
                                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <SubjectIcon sx={{ mr: 1, color: 'primary.light' }} />
                                                {sub.subName}
                                            </Box>
                                        </TableCell>
                                        <TableCell><Chip label={sub.subCode} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{sub.sclass?.sclassName || 'N/A'}</TableCell>
                                        <TableCell>{sub.sessions}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{sub.passingMarks} / {sub.maxMarks}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Subject">
                                                <IconButton color="primary" size="small" onClick={() => openEdit(sub)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Subject">
                                                <IconButton color="error" size="small" onClick={() => handleDeleteSubject(sub)}>
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
                    count={filteredSubjects.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add Subject Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleAddSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Subject</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <TextField label="Subject Name (e.g., Mathematics, Physics)" fullWidth required value={newSubject.subName} onChange={(e) => setNewSubject({ ...newSubject, subName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Subject Code" fullWidth required value={newSubject.subCode} onChange={(e) => setNewSubject({ ...newSubject, subCode: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Associated Class</InputLabel>
                                    <Select
                                        value={newSubject.sclassId}
                                        onChange={(e) => setNewSubject({ ...newSubject, sclassId: e.target.value })}
                                        label="Associated Class"
                                    >
                                        {classes?.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>{cls.sclassName} ({cls.academicYear})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Assign Teacher (optional)</InputLabel>
                                    <Select
                                        value={newSubject.teacherId}
                                        onChange={(e) => setNewSubject({ ...newSubject, teacherId: e.target.value })}
                                        label="Assign Teacher (optional)"
                                    >
                                        <MenuItem value=""><em>Unassigned</em></MenuItem>
                                        {teachers?.map((t) => (
                                            <MenuItem key={t.id} value={t.id}>{t.name} ({t.email})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Total Sessions" type="number" fullWidth value={newSubject.sessions} onChange={(e) => setNewSubject({ ...newSubject, sessions: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Max Marks" type="number" fullWidth value={newSubject.maxMarks} onChange={(e) => setNewSubject({ ...newSubject, maxMarks: Number(e.target.value) })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Passing Marks" type="number" fullWidth value={newSubject.passingMarks} onChange={(e) => setNewSubject({ ...newSubject, passingMarks: Number(e.target.value) })} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Saving...' : 'Create Subject'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Subject Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleEditSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Subject</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="Subject Name"
                                    fullWidth
                                    required
                                    value={editSubject.subName}
                                    onChange={(e) => setEditSubject({ ...editSubject, subName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Subject Code"
                                    fullWidth
                                    required
                                    value={editSubject.subCode}
                                    onChange={(e) => setEditSubject({ ...editSubject, subCode: e.target.value })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Associated Class</InputLabel>
                                    <Select
                                        value={editSubject.sclassId}
                                        onChange={(e) => setEditSubject({ ...editSubject, sclassId: e.target.value })}
                                        label="Associated Class"
                                    >
                                        {classes?.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>{cls.sclassName} ({cls.academicYear})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Assign Teacher</InputLabel>
                                    <Select
                                        value={editSubject.teacherId}
                                        onChange={(e) => setEditSubject({ ...editSubject, teacherId: e.target.value })}
                                        label="Assign Teacher"
                                    >
                                        <MenuItem value=""><em>Unassigned</em></MenuItem>
                                        {teachers?.map((t) => (
                                            <MenuItem key={t.id} value={t.id}>{t.name} ({t.email})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    fullWidth
                                    value={editSubject.description}
                                    onChange={(e) => setEditSubject({ ...editSubject, description: e.target.value })}
                                    multiline
                                    minRows={2}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Total Sessions"
                                    type="number"
                                    fullWidth
                                    value={editSubject.sessions}
                                    onChange={(e) => setEditSubject({ ...editSubject, sessions: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Max Marks"
                                    type="number"
                                    fullWidth
                                    value={editSubject.maxMarks}
                                    onChange={(e) => setEditSubject({ ...editSubject, maxMarks: Number(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Passing Marks"
                                    type="number"
                                    fullWidth
                                    value={editSubject.passingMarks}
                                    onChange={(e) => setEditSubject({ ...editSubject, passingMarks: Number(e.target.value) })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenEditDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={editSaving}>
                            {editSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <BulkSubjectImportDialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} />
        </DashboardLayout>
    );
};

export default AdminSubjects;
