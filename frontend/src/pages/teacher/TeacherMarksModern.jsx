import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { teacherAPI } from '../../services/api';

const TeacherMarksModern = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  const [subjectId, setSubjectId] = useState('');
  const [examId, setExamId] = useState('');

  const [marksByStudentId, setMarksByStudentId] = useState({});

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    examName: 'Weekly Assignment',
    examDate: '',
  });

  const subject = useMemo(
    () => subjects.find((s) => String(s?.id) === String(subjectId)) || null,
    [subjects, subjectId]
  );

  const load = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [dashRes, examsRes] = await Promise.all([teacherAPI.getDashboard(), teacherAPI.getExams()]);
      const subj = dashRes?.data?.data?.teacher?.Subjects ?? [];
      const ex = examsRes?.data?.data ?? [];
      setSubjects(Array.isArray(subj) ? subj : []);
      setExams(Array.isArray(ex) ? ex : []);

      setStudents([]);
      setMarksByStudentId({});
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load marks setup');
      setSubjects([]);
      setExams([]);
      setStudents([]);
      setMarksByStudentId({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load students when subject changes (we infer class from subject.sclassId)
  useEffect(() => {
    const run = async () => {
      setError('');
      setSuccess('');
      setStudents([]);
      setMarksByStudentId({});

      if (!subject?.sclassId) return;

      try {
        const res = await teacherAPI.getStudents(subject.sclassId);
        const list = res?.data?.data ?? res?.data ?? [];
        const normalized = Array.isArray(list) ? list : [];
        setStudents(normalized);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load students for class');
      }
    };

    run();
  }, [subject?.sclassId]);

  // Prefill existing marks when exam changes
  useEffect(() => {
    const run = async () => {
      if (!examId || !subjectId) return;
      try {
        const res = await teacherAPI.getMarks({ examId, subjectId });
        const results = res?.data?.data?.results ?? [];
        const map = {};
        (Array.isArray(results) ? results : []).forEach((r) => {
          if (r?.studentId) map[r.studentId] = r.marksObtained;
          if (r?.student?.id) map[r.student.id] = r.marksObtained;
        });
        setMarksByStudentId(map);
      } catch {
        // ignore prefill errors
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, subjectId]);

  const onChangeMark = (studentId) => (e) => {
    const value = e.target.value;
    setMarksByStudentId((prev) => ({ ...prev, [studentId]: value }));
  };

  const createExam = async () => {
    setError('');
    setSuccess('');

    if (!subjectId) {
      setError('Select a subject first.');
      return;
    }

    const payload = {
      subjectId,
      examName: String(createForm.examName || '').trim(),
      examDate: createForm.examDate || undefined,
    };

    if (!payload.examName) {
      setError('Exam name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await teacherAPI.createExam(payload);
      const created = res?.data?.data ?? null;
      if (!created?.id) throw new Error('Exam created but no id returned');

      setExams((prev) => [created, ...prev]);
      setExamId(created.id);
      setCreateOpen(false);
      setCreateForm({ examName: 'Weekly Assignment', examDate: '' });
      setSuccess(res?.data?.message || 'Exam created');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create exam');
    } finally {
      setSaving(false);
    }
  };

  const submitMarks = async () => {
    setError('');
    setSuccess('');

    if (!subjectId || !examId) {
      setError('Select subject and exam.');
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
      const res = await teacherAPI.addMarks({ examId, subjectId, marks });
      setSuccess(res?.data?.message || 'Marks saved');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const importCsv = async (file) => {
    setError('');
    setSuccess('');

    if (!examId || !subjectId) {
      setError('Select subject and exam first.');
      return;
    }

    setSaving(true);
    try {
      const res = await teacherAPI.importExamMarksCsv(examId, subjectId, file);
      setSuccess(res?.data?.message || 'CSV imported');
      const refreshed = await teacherAPI.getMarks({ examId, subjectId });
      const results = refreshed?.data?.data?.results ?? [];
      const map = {};
      (Array.isArray(results) ? results : []).forEach((r) => {
        if (r?.studentId) map[r.studentId] = r.marksObtained;
        if (r?.student?.id) map[r.student.id] = r.marksObtained;
      });
      setMarksByStudentId(map);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to import CSV');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Student Marks</Typography>
          <Button variant="outlined" onClick={load} disabled={loading || saving}>Refresh</Button>
        </Box>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 2, alignItems: 'center', mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subjectId}
                    label="Subject"
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setExamId('');
                    }}
                  >
                    <MenuItem value=""><em>Select</em></MenuItem>
                    {subjects.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.subName || 'Subject'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={!subjectId}>
                  <InputLabel>Exam</InputLabel>
                  <Select
                    value={examId}
                    label="Exam"
                    onChange={(e) => setExamId(e.target.value)}
                  >
                    <MenuItem value=""><em>Select</em></MenuItem>
                    {exams
                      .filter((ex) => !subject?.sclassId || ex?.sclassId === subject.sclassId)
                      .map((ex) => (
                        <MenuItem key={ex.id} value={ex.id}>{ex.examName || 'Exam'}</MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  disabled={!subjectId || saving}
                  onClick={() => setCreateOpen(true)}
                >
                  Create Weekly Exam
                </Button>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={saving || !examId || !subjectId}
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
                      <TableRow><TableCell colSpan={2}>Select a subject to load students.</TableCell></TableRow>
                    ) : students.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>{s.name || s.studentId || s.id}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={marksByStudentId[s.id] ?? ''}
                            onChange={onChangeMark(s.id)}
                            disabled={!examId || saving}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={submitMarks} disabled={saving || !subjectId || !examId}>
                  {saving ? 'Saving…' : 'Save Marks'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Weekly Exam</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <TextField
                size="small"
                label="Exam Name"
                value={createForm.examName}
                onChange={(e) => setCreateForm((p) => ({ ...p, examName: e.target.value }))}
                required
              />
              <TextField
                size="small"
                type="date"
                label="Exam Date"
                value={createForm.examDate}
                onChange={(e) => setCreateForm((p) => ({ ...p, examDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <Typography variant="body2" color="text.secondary">
                This will be published immediately so Students/Parents can see marks.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={createExam} variant="contained" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherMarksModern;
