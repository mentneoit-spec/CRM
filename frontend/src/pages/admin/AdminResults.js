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
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AdminResults = () => {
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState([]);
    const [classId, setClassId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [examId, setExamId] = useState('');
    const [studentId, setStudentId] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);

    const subjectsForClass = useMemo(() => {
        if (!classId) return [];
        return (Array.isArray(subjects) ? subjects : []).filter((s) => s?.sclassId === classId);
    }, [subjects, classId]);

    const studentsForClass = useMemo(() => {
        if (!classId) return [];
        return (Array.isArray(students) ? students : []).filter((s) => s?.sclassId === classId);
    }, [students, classId]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const [classesRes, subjectsRes, examsRes, studentsRes, resultsRes] = await Promise.all([
                    adminAPI.getClasses ? adminAPI.getClasses() : Promise.resolve({ data: { data: [] } }),
                    adminAPI.getSubjects ? adminAPI.getSubjects() : Promise.resolve({ data: { data: [] } }),
                    adminAPI.getExams ? adminAPI.getExams() : Promise.resolve({ data: { data: [] } }),
                    adminAPI.getAllStudents ? adminAPI.getAllStudents() : Promise.resolve({ data: { data: [] } }),
                    adminAPI.getResults ? adminAPI.getResults() : Promise.resolve({ data: { data: [] } }),
                ]);

                if (!mounted) return;

                setClasses(Array.isArray(classesRes?.data?.data) ? classesRes.data.data : []);
                setSubjects(Array.isArray(subjectsRes?.data?.data) ? subjectsRes.data.data : []);
                setExams(Array.isArray(examsRes?.data?.data) ? examsRes.data.data : []);
                setStudents(Array.isArray(studentsRes?.data?.data) ? studentsRes.data.data : []);
                setResults(Array.isArray(resultsRes?.data?.data) ? resultsRes.data.data : []);
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

    const filteredResults = useMemo(() => {
        let filtered = Array.isArray(results) ? results : [];

        if (classId) {
            filtered = filtered.filter((r) => r?.student?.sclassId === classId);
        }
        if (subjectId) {
            filtered = filtered.filter((r) => r?.subjectId === subjectId);
        }
        if (examId) {
            filtered = filtered.filter((r) => r?.examId === examId);
        }
        if (studentId) {
            filtered = filtered.filter((r) => r?.studentId === studentId);
        }

        return filtered;
    }, [results, classId, subjectId, examId, studentId]);

    const handleImportCSV = async (file) => {
        if (!file) return;

        setImporting(true);
        setError(null);
        setMessage(null);

        try {
            // You need to specify examId and subjectId for import
            if (!examId) {
                setError('Please select an exam before importing results');
                setImporting(false);
                return;
            }

            if (!subjectId) {
                setError('Please select a subject before importing results');
                setImporting(false);
                return;
            }

            const response = await adminAPI.importExamMarksCsv(examId, subjectId, file);
            const result = response?.data;
            const created = result?.created ?? 0;
            const updated = result?.updated ?? 0;
            const skipped = result?.skipped ?? 0;
            const errorCount = Array.isArray(result?.errors) ? result.errors.length : 0;

            setMessage(`Import complete: created ${created}, updated ${updated}, skipped ${skipped}, errors ${errorCount}`);

            // Reload results
            const resultsRes = await adminAPI.getResults();
            setResults(Array.isArray(resultsRes?.data?.data) ? resultsRes.data.data : []);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to import CSV');
        } finally {
            setImporting(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredResults.length === 0) {
            setError('No results to export');
            return;
        }

        const headers = ['Student Name', 'Student ID', 'Class', 'Subject', 'Exam', 'Marks', 'Max Marks', 'Percentage', 'Grade'];
        const rows = filteredResults.map((r) => [
            r?.student?.name || '--',
            r?.student?.studentId || '--',
            r?.student?.sclass?.sclassName || '--',
            r?.subject?.subName || '--',
            r?.exam?.examName || '--',
            r?.marksObtained || 0,
            r?.subject?.maxMarks || 100,
            r?.percentage?.toFixed(2) || 0,
            r?.grade || '--',
        ]);

        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `results-${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        setMessage('Results exported successfully');
    };

    return (
        <DashboardLayout role="admin">
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Exam Results</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <FormControl size="small" sx={{ minWidth: 180 }} disabled={loading || classes.length === 0}>
                        <InputLabel>Class</InputLabel>
                        <Select value={classId} label="Class" onChange={(e) => setClassId(e.target.value)}>
                            <MenuItem value="">All Classes</MenuItem>
                            {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c?.sclassName || 'Class'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180 }} disabled={loading || subjectsForClass.length === 0}>
                        <InputLabel>Subject</InputLabel>
                        <Select value={subjectId} label="Subject" onChange={(e) => setSubjectId(e.target.value)}>
                            <MenuItem value="">All Subjects</MenuItem>
                            {subjectsForClass.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s?.subName || 'Subject'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180 }} disabled={loading || exams.length === 0}>
                        <InputLabel>Exam</InputLabel>
                        <Select value={examId} label="Exam" onChange={(e) => setExamId(e.target.value)}>
                            <MenuItem value="">All Exams</MenuItem>
                            {exams.map((e) => (
                                <MenuItem key={e.id} value={e.id}>{e?.examName || 'Exam'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180 }} disabled={loading || studentsForClass.length === 0}>
                        <InputLabel>Student</InputLabel>
                        <Select value={studentId} label="Student" onChange={(e) => setStudentId(e.target.value)}>
                            <MenuItem value="">All Students</MenuItem>
                            {studentsForClass.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s?.name || 'Student'}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button 
                        variant="contained" 
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={loading || importing}
                        sx={{ mr: 1 }}
                    >
                        {importing ? 'Importing...' : 'Import CSV'}
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleImportCSV(file);
                                }
                                e.target.value = '';
                            }}
                        />
                    </Button>

                    <Button 
                        variant="contained" 
                        startIcon={<CloudDownloadIcon />}
                        onClick={handleExportCSV}
                        disabled={loading || filteredResults.length === 0}
                    >
                        Export CSV
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
                                    <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Exam</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Marks</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="right">Percentage</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="center">Grade</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredResults.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">No results found</TableCell>
                                    </TableRow>
                                ) : filteredResults.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell>{r?.student?.name || '--'}</TableCell>
                                        <TableCell>{r?.student?.studentId || '--'}</TableCell>
                                        <TableCell>{r?.student?.sclass?.sclassName || '--'}</TableCell>
                                        <TableCell>{r?.subject?.subName || '--'}</TableCell>
                                        <TableCell>{r?.exam?.examName || '--'}</TableCell>
                                        <TableCell align="right">{r?.marksObtained || 0} / {r?.subject?.maxMarks || 100}</TableCell>
                                        <TableCell align="right">{r?.percentage?.toFixed(2) || 0}%</TableCell>
                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    display: 'inline-block',
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    backgroundColor: r?.grade === 'A+' || r?.grade === 'A' ? '#dcfce7' : r?.grade === 'B' ? '#fef3c7' : '#fee2e2',
                                                    color: r?.grade === 'A+' || r?.grade === 'A' ? '#166534' : r?.grade === 'B' ? '#92400e' : '#991b1b',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {r?.grade || '--'}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        Total Results: {filteredResults.length}
                    </Typography>
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default AdminResults;
