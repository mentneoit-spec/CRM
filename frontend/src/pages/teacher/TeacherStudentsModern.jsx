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
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';

const TeacherStudentsModern = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialClassId = query.get('classId') || '';

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState(initialClassId);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const classesRes = await teacherAPI.getClasses();
        const classesData = classesRes?.data?.data ?? [];
        const safeClasses = Array.isArray(classesData) ? classesData : [];

        if (!mounted) return;
        setClasses(safeClasses);

        const nextClassId = classId || safeClasses?.[0]?.id || '';
        setClassId(nextClassId);

        if (!nextClassId) {
          setStudents([]);
          return;
        }

        const studentsRes = await teacherAPI.getStudents(nextClassId);
        const studentsData = studentsRes?.data?.data ?? [];
        if (!mounted) return;
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (e) {
        if (!mounted) return;
        setClasses([]);
        setStudents([]);
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

  const onChangeClass = async (nextId) => {
    setClassId(nextId);
    navigate(`/teacher/students?classId=${encodeURIComponent(nextId)}`);
    setLoading(true);
    try {
      const studentsRes = await teacherAPI.getStudents(nextId);
      const studentsData = studentsRes?.data?.data ?? [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (e) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Students</Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 240 }} disabled={loading || classes.length === 0}>
            <InputLabel>Class</InputLabel>
            <Select value={classId} label="Class" onChange={(e) => onChangeClass(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c?.sclassName || 'Class'}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {loading && <CircularProgress size={22} />}
        </Box>

        {(!classId && !loading) ? (
          <Typography color="text.secondary">No class selected.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Roll</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell align="right">Attendance Records</TableCell>
                  <TableCell align="right">Exam Results</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>No students found.</TableCell>
                  </TableRow>
                ) : students.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.rollNum ?? '--'}</TableCell>
                    <TableCell>{s.name || '--'}</TableCell>
                    <TableCell>{s.section?.sectionName || '--'}</TableCell>
                    <TableCell align="right">{s?._count?.Attendances ?? 0}</TableCell>
                    <TableCell align="right">{s?._count?.ExamResults ?? 0}</TableCell>
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

export default TeacherStudentsModern;
