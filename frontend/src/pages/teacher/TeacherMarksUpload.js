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
    Alert,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';

const TeacherMarksUpload = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [classId, setClassId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [examId, setExamId] = useState('');
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentMarks, setStudentMarks] = useState('');

    const subjectsForClass = useMemo(() => {
        if (!classId) return [];
        return (Array.isArray(subjects) ? subjects : []).filter((s) => s?.sclassId === classId);
    }, [subjects, classId]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const [classesRes, examsRes] = await Promise.all([
                    teacherAPI.getClasses(),
                    teacherAPI.getExams ? teacherAPI.getExams() : Promise.resolve({ data: { data: [] } }),
                ]);

                const classesData = classesRes?.data?.data ?? [];
                const examsData = examsRes?.data?.data ?? [];

                if (!mounted) return;
                setClasses(Array.isArray(classesData) ? classesData : []);
                setExams(Array.isArray(examsData) ? examsData : []);

                // Get subjects from dashboard
                const dashboardRes = await teacherAPI.getDashboard();
                const teacherSubjects = dashboardRes?.data?.data?.teacher?.Subjects ?? [];
                if (!mounted) return;
                setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : []);
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.message || e?.message || 'Failed to load data');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const handleClassChange = async (nextClassId) => {
        setClassId(nextClassId);
        setSubjectId('');
        setExamId('');
        setStudents([]);
        setMarks({});

        try {
            const studentsRes = await teacherAPI.getStudents(nextClassId);
            const studentsData = studentsRes?.data?.data ?? [];
            setStudents(Array.isArray(studentsData) ? studentsData : []);
        } catch (e) {
            setError('Failed to load students');
        }
    };

    const handleSubjectChange = (nextSubjectId) => {
        setSubjectId(nextSubjectId);
        setMarks({});
    };

    const handleExamChange = (nextExamId) => {
        setExamId(nextExamId);
        setMarks({});
    };

    const handleMarksChange = (studentId, value) => {
        const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
        setMarks((prev) => ({ ...prev, [studentId]: numValue }));
    };

    const handleOpenDialog = (student) => {
        setSelectedStudent(student);
        setStudentMarks(marks[student.id]?.toString() || '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
        setStudentMarks('');
    };

    const handleSaveMarks = () => {
        const numValue = Math.min(100, Math.max(0, parseInt(studentMarks) || 0));
        setMarks((prev) => ({ ...prev, [selectedStudent.id]: numValue }));
        handleCloseDialog();
    };

    const handleSaveAll = async () => {
        if (!classId || !subjectId || !examId) {
            setError('Please select class, subject, and exam');
            return;
        }

        if (Object.keys(marks).length === 0) {
            setError('Please enter marks for at least one student');
            return;
        }

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const marksData = students
                .filter((s) => marks[s.id] !== undefined)
                .map((s) => ({
                    studentId: s.id,
                    marksObtained: marks[s.id],
                }));

            const res = await teacherAPI.uploadMarks({
                classId,
                subjectId,
                examId,
                marks: marksData,
            });

            setMessage(res?.data?.message || 'Marks uploaded successfully');
            setMarks({});
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to upload marks');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Upload Marks</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }} disabled={loading || classes.length === 0}>
                        <InputLabel>Class</InputLabel>
                        <Select value={classId} label="Class" onChange={(e) => handleClassChange(e.target.value)}>
                            {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c?.sclassName || 'Class'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }} disabled={loading || !classId || subjectsForClass.length === 0}>
                        <InputLabel>Subject</InputLabel>
                        <Select value={subjectId} label="Subject" onChange={(e) => handleSubjectChange(e.target.value)}>
                            {subjectsForClass.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s?.subName || 'Subject'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }} disabled={loading || exams.length === 0}>
                        <InputLabel>Exam</InputLabel>
                        <Select value={examId} label="Exam" onChange={(e) => handleExamChange(e.target.value)}>
                            {exams.map((e) => (
                                <MenuItem key={e.id} value={e.id}>{e?.examName || 'Exam'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button 
                        variant="contained" 
                        onClick={handleSaveAll} 
                        disabled={loading || saving || !classId || !subjectId || !examId || Object.keys(marks).length === 0}
                    >
                        {saving ? 'Saving…' : 'Save All Marks'}
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Roll</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Marks (0-100)</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No students found. Please select a class.</TableCell>
                                    </TableRow>
                                ) : students.map((s) => (
                                    <TableRow key={s.id} hover>
                                        <TableCell>{s.rollNum ?? '--'}</TableCell>
                                        <TableCell>{s.name || '--'}</TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                inputProps={{ min: 0, max: 100 }}
                                                value={marks[s.id] ?? ''}
                                                onChange={(e) => handleMarksChange(s.id, e.target.value)}
                                                placeholder="Enter marks"
                                                sx={{ width: 120 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button 
                                                size="small" 
                                                onClick={() => handleOpenDialog(s)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Marks - {selectedStudent?.name}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Marks (0-100)"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, max: 100 }}
                            value={studentMarks}
                            onChange={(e) => setStudentMarks(e.target.value)}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSaveMarks} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default TeacherMarksUpload;
