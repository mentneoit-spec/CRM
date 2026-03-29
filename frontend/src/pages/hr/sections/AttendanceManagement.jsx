import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { attendanceRecords, attendanceStateColors } from '../../../data/hr-data/attendance';

const AttendanceManagement = ({ employees, attendance, setAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [remarksText, setRemarksText] = useState('');
  const [filterType, setFilterType] = useState('all');

  const attendanceStatusOptions = [
    'Present',
    'Absent',
    'Half-Day',
    'Paid-Leave',
    'Unpaid-Leave',
  ];

  // Get attendance for selected date
  const selectedDateAttendance = useMemo(() => {
    return attendance.filter((a) => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Get statistics for current month
  const monthStats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthRecords = attendance.filter((a) => a.date.startsWith(currentMonth));
    const stats = {};
    attendanceStatusOptions.forEach((status) => {
      stats[status] = monthRecords.filter((a) => a.status === status).length;
    });
    return stats;
  }, [attendance]);

  const handleMarkAttendance = (employee) => {
    setSelectedEmployee(employee);
    const existingRecord = selectedDateAttendance.find(
      (a) => a.empId === employee.id
    );
    if (existingRecord) {
      setAttendanceStatus(existingRecord.status);
      setRemarksText(existingRecord.remarks || '');
    } else {
      setAttendanceStatus('Present');
      setRemarksText('');
    }
    setOpenDialog(true);
  };

  const handleSaveAttendance = () => {
    if (!selectedEmployee) return;

    const newRecord = {
      empId: selectedEmployee.id,
      empName: selectedEmployee.name,
      date: selectedDate,
      status: attendanceStatus,
      remarks: remarksText,
    };

    const existingIndex = attendance.findIndex(
      (a) => a.empId === selectedEmployee.id && a.date === selectedDate
    );

    if (existingIndex >= 0) {
      const newAttendance = [...attendance];
      newAttendance[existingIndex] = newRecord;
      setAttendance(newAttendance);
    } else {
      setAttendance([...attendance, newRecord]);
    }

    setOpenDialog(false);
    setSelectedEmployee(null);
    setRemarksText('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setRemarksText('');
  };

  const getAttendanceStatus = (empId) => {
    const record = selectedDateAttendance.find((a) => a.empId === empId);
    return record ? record.status : 'Not Marked';
  };

  const getStatusColor = (status) => {
    if (status === 'Not Marked') return '#ccc';
    return attendanceStateColors[status] || '#999';
  };

  const filteredEmployees =
    filterType === 'all'
      ? employees
      : employees.filter((emp) => emp.status === filterType);

  return (
    <Box>
      {/* Date Selector and Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Filter Employees"
            select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Employees</MenuItem>
            <MenuItem value="Active">Active Only</MenuItem>
            <MenuItem value="Inactive">Inactive Only</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Month Statistics */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            This Month's Attendance Summary
          </Typography>
          <Grid container spacing={2}>
            {attendanceStatusOptions.map((status) => (
              <Grid item xs={6} sm={4} key={status}>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: attendanceStateColors[status] || '#f0f0f0',
                    borderRadius: 1,
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {monthStats[status]}
                  </Typography>
                  <Typography variant="caption">{status}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Alert severity="info" sx={{ mb: 2 }}>
        📅 Marking attendance for {new Date(selectedDate).toLocaleDateString()}
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => {
              const status = getAttendanceStatus(employee.id);
              const statusColor = getStatusColor(status);
              return (
                <TableRow key={employee.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        backgroundColor: statusColor,
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleMarkAttendance(employee)}
                    >
                      Mark
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mark Attendance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Mark Attendance - {selectedEmployee?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Status"
              select
              value={attendanceStatus}
              onChange={(e) => setAttendanceStatus(e.target.value)}
            >
              {attendanceStatusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Remarks (Optional)"
              multiline
              rows={3}
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              placeholder="Enter any additional remarks..."
            />
            <Alert severity="info">
              {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAttendance} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement;
