import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../config/api';

const AdminResults = () => {
  const getErrorMessage = (e, fallback) => {
    if (!e) return fallback;
    if (typeof e === 'string') return e;
    const msg = typeof e?.message === 'string' ? e.message.trim() : '';
    if (msg) return msg;
    const err = typeof e?.error === 'string' ? e.error.trim() : '';
    if (err) return err;
    if (Array.isArray(e?.errors) && e.errors.length) {
      const joined = e.errors
        .map((x) => (typeof x === 'string' ? x : x?.message))
        .filter(Boolean)
        .join(', ');
      if (joined) return joined;
    }
    try {
      return JSON.stringify(e);
    } catch {
      return fallback;
    }
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [exam, setExam] = useState({ id: '', examName: 'Monthly Result', examDate: '' });

  const [students, setStudents] = useState([]);
  const [marksByStudentId, setMarksByStudentId] = useState({});

  const selectedExam = useMemo(
    () => (exams || []).find((ex) => String(ex?.id) === String(exam.id)) || null,
    [exams, exam.id]
  );

  const classSubjects = useMemo(
    () => (subjects || []).filter((s) => String(s?.sclassId) === String(classId)),
    [subjects, classId]
  );

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [classesRes, subjectsRes] = await Promise.all([adminAPI.getClasses(), adminAPI.getSubjects()]);
      const cls = classesRes?.data ?? [];
      const subs = subjectsRes?.data ?? [];
      setClasses(Array.isArray(cls) ? cls : []);
      setSubjects(Array.isArray(subs) ? subs : []);
      setExams([]);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load classes/subjects'));
      setClasses([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    const run = async () => {
      setError('');
      setSuccess('');
      setStudents([]);
      setMarksByStudentId({});
      setSubjectId('');
      setExam((p) => ({ ...p, id: '' }));
      setExams([]);

      if (!classId) return;

      try {
        const [studentsRes, examsRes] = await Promise.all([
          adminAPI.getStudents({ sclassId: classId, limit: 200 }),
          adminAPI.getExams({ sclassId: classId }),
        ]);
        const items = studentsRes?.data ?? [];
        const ex = examsRes?.data ?? [];
        setStudents(Array.isArray(items) ? items : []);
        setExams(Array.isArray(ex) ? ex : []);
      } catch (e) {
        setError(getErrorMessage(e, 'Failed to load students'));
      }
    };

    run();
  }, [classId]);

  // Prefill existing marks when exam+subject are selected
  useEffect(() => {
    const run = async () => {
      setError('');
      setSuccess('');

      if (!exam.id || !subjectId) return;

      try {
        const res = await adminAPI.getExamMarks(exam.id, { subjectId });
        const results = res?.data ?? [];
        const map = {};
        (Array.isArray(results) ? results : []).forEach((r) => {
          if (r?.studentId) map[r.studentId] = r.marksObtained;
          if (r?.student?.id) map[r.student.id] = r.marksObtained;
        });
        setMarksByStudentId(map);
      } catch (e) {
        // don't block editing if prefill fails
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam.id, subjectId]);

  const onChangeMark = (studentId) => (e) => {
    const value = e.target.value;
    setMarksByStudentId((prev) => ({ ...prev, [studentId]: value }));
  };

  const createMonthlyExam = async () => {
    setError('');
    setSuccess('');

    if (!classId) {
      setError('Select a class.');
      return;
    }

    const payload = {
      sclassId: classId,
      examName: String(exam.examName || '').trim(),
      examType: 'monthly',
      examDate: exam.examDate || undefined,
      isPublished: true,
    };

    if (!payload.examName) {
      setError('Exam name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminAPI.createExam(payload);
      const created = res?.data ?? null;
      if (!created?.id) throw new Error('Exam created but no id returned');
      setExam((p) => ({ ...p, id: created.id }));
      setExams((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      setSuccess(res?.message || 'Monthly exam created');
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to create exam'));
    } finally {
      setSaving(false);
    }
  };

  const importCsv = async (file) => {
    setError('');
    setSuccess('');

    if (!exam.id || !subjectId) {
      setError('Select exam and subject first.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminAPI.importExamMarksCsv(exam.id, subjectId, file);
      setSuccess(res?.message || 'CSV imported');
      const refreshed = await adminAPI.getExamMarks(exam.id, { subjectId });
      const results = refreshed?.data ?? [];
      const map = {};
      (Array.isArray(results) ? results : []).forEach((r) => {
        if (r?.studentId) map[r.studentId] = r.marksObtained;
        if (r?.student?.id) map[r.student.id] = r.marksObtained;
      });
      setMarksByStudentId(map);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to import CSV'));
    } finally {
      setSaving(false);
    }
  };

  const uploadMarks = async () => {
    setError('');
    setSuccess('');

    if (!classId || !subjectId) {
      setError('Select class and subject.');
      return;
    }

    if (!exam.id) {
      setError('Create the monthly exam first.');
      return;
    }

    const marks = students
      .map((s) => ({
        studentId: s?.id,
        marksObtained: marksByStudentId[s?.id],
      }))
      .filter((m) => m.studentId && m.marksObtained !== undefined && m.marksObtained !== null && String(m.marksObtained).trim() !== '');

    if (marks.length === 0) {
      setError('Enter at least one student mark.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminAPI.uploadExamMarks(exam.id, { subjectId, marks });
      setSuccess(res?.message || 'Marks uploaded');
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to upload marks'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Monthly Results</Typography>
          <Button variant="outlined" onClick={loadBase} disabled={loading || saving}>Refresh</Button>
        </Box>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={classId}
                    label="Class"
                    onChange={(e) => setClassId(e.target.value)}
                  >
                    <MenuItem value=""><em>Select</em></MenuItem>
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.sclassName || 'Class'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={!classId}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subjectId}
                    label="Subject"
                    onChange={(e) => setSubjectId(e.target.value)}
                  >
                    <MenuItem value=""><em>Select</em></MenuItem>
                    {classSubjects.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.subName || 'Subject'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={!classId}>
                  <InputLabel>Exam</InputLabel>
                  <Select
                    value={exam.id}
                    label="Exam"
                    onChange={(e) => {
                      const id = e.target.value;
                      setExam((p) => ({ ...p, id }));
                      const ex = (exams || []).find((x) => String(x?.id) === String(id)) || null;
                      if (ex) {
                        setExam((p) => ({
                          ...p,
                          id: ex.id,
                          examName: ex.examName || p.examName,
                          examDate: ex.examDate ? String(ex.examDate).slice(0, 10) : p.examDate,
                        }));
                      }
                    }}
                  >
                    <MenuItem value=""><em>Select</em></MenuItem>
                    {exams.map((ex) => (
                      <MenuItem key={ex.id} value={ex.id}>{ex.examName || 'Exam'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  size="small"
                  label="Exam Name"
                  value={exam.examName}
                  onChange={(e) => setExam((p) => ({ ...p, examName: e.target.value }))}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Exam Date"
                  value={exam.examDate}
                  onChange={(e) => setExam((p) => ({ ...p, examDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  onClick={createMonthlyExam}
                  disabled={saving || !classId}
                >
                  Create Exam
                </Button>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={saving || !exam.id || !subjectId}
                >
                  Import CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) importCsv(file);
                    }}
                  />
                </Button>
                <Typography variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                  {selectedExam ? `Editing: ${selectedExam.examName || 'Exam'}` : ''}
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell width={180}>Marks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow><TableCell colSpan={2}>Select a class to load students.</TableCell></TableRow>
                    ) : students.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>{s.name || s.studentId || s.id}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={marksByStudentId[s.id] ?? ''}
                            onChange={onChangeMark(s.id)}
                            disabled={!subjectId || !exam.id || saving}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={uploadMarks} disabled={saving || !subjectId || !exam.id}>
                  {saving ? 'Uploading…' : 'Upload Marks'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminResults;
