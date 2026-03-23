import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    CloudUpload,
    Download,
    CheckCircle,
    Error,
    Info,
    People
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ImportStudentsCSV = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [result, setResult] = useState(null);

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
            setFile(selectedFile);
            setMessage({ type: '', text: '' });
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
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
            formData.append('file', file);

            const response = await axios.post(
                `${API_BASE_URL}/admin/students/bulk-import?collegeId=${collegeId}`,
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
                    text: response.data.message || 'Students imported successfully!'
                });
                setResult(response.data.data);
                setFile(null);
                // Reset file input
                document.getElementById('csv-file-input').value = '';
            }
        } catch (error) {
            console.error('Import error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to import students. Please check your CSV format.'
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = `student_id,name,email,phone,class,section,roll_number,parent_name,parent_phone,board,group
STU001,John Doe,john.doe@student.edu,9876543210,10,A,1,Mr. Doe,9876543211,CBSE,Science
STU002,Jane Smith,jane.smith@student.edu,9876543212,10,A,2,Mrs. Smith,9876543213,CBSE,Science
STU003,Mike Johnson,mike.johnson@student.edu,9876543214,10,B,3,Mr. Johnson,9876543215,CBSE,Commerce`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                {/* Header */}
                <Box display="flex" alignItems="center" mb={3}>
                    <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Import Students from CSV
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Upload a CSV file to bulk import student records
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Alert Messages */}
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

                <Grid container spacing={3}>
                    {/* Upload Section */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Step 1: Download Template
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Download the CSV template and fill in your student data
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
                                    Select your filled CSV file and click upload
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

                                {file && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </Alert>
                                )}

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={!file || loading}
                                    onClick={handleUpload}
                                    startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                                    sx={{ py: 1.5 }}
                                >
                                    {loading ? 'Uploading...' : 'Upload & Import Students'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Info Section */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📋 CSV Format Requirements
                                </Typography>
                                <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: 'white' }} />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Required: student_id, name"
                                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Info sx={{ color: 'white' }} />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Optional: email, phone, class, section"
                                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Info sx={{ color: 'white' }} />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Board: STATE, CBSE, IGCSE, IB"
                                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    ℹ️ Important Notes
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Classes and sections will be auto-created if they don't exist
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Duplicate student IDs will be skipped
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Email will be auto-generated if not provided
                                </Typography>
                                <Typography variant="body2">
                                    • Default password will be the roll number or student ID
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Results Section */}
                {result && (
                    <Box sx={{ mt: 4 }}>
                        <Divider sx={{ mb: 3 }} />
                        <Typography variant="h6" gutterBottom>
                            Import Results
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: '#e8f5e9' }}>
                                    <CardContent>
                                        <Typography variant="h4" color="success.main">
                                            {result.created || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Students Created
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: '#fff3e0' }}>
                                    <CardContent>
                                        <Typography variant="h4" color="warning.main">
                                            {result.skipped || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Students Skipped
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: '#ffebee' }}>
                                    <CardContent>
                                        <Typography variant="h4" color="error.main">
                                            {result.errors?.length || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Errors
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Created Students */}
                        {result.createdStudents && result.createdStudents.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom color="success.main">
                                    ✓ Successfully Created Students
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Student ID</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Password</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {result.createdStudents.slice(0, 10).map((student, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{student.studentId}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>{student.email}</TableCell>
                                                    <TableCell>
                                                        <Chip label={student.password} size="small" color="primary" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {result.createdStudents.length > 10 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Showing first 10 of {result.createdStudents.length} students
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Errors */}
                        {result.errors && result.errors.length > 0 && (
                            <Box>
                                <Typography variant="h6" gutterBottom color="error.main">
                                    ⚠ Errors
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Row</TableCell>
                                                <TableCell>Student ID</TableCell>
                                                <TableCell>Error Message</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {result.errors.map((error, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{error.row}</TableCell>
                                                    <TableCell>{error.studentId || 'N/A'}</TableCell>
                                                    <TableCell>{error.message}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ImportStudentsCSV;
