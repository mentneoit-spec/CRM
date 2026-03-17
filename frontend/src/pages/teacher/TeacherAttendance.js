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
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';

const normalizeDateKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const TeacherAttendance = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const initialClassId = query.get('classId') || '';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classId, setClassId] = useState(initialClassId);
    const [subjectId, setSubjectId] = useState('');
    const [students, setStudents] = useState([]);
    const [statusByStudent, setStatusByStudent] = useState({});
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [dateKey, setDateKey] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });

    const subjectsForClass = useMemo(() => {
        if (!classId) return [];
        return (Array.isArray(subjects) ? subjects : []).filter((s) => s?.sclassId === classId);
    }, [subjects, classId]);

    const loadAttendanceForDate = async (selectedClassId, selectedSubjectId, selectedDateKey, currentStudents) => {
        if (!selectedClassId || !selectedSubjectId) {
            const next = {};
            for (const s of currentStudents) next[s.id] = 'present';
            setStatusByStudent(next);
            return;
        }

        const [year, month] = selectedDateKey.split('-').map((v) => Number(v));
        const attendanceRes = await teacherAPI.getAttendance(selectedClassId, {
            subjectId: selectedSubjectId,
            month,
            year,
        });
        const records = attendanceRes?.data?.data?.attendance ?? [];

        const map = {};
        for (const r of records) {
            if (!r?.studentId || !r?.date) continue;
            if (normalizeDateKey(r.date) !== selectedDateKey) continue;
            map[r.studentId] = r.status;
        }

        const next = {};
        for (const s of currentStudents) {
            next[s.id] = map[s.id] || 'present';
        }
        setStatusByStudent(next);
    };

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            setMessage(null);

            try {
                const [dashboardRes, classesRes] = await Promise.all([
                    teacherAPI.getDashboard(),
                    teacherAPI.getClasses(),
                ]);

                const teacherSubjects = dashboardRes?.data?.data?.teacher?.Subjects ?? [];
                const classesData = classesRes?.data?.data ?? [];
                const safeClasses = Array.isArray(classesData) ? classesData : [];

                if (!mounted) return;
                setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : []);
                setClasses(safeClasses);

                const nextClassId = classId || safeClasses?.[0]?.id || '';
                setClassId(nextClassId);
                if (!nextClassId) {
                    setStudents([]);
                    setSubjectId('');
                    setStatusByStudent({});
                    return;
                }

                const nextSubjects = (Array.isArray(teacherSubjects) ? teacherSubjects : []).filter((s) => s?.sclassId === nextClassId);
                const nextSubjectId = subjectId || nextSubjects?.[0]?.id || '';
                setSubjectId(nextSubjectId);

                const studentsRes = await teacherAPI.getStudents(nextClassId);
                const studentsData = studentsRes?.data?.data ?? [];
                const safeStudents = Array.isArray(studentsData) ? studentsData : [];
                if (!mounted) return;
                setStudents(safeStudents);

                await loadAttendanceForDate(nextClassId, nextSubjectId, dateKey, safeStudents);
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.message || e?.message || 'Failed to load attendance data');
                setClasses([]);
                setSubjects([]);
                setStudents([]);
                setStatusByStudent({});
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

    const handleChangeClass = async (nextClassId) => {
        setClassId(nextClassId);
        navigate(`/teacher/attendance?classId=${encodeURIComponent(nextClassId)}`);
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const nextSubjects = (Array.isArray(subjects) ? subjects : []).filter((s) => s?.sclassId === nextClassId);
            const nextSubjectId = nextSubjects?.[0]?.id || '';
            setSubjectId(nextSubjectId);

            const studentsRes = await teacherAPI.getStudents(nextClassId);
            const studentsData = studentsRes?.data?.data ?? [];
            const safeStudents = Array.isArray(studentsData) ? studentsData : [];
            setStudents(safeStudents);

            await loadAttendanceForDate(nextClassId, nextSubjectId, dateKey, safeStudents);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load class data');
            setStudents([]);
            setStatusByStudent({});
        } finally {
            setLoading(false);
        }
    };

    const handleChangeSubject = async (nextSubjectId) => {
        setSubjectId(nextSubjectId);
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await loadAttendanceForDate(classId, nextSubjectId, dateKey, students);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeDate = async (nextDateKey) => {
        setDateKey(nextDateKey);
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await loadAttendanceForDate(classId, subjectId, nextDateKey, students);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!classId || !subjectId) {
            setError('Please select class and subject');
            return;
        }
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const attendance = students.map((s) => ({
                studentId: s.id,
                status: statusByStudent[s.id] || 'present',
            }));

            const res = await teacherAPI.markAttendance({
                classId,
                subjectId,
                date: new Date(`${dateKey}T00:00:00`).toISOString(),
                attendance,
            });

            setMessage(res?.data?.message || 'Attendance saved');
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Attendance</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 240 }} disabled={loading || classes.length === 0}>
                        <InputLabel>Class</InputLabel>
                        <Select value={classId} label="Class" onChange={(e) => handleChangeClass(e.target.value)}>
                            {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c?.sclassName || 'Class'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 240 }} disabled={loading || !classId || subjectsForClass.length === 0}>
                        <InputLabel>Subject</InputLabel>
                        <Select value={subjectId} label="Subject" onChange={(e) => handleChangeSubject(e.target.value)}>
                            {subjectsForClass.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s?.subName || 'Subject'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        type="date"
                        label="Date"
                        value={dateKey}
                        onChange={(e) => handleChangeDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        disabled={loading}
                    />

                    <Button variant="contained" onClick={handleSave} disabled={loading || saving || students.length === 0}>
                        {saving ? 'Saving…' : 'Save Attendance'}
                    </Button>

                    {loading && <CircularProgress size={22} />}
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Roll</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={3}>No students found for this class.</TableCell>
                                </TableRow>
                            ) : students.map((s) => (
                                <TableRow key={s.id} hover>
                                    <TableCell>{s.rollNum ?? '--'}</TableCell>
                                    <TableCell>{s.name || '--'}</TableCell>
                                    <TableCell>
                                        <FormControl size="small" sx={{ minWidth: 160 }} disabled={loading || saving}>
                                            <Select
                                                value={statusByStudent[s.id] || 'present'}
                                                onChange={(e) => setStatusByStudent((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                            >
                                                <MenuItem value="present">Present</MenuItem>
                                                <MenuItem value="absent">Absent</MenuItem>
                                                <MenuItem value="leave">Leave</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </DashboardLayout>
    );
};

export default TeacherAttendance;
