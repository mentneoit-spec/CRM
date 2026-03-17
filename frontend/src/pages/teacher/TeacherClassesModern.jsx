import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Button, CircularProgress } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TeacherClassesModern = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await teacherAPI.getClasses();
        const data = res?.data?.data ?? [];
        if (!mounted) return;
        setClasses(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setClasses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="teacher">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>My Classes</Typography>
          <Button variant="outlined" onClick={() => navigate('/teacher/students')}>View Students</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            {classes.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary">No classes assigned.</Typography>
              </Grid>
            ) : (
              classes.map((c) => (
                <Grid item xs={12} md={6} lg={4} key={c.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{c?.sclassName || 'Class'}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Students: {c?._count?.Students ?? 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Subjects: {Array.isArray(c?.Subjects) ? c.Subjects.length : 0}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" onClick={() => navigate(`/teacher/students?classId=${c.id}`)}>
                          Students
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => navigate(`/teacher/attendance?classId=${c.id}`)}>
                          Attendance
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default TeacherClassesModern;
