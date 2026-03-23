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
    Tabs,
    Tab,
    Card,
    CardContent,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';

const AdminMarksUploadEnhanced = () => {
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
    const [tabValue, setTabValue] = useState(0);
    const [csvFile, setCsvFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState([]);

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
                const [classesRes, subjectsRes, examsRes] = await Promise.all([
                    adminAPI.getClasses ? adminAPI.getClasses() : Promise.resolve({ data: { data: [] } }),
                    adminAPI.getSubjects ? adminAPI.getSubjects() : Promise.resolve({ data: { data: [] } }),
                    adminAPI.getExams ? adminAPI.getExams() : Promise.resolve({ data: { data: [] } }),
                ]);

                const classesData = classesRes?.data?.data ?? [];
                const subjectsData = subjectsRes?.data?.data ?? [];
                const examsData = examsRes?.data?.data ?? [];

                if (!mounted) return;
                setClasses(Array.isArray(classesData) ? classesData : []);
                setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
                setExams(Array.isArray(examsData) ? examsData : []);
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
            const studentsRes = await adminAPI.getStudentsByClass ? 
                await adminAPI.getStudentsByClass(nextClassId) : 
                Promise.resolve({ data: { data: [] } });
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

            const res = await adminAPI.uploadMarks({
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

    // CSV Import Handlers
    const handleCsvFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result;
            const lines = csv.split('\n').filter(line => line.trim());
            const preview = lines.slice(0, 6).map((line, idx) => ({
                id: idx,
                data: line,
            }));
            setCsvPreview(preview);
        };
        reader.readAsText(file);
    };

    const handleUploadCsv = async () => {
        if (!csvFile || !classId || !subjectId || !examId) {
            setError('Please select class, subject, exam, and CSV file');
            return;
        }

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', csvFile);
            formData.append('classId', classId);
            formData.append('subjectId', subjectId);
            formData.append('examId', examId);

            const res = await adminAPI.uploadMarksCsv(formData);
            setMessage(res?.data?.message || 'CSV uploaded successfully');
            setCsvFile(null);
            setCsvPreview([]);
            setMarks({});
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to upload CSV');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Upload Student Marks
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {message && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                        {message}
                    </Alert>
                )}

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Class</InputLabel>
                            <Select value={classId} label="Class" onChange={(e) => handleClassChange(e.target.value)}>
                                <MenuItem value="">Select Class</MenuItem>
                                {classes.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c?.sclassName || 'Class'}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!classId}>
                            <InputLabel>Subject</InputLabel>
                            <Select value={subjectId} label="Subject" onChange={(e) => handleSubjectChange(e.target.value)}>
                                <MenuItem value="">Select Subject</MenuItem>
                                {subjectsForClass.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>{s?.subName || 'Subject'}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!subjectId}>
                            <InputLabel>Exam</InputLabel>
                            <Select value={examId} label="Exam" onChange={(e) => handleExamChange(e.target.value)}>
                                <MenuItem value="">Select Exam</MenuItem>
                                {exams.map((e) => (
                                    <MenuItem key={e.id} value={e.id}>{e?.examName || 'Exam'}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Paper>

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab label="Manual Entry" />
                        <Tab label="CSV Import" />
                    </Tabs>
                </Paper>

                {/* Manual Entry Tab */}
                {tabValue === 0 && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {students.length > 0 ? (
                            <>
                                <TableContainer component={Paper} sx={{ mb: 2, flex: 1, overflow: 'auto' }}>
                                    <Table stickyHeader>
                                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Marks</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {students.map((student) => (
                                                <TableRow key={student.id} hover>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>{student.studentId}</TableCell>
                                                    <TableCell>
                                                        {marks[student.id] !== undefined ? (
                                                            <Typography sx={{ fontWeight: 'bold', color: 'green' }}>
                                                                {marks[student.id]}
                                                            </Typography>
                                                        ) : (
                                                            <Typography sx={{ color: 'gray' }}>Not entered</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<EditIcon />}
                                                            onClick={() => handleOpenDialog(student)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2, pb: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleSaveAll}
                                        disabled={saving || Object.keys(marks).length === 0}
                                    >
                                        {saving ? 'Saving...' : 'Save All Marks'}
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Alert severity="info">Please select a class to view students</Alert>
                        )}
                    </Box>
                )}

                {/* CSV Import Tab */}
                {tabValue === 1 && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    CSV Format Instructions
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Your CSV file should have the following columns:
                                </Typography>
                                <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        student_id, marks, remarks
                                    </Typography>
                                </Box>
                                <Typography variant="body2">
                                    Example:
                                </Typography>
                                <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        STU001, 85, Good<br />
                                        STU002, 92, Excellent<br />
                                        STU003, 78, Average
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        <Paper sx={{ p: 2, mb: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    size="large"
                                >
                                    Choose CSV File
                                    <input
                                        hidden
                                        accept=".csv"
                                        type="file"
                                        onChange={handleCsvFileChange}
                                    />
                                </Button>

                                {csvFile && (
                                    <Typography variant="body2">
                                        Selected file: <strong>{csvFile.name}</strong>
                                    </Typography>
                                )}

                                {csvPreview.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            Preview (first 5 rows):
                                        </Typography>
                                        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                                            {csvPreview.map((row) => (
                                                <Typography key={row.id} variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                                                    {row.data}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', gap: 2, mt: 'auto', pt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleUploadCsv}
                                        disabled={saving || !csvFile || !classId || !subjectId || !examId}
                                    >
                                        {saving ? 'Uploading...' : 'Upload CSV'}
                                    </Button>
                                    {csvFile && (
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            onClick={() => {
                                                setCsvFile(null);
                                                setCsvPreview([]);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {/* Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Student Marks</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        {selectedStudent && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Student Name
                                    </Typography>
                                    <Typography>{selectedStudent.name}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Student ID
                                    </Typography>
                                    <Typography>{selectedStudent.studentId}</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Marks (0-100)"
                                    type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                    value={studentMarks}
                                    onChange={(e) => setStudentMarks(e.target.value)}
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSaveMarks} color="primary" variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default AdminMarksUploadEnhanced;
