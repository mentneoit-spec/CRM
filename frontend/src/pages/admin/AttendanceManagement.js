import React, { useState } from 'react';
import {
  Container, Box, Card, CardContent, Grid, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Stack,
  Typography, Tab, Tabs, LinearProgress, CardHeader, Divider
} from '@mui/material';
import {
  Add as AddIcon, DateRange as DateRangeIcon, TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AttendanceManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [openDialog, setOpenDialog] = useState(false);

  const [attendanceData, setAttendanceData] = useState([
    { id: 1, studentId: 'STU001', name: 'Arjun Kumar', class: '10A', status: 'Present', date: '2024-03-05' },
    { id: 2, studentId: 'STU002', name: 'Priya Singh', class: '10A', status: 'Present', date: '2024-03-05' },
    { id: 3, studentId: 'STU003', name: 'Rahul Patel', class: '10A', status: 'Absent', date: '2024-03-05' },
    { id: 4, studentId: 'STU004', name: 'Neha Gupta', class: '10A', status: 'Leave', date: '2024-03-05' }
  ]);

  const [students, setStudents] = useState([
    { id: 1, studentId: 'STU001', name: 'Arjun Kumar', class: '10A', rollNum: 1 },
    { id: 2, studentId: 'STU002', name: 'Priya Singh', class: '10A', rollNum: 2 },
    { id: 3, studentId: 'STU003', name: 'Rahul Patel', class: '10A', rollNum: 3 },
    { id: 4, studentId: 'STU004', name: 'Neha Gupta', class: '10A', rollNum: 4 }
  ]);

  const monthlyTrend = [
    { month: 'Jan', presentPercent: 92, absentPercent: 8 },
    { month: 'Feb', presentPercent: 88, absentPercent: 12 },
    { month: 'Mar', presentPercent: 85, absentPercent: 15 }
  ];

  const classStats = [
    { class: '10A', present: 42, absent: 8, leave: 5, percentage: 85 },
    { class: '10B', present: 38, absent: 10, leave: 2, percentage: 83 },
    { class: '9A', present: 40, absent: 8, leave: 7, percentage: 83 },
    { class: '9B', present: 35, absent: 12, leave: 8, percentage: 79 }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAttendance = (studentId, status) => {
    setAttendanceData(attendanceData.map(record =>
      record.id === studentId ? { ...record, status } : record
    ));
  };

  const handleSaveAttendance = () => {
    setOpenDialog(false);
  };

  const classAttendanceData = attendanceData.filter(r => r.class === selectedClass && r.date === selectedDate);

  const presentCount = classAttendanceData.filter(r => r.status === 'Present').length;
  const absentCount = classAttendanceData.filter(r => r.status === 'Absent').length;
  const leaveCount = classAttendanceData.filter(r => r.status === 'Leave').length;
  const totalStudents = classAttendanceData.length;
  const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Attendance Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Track and manage student attendance
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Daily Attendance" />
            <Tab label="Monthly Trends" />
            <Tab label="Class Statistics" />
            <Tab label="Student Reports" />
          </Tabs>
        </Box>

        {/* Daily Attendance Tab */}
        {tabValue === 0 && (
          <CardContent>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Class</InputLabel>
                  <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} label="Select Class">
                    <MenuItem value="10A">10A</MenuItem>
                    <MenuItem value="10B">10B</MenuItem>
                    <MenuItem value="9A">9A</MenuItem>
                    <MenuItem value="9B">9B</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button variant="contained" fullWidth onClick={() => setOpenDialog(true)}>
                  Save Attendance
                </Button>
              </Grid>
            </Grid>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e8f5e9' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Present</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      {presentCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#ffebee' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Absent</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                      {absentCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#fff3e0' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Leave</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFC107' }}>
                      {leaveCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e3f2fd' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Attendance %</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                      {attendancePercentage}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Attendance Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Roll No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classAttendanceData.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label="Present"
                            color={record.status === 'Present' ? 'success' : 'default'}
                            variant={record.status === 'Present' ? 'filled' : 'outlined'}
                            size="small"
                            onClick={() => handleMarkAttendance(record.id, 'Present')}
                            sx={{ cursor: 'pointer' }}
                          />
                          <Chip
                            label="Absent"
                            color={record.status === 'Absent' ? 'error' : 'default'}
                            variant={record.status === 'Absent' ? 'filled' : 'outlined'}
                            size="small"
                            onClick={() => handleMarkAttendance(record.id, 'Absent')}
                            sx={{ cursor: 'pointer' }}
                          />
                          <Chip
                            label="Leave"
                            color={record.status === 'Leave' ? 'warning' : 'default'}
                            variant={record.status === 'Leave' ? 'filled' : 'outlined'}
                            size="small"
                            onClick={() => handleMarkAttendance(record.id, 'Leave')}
                            sx={{ cursor: 'pointer' }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Monthly Trends Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Attendance Trend (Last 3 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="presentPercent" stroke="#4CAF50" strokeWidth={2} name="Present %" />
                <Line type="monotone" dataKey="absentPercent" stroke="#F44336" strokeWidth={2} name="Absent %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        )}

        {/* Class Statistics Tab */}
        {tabValue === 2 && (
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Attendance by Class
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#4CAF50" name="Present" />
                <Bar dataKey="absent" fill="#F44336" name="Absent" />
                <Bar dataKey="leave" fill="#FFC107" name="Leave" />
              </BarChart>
            </ResponsiveContainer>

            {/* Class Details */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Class-wise Summary
              </Typography>
              {classStats.map((stat, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{stat.class}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                      {stat.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.percentage}
                    sx={{
                      height: 8,
                      borderRadius: '4px',
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#2196F3' }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        )}

        {/* Student Reports Tab */}
        {tabValue === 3 && (
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Individual Student Attendance Reports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Present Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Absent Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Leave Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Arjun Kumar', class: '10A', present: 45, absent: 2, leave: 3, percent: 93 },
                    { name: 'Priya Singh', class: '10A', present: 48, absent: 1, leave: 1, percent: 96 },
                    { name: 'Rahul Patel', class: '10A', present: 40, absent: 8, leave: 2, percent: 83 }
                  ].map((student, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{student.present}</TableCell>
                      <TableCell sx={{ color: '#F44336', fontWeight: 'bold' }}>{student.absent}</TableCell>
                      <TableCell sx={{ color: '#FFC107', fontWeight: 'bold' }}>{student.leave}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{student.percent}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* Save Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Attendance</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Save attendance for {selectedClass} on {selectedDate}?
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="caption">Present: <strong>{presentCount}</strong></Typography>
              <Typography variant="caption">Absent: <strong>{absentCount}</strong></Typography>
              <Typography variant="caption">Leave: <strong>{leaveCount}</strong></Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAttendance} variant="contained" color="primary">Save Attendance</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceManagement;
