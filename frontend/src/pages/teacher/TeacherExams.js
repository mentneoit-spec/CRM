import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';

const TeacherExams = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exams, setExams] = useState([]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await teacherAPI.getExams();
            const data = res?.data?.data ?? [];
            setExams(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load exams');
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <DashboardLayout role="teacher">
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Exams</Typography>
                    <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Exam</TableCell>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow><TableCell colSpan={4}>No exams found.</TableCell></TableRow>
                                ) : exams.map((ex) => (
                                    <TableRow key={ex.id} hover>
                                        <TableCell>{ex.examName || ex.title || 'Exam'}</TableCell>
                                        <TableCell>{ex.sclass?.sclassName || '--'}</TableCell>
                                        <TableCell>{ex.examDate ? new Date(ex.examDate).toLocaleDateString() : '--'}</TableCell>
                                        <TableCell>{ex.examType || '--'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default TeacherExams;
