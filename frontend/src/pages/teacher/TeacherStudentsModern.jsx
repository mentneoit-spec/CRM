import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';

const TeacherStudentsModern = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialClassId = query.get('classId') || '';

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState(initialClassId);
  const [students, setStudents] = useState([]);

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);

  const [addForm, setAddForm] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [importMode, setImportMode] = useState('skip');
  const [importFile, setImportFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadStudentsForClass = async (nextClassId) => {
      if (!nextClassId) {
        setStudents([]);
        return;
      }

      const studentsRes = await teacherAPI.getStudents(nextClassId);
      const studentsData = studentsRes?.data?.data ?? [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    };

    const load = async () => {
      setLoading(true);
      try {
        const classesRes = await teacherAPI.getClasses();
        const classesData = classesRes?.data?.data ?? [];
        const safeClasses = Array.isArray(classesData) ? classesData : [];

        if (!mounted) return;
        setClasses(safeClasses);

        const nextClassId = classId || safeClasses?.[0]?.id || '';
        setClassId(nextClassId);

        await loadStudentsForClass(nextClassId);
      } catch (e) {
        if (!mounted) return;
        setClasses([]);
        setStudents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeClass = async (nextId) => {
    setClassId(nextId);
    navigate(`/teacher/students?classId=${encodeURIComponent(nextId)}`);
    setLoading(true);
    try {
      const studentsRes = await teacherAPI.getStudents(nextId);
      const studentsData = studentsRes?.data?.data ?? [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (e) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const currentClass = useMemo(() => classes.find((c) => c.id === classId) || null, [classes, classId]);

  const openAdd = () => {
    setActionError('');
    setActionSuccess('');
    setAddForm({ studentId: '', name: '', email: '', phone: '', password: '' });
    setAddOpen(true);
  };

  const openImport = () => {
    setActionError('');
    setActionSuccess('');
    setImportSummary(null);
    setImportMode('skip');
    setImportFile(null);
    setImportOpen(true);
  };

  const reloadStudents = async () => {
    if (!classId) return;
    try {
      const studentsRes = await teacherAPI.getStudents(classId);
      const studentsData = studentsRes?.data?.data ?? [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch {
      // ignore
    }
  };

  const submitAdd = async () => {
    setActionError('');
    setActionSuccess('');

    if (!classId) {
      setActionError('Select a class first.');
      return;
    }

    const payload = {
      sclassId: classId,
      studentId: addForm.studentId.trim(),
      name: addForm.name.trim(),
      email: addForm.email.trim() || undefined,
      phone: addForm.phone.trim() || undefined,
      password: addForm.password.trim() || undefined,
    };

    if (!payload.studentId || !payload.name) {
      setActionError('Student ID and Name are required.');
      return;
    }

    setAdding(true);
    try {
      const res = await teacherAPI.createStudent(payload);
      setActionSuccess(res?.data?.message || 'Student created.');
      setAddOpen(false);
      await reloadStudents();
    } catch (e) {
      setActionError(e?.response?.data?.message || 'Failed to create student');
    } finally {
      setAdding(false);
    }
  };

  const submitImport = async () => {
    setActionError('');
    setActionSuccess('');
    setImportSummary(null);

    if (!importFile) {
      setActionError('Please choose a CSV file.');
      return;
    }

    setImporting(true);
    try {
      const res = await teacherAPI.bulkImportStudents(importFile, importMode);
      const summary = res?.data?.data || null;
      setImportSummary(summary);
      setActionSuccess(res?.data?.message || 'Import completed.');
      await reloadStudents();
    } catch (e) {
      setActionError(e?.response?.data?.message || 'Failed to import students');
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Students</Typography>

        {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}
        {actionSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert> : null}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 240 }} disabled={loading || classes.length === 0}>
            <InputLabel>Class</InputLabel>
            <Select value={classId} label="Class" onChange={(e) => onChangeClass(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c?.sclassName || 'Class'}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" disabled={!classId || loading} onClick={openAdd}>
            Add Student
          </Button>
          <Button variant="outlined" disabled={!classId || loading} onClick={openImport}>
            Import CSV
          </Button>
          {loading && <CircularProgress size={22} />}
        </Box>

        {(!classId && !loading) ? (
          <Typography color="text.secondary">No class selected.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Roll</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell align="right">Attendance Records</TableCell>
                  <TableCell align="right">Exam Results</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>No students found.</TableCell>
                  </TableRow>
                ) : students.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.rollNum ?? '--'}</TableCell>
                    <TableCell>{s.name || '--'}</TableCell>
                    <TableCell>{s.section?.sectionName || '--'}</TableCell>
                    <TableCell align="right">{s?._count?.Attendances ?? 0}</TableCell>
                    <TableCell align="right">{s?._count?.ExamResults ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Student{currentClass?.sclassName ? ` • ${currentClass.sclassName}` : ''}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="Student ID"
            value={addForm.studentId}
            onChange={(e) => setAddForm((p) => ({ ...p, studentId: e.target.value }))}
            disabled={adding}
            fullWidth
          />
          <TextField
            label="Full Name"
            value={addForm.name}
            onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
            disabled={adding}
            fullWidth
          />
          <TextField
            label="Email (optional)"
            value={addForm.email}
            onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
            disabled={adding}
            fullWidth
          />
          <TextField
            label="Phone (optional)"
            value={addForm.phone}
            onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
            disabled={adding}
            fullWidth
          />
          <TextField
            label="Password (optional)"
            type="password"
            value={addForm.password}
            onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
            disabled={adding}
            fullWidth
            helperText="If empty, a default password is used"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={adding}>Cancel</Button>
          <Button variant="contained" onClick={submitAdd} disabled={adding}>
            {adding ? 'Adding…' : 'Add Student'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Students CSV{currentClass?.sclassName ? ` • ${currentClass.sclassName}` : ''}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
          <FormControl size="small" fullWidth disabled={importing}>
            <InputLabel>Mode</InputLabel>
            <Select value={importMode} label="Mode" onChange={(e) => setImportMode(e.target.value)}>
              <MenuItem value="skip">Skip existing</MenuItem>
              <MenuItem value="update">Update existing</MenuItem>
            </Select>
          </FormControl>

          <Button component="label" variant="outlined" disabled={importing}>
            {importFile ? `Selected: ${importFile.name}` : 'Choose CSV File'}
            <input
              hidden
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setImportFile(f);
                try { e.target.value = ''; } catch { /* ignore */ }
              }}
            />
          </Button>

          {importSummary ? (
            <Alert severity="info">
              Total: {importSummary.totalRows ?? 0} • Created: {importSummary.created ?? 0} • Updated: {importSummary.updated ?? 0} • Skipped: {importSummary.skipped ?? 0} • Errors: {importSummary.errorCount ?? 0}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)} disabled={importing}>Close</Button>
          <Button variant="contained" onClick={submitImport} disabled={importing || !importFile}>
            {importing ? 'Importing…' : 'Start Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default TeacherStudentsModern;
