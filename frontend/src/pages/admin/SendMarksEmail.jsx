import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Alert,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Divider,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import { Email, Send, CheckCircle, Error, CloudUpload, Download } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SendMarksEmail = () => {
    const [tabValue, setTabValue] = useState(0);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [csvFile, setCsvFile] = useState(null);
    const [bulkResult, setBulkResult] = useState(null);

    const [formData, setFormData] = useState({
        studentId: '',
        subjectId: '',
        examId: '',
        marks: '',
        totalMarks: '100',
        remarks: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const token = localStorage.getItem('token');
            const collegeId = localStorage.getItem('collegeId');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: collegeId ? { collegeId } : {}
            };

            const [studentsRes, subjectsRes, examsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/students?limit=1000`, config),
                axios.get(`${API_BASE_URL}/admin/subjects?limit=1000`, config),
                axios.get(`${API_BASE_URL}/admin/exams`, config).catch(() => ({ data: { data: [] } }))
            ]);

            setStudents(studentsRes.data.data || []);
            setSubjects(subjectsRes.data.data || []);
            setExams(examsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load data. Please refresh the page.'
            });
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const collegeId = localStorage.getItem('collegeId');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: collegeId ? { collegeId } : {}
            };

            const payload = {
                studentId: formData.studentId,
                subjectId: formData.subjectId,
                marks: parseFloat(formData.marks),
                totalMarks: parseFloat(formData.totalMarks),
                ...(formData.examId && { examId: formData.examId }),
                ...(formData.remarks && { remarks: formData.remarks })
            };

            const response = await axios.post(
                `${API_BASE_URL}/admin/marks/send-email`,
                payload,
                config
            );

            setMessage({
                type: 'success',
                text: response.data.message || 'Marks saved and email sent successfully!'
            });

            setFormData({
                studentId: '',
                subjectId: '',
                examId: '',
                marks: '',
                totalMarks: '100',
                remarks: ''
            });
        } catch (error) {
            console.error('Error sending marks email:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || error.message || 'Failed to send marks email. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setMessage({
                    type: 'error',
                    text: 'Please select a valid CSV file'
                });
                return;
            }
            setCsvFile(selectedFile);
            setMessage({ type: '', text: '' });
            setBulkResult(null);
        }
    };

    const handleBulkUpload = async () => {
        if (!csvFile) {
            setMessage({
                type: 'error',
                text: 'Please select a CSV file first'
            });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const collegeId = localStorage.getItem('collegeId');
            
            const formData = new FormData();
            formData.append('file', csvFile);

            const response = await axios.post(
                `${API_BASE_URL}/admin/marks/upload-csv?collegeId=${collegeId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: response.data.message || 'Marks uploaded and emails sent successfully!'
                });
                setBulkResult(response.data.data);
                setCsvFile(null);
                document.getElementById('csv-file-input').value = '';
            }
        } catch (error) {
            console.error('Bulk upload error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to upload marks. Please check your CSV format.'
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = `student_email,subject_code,exam_name,marks_obtained,total_marks,remarks
john.doe@student.edu,MATH101,Mid Term,85,100,Good performance
jane.smith@student.edu,MATH101,Mid Term,92,100,Excellent
mike.johnson@student.edu,ENG101,Mid Term,78,100,Needs improvement`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marks_email_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const selectedStudent = students.find(s => s.id === formData.studentId);

    if (loadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Email sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Send Marks via Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Send marks to students individually or in bulk via CSV
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Tabs */}
                <Tabs 
                    value={tabValue} 
                    onChange={(e, newValue) => {
                        setTabValue(newValue);
                        setMessage({ type: '', text: '' });
                    }}
                    variant="fullWidth"
                    sx={{ mb: 3 }}
                >
                    <Tab label="📝 Single Entry" />
                    <Tab label="📤 Bulk Upload (CSV)" />
                </Tabs>

                {message.text && (
                    <Alert
                        severity={message.type}
                        icon={message.type === 'success' ? <CheckCircle /> : <Error />}
                        sx={{ mb: 3 }}
                        onClose={() => setMessage({ type: '', text: '' })}
                    >
                        {message.text}
                    </Alert>
                )}

                {/* Tab 0: Single Entry */}
                {tabValue === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            fullWidth
                                            required
                                            label="Select Student"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <MenuItem value="">
                                                <em>-- Select Student --</em>
                                            </MenuItem>
                                            {students.map((student) => (
                                                <MenuItem key={student.id} value={student.id}>
                                                    {student.name} ({student.studentId}) - {student.email || 'No email'}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            fullWidth
                                            required
                                            label="Select Subject"
                                            name="subjectId"
                                            value={formData.subjectId}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <MenuItem value="">
                                                <em>-- Select Subject --</em>
                                            </MenuItem>
                                            {subjects.map((subject) => (
                                                <MenuItem key={subject.id} value={subject.id}>
                                                    {subject.subName} ({subject.subCode})
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Select Exam (Optional)"
                                            name="examId"
                                            value={formData.examId}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <MenuItem value="">
                                                <em>-- No Exam --</em>
                                            </MenuItem>
                                            {exams.map((exam) => (
                                                <MenuItem key={exam.id} value={exam.id}>
                                                    {exam.examName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            type="number"
                                            label="Marks Obtained"
                                            name="marks"
                                            value={formData.marks}
                                            onChange={handleChange}
                                            disabled={loading}
                                            inputProps={{
                                                min: 0,
                                                max: formData.totalMarks,
                                                step: 0.01
                                            }}
                                            helperText={`Enter marks between 0 and ${formData.totalMarks}`}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            type="number"
                                            label="Total Marks"
                                            name="totalMarks"
                                            value={formData.totalMarks}
                                            onChange={handleChange}
                                            disabled={loading}
                                            inputProps={{ min: 1 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Remarks (Optional)"
                                            name="remarks"
                                            value={formData.remarks}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="Add any comments or remarks..."
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                                            sx={{ py: 1.5 }}
                                        >
                                            {loading ? 'Sending...' : 'Send Marks & Email'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        📧 Email Preview
                                    </Typography>
                                    <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                                    
                                    {selectedStudent ? (
                                        <Box>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>To:</strong> {selectedStudent.email || 'No email set'}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Student:</strong> {selectedStudent.name}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Class:</strong> {selectedStudent.sclass?.sclassName || 'N/A'}
                                            </Typography>
                                            
                                            {formData.marks && formData.totalMarks && (
                                                <>
                                                    <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                                                    <Typography variant="body2" gutterBottom>
                                                        <strong>Marks:</strong> {formData.marks} / {formData.totalMarks}
                                                    </Typography>
                                                    <Typography variant="body2" gutterBottom>
                                                        <strong>Percentage:</strong> {((formData.marks / formData.totalMarks) * 100).toFixed(2)}%
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Grade:</strong> {calculateGrade((formData.marks / formData.totalMarks) * 100)}
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2">
                                            Select a student to see email preview
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>

                            <Card sx={{ mt: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        ℹ️ Information
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • Email sent to student's registered email
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • Marks saved to database
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • Grade calculated automatically
                                    </Typography>
                                    <Typography variant="body2">
                                        • Results visible in student portal
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Tab 1: Bulk Upload */}
                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Step 1: Download Template
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Download the CSV template and fill in marks for multiple students
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={downloadTemplate}
                                        fullWidth
                                    >
                                        Download CSV Template
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Step 2: Upload CSV File
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Upload your filled CSV file to send marks to all students at once
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <input
                                            accept=".csv"
                                            style={{ display: 'none' }}
                                            id="csv-file-input"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="csv-file-input">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<CloudUpload />}
                                                fullWidth
                                            >
                                                Select CSV File
                                            </Button>
                                        </label>
                                    </Box>

                                    {csvFile && (
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                                        </Alert>
                                    )}

                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={!csvFile || loading}
                                        onClick={handleBulkUpload}
                                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? 'Processing...' : 'Upload & Send Emails to All'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        📋 CSV Format
                                    </Typography>
                                    <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                                    <Typography variant="body2" paragraph>
                                        <strong>Required Columns:</strong>
                                    </Typography>
                                    <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                        • student_email<br/>
                                        • subject_code<br/>
                                        • marks_obtained<br/>
                                        • total_marks
                                    </Typography>
                                    <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                                        <strong>Optional:</strong> exam_name, remarks
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        ⚡ Bulk Features
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • Send to hundreds of students at once
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • Automatic email to each student
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • All marks saved to database
                                    </Typography>
                                    <Typography variant="body2">
                                        • Results instantly visible in student portal
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Bulk Results */}
                        {bulkResult && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom>
                                    Upload Results
                                </Typography>
                                
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{ bgcolor: '#e8f5e9' }}>
                                            <CardContent>
                                                <Typography variant="h4" color="success.main">
                                                    {bulkResult.processed || 0}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Emails Sent
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{ bgcolor: '#fff3e0' }}>
                                            <CardContent>
                                                <Typography variant="h4" color="warning.main">
                                                    {bulkResult.skipped || 0}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Skipped
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{ bgcolor: '#ffebee' }}>
                                            <CardContent>
                                                <Typography variant="h4" color="error.main">
                                                    {bulkResult.errors?.length || 0}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Errors
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

                                {bulkResult.errors && bulkResult.errors.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom color="error.main">
                                            ⚠ Errors
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Row</TableCell>
                                                        <TableCell>Student</TableCell>
                                                        <TableCell>Error Message</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {bulkResult.errors.map((error, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{error.row}</TableCell>
                                                            <TableCell>{error.studentKey || 'N/A'}</TableCell>
                                                            <TableCell>{error.message}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </Grid>
                        )}
                    </Grid>
                )}
            </Paper>
        </Box>
    );
};

const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

export default SendMarksEmail;
