import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyStudents } from '../../redux/teacherRelated/teacherHandle';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';

const TeacherStudents = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.user);
    const { myStudents, loading: studentsLoading, error: studentsError } = useSelector((state) => state.teacher);

    useEffect(() => {
        dispatch(getMyStudents());
    }, [dispatch]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Students
            </Typography>
            {loading || studentsLoading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Roll Number</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Section</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {myStudents && myStudents.length > 0 ? (
                                myStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.rollNum}</TableCell>
                                        <TableCell>{student.sclass?.sclassName}</TableCell>
                                        <TableCell>{student.section?.sectionName}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4}>No students found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {error && <Typography color="error">{error}</Typography>}
            {studentsError && <Typography color="error">{studentsError}</Typography>}
        </Box>
    );
};

export default TeacherStudents;
