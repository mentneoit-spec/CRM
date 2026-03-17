import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, Button } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';

const TeacherReports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [counts, setCounts] = useState({ attendanceRecords: 0, marksUploaded: 0, homeworkCreated: 0 });

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await teacherAPI.getReports();
            const data = res?.data?.data?.counts ?? {};
            setCounts({
                attendanceRecords: data.attendanceRecords || 0,
                marksUploaded: data.marksUploaded || 0,
                homeworkCreated: data.homeworkCreated || 0,
            });
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load reports');
            setCounts({ attendanceRecords: 0, marksUploaded: 0, homeworkCreated: 0 });
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
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Reports</Typography>
                    <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Card><CardContent>
                                <Typography variant="subtitle2" color="text.secondary">Attendance Records</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{counts.attendanceRecords}</Typography>
                            </CardContent></Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card><CardContent>
                                <Typography variant="subtitle2" color="text.secondary">Marks Uploaded</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{counts.marksUploaded}</Typography>
                            </CardContent></Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card><CardContent>
                                <Typography variant="subtitle2" color="text.secondary">Homework Created</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{counts.homeworkCreated}</Typography>
                            </CardContent></Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default TeacherReports;
