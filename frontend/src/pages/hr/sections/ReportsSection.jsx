import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import { attendanceStateColors, workingDaysPerMonth } from '../../../data/hr-data/attendance';

const ReportsSection = ({ employees, attendance }) => {
  const [reportType, setReportType] = useState('attendance-summary');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const monthlyAttendance = useMemo(() => {
    return attendance.filter((record) => record.date.startsWith(selectedMonth));
  }, [attendance, selectedMonth]);

  // Attendance Summary Report
  const attendanceSummaryReport = useMemo(() => {
    return employees.map((emp) => {
      const empRecords = monthlyAttendance.filter((a) => a.empId === emp.id);
      const present = empRecords.filter((a) => a.status === 'Present').length;
      const absent = empRecords.filter((a) => a.status === 'Absent').length;
      const halfDay = empRecords.filter((a) => a.status === 'Half-Day').length;
      const paidLeave = empRecords.filter((a) => a.status === 'Paid-Leave').length;
      const unpaidLeave = empRecords.filter((a) => a.status === 'Unpaid-Leave').length;
      const attendancePercentage =
        present > 0 ? ((present / workingDaysPerMonth) * 100).toFixed(2) : '0.00';

      return {
        empId: emp.id,
        empName: emp.name,
        department: emp.department,
        present,
        absent,
        halfDay,
        paidLeave,
        unpaidLeave,
        attendancePercentage,
      };
    });
  }, [employees, monthlyAttendance]);

  // Department Attendance Report
  const departmentAttendanceReport = useMemo(() => {
    const report = {};
    attendanceSummaryReport.forEach((emp) => {
      const dept = emp.department;
      if (!report[dept]) {
        report[dept] = {
          department: dept,
          totalEmployees: 0,
          totalPresent: 0,
          totalAbsent: 0,
          avgAttendance: 0,
        };
      }
      report[dept].totalEmployees += 1;
      report[dept].totalPresent += emp.present;
      report[dept].totalAbsent += emp.absent;
    });

    Object.keys(report).forEach((dept) => {
      const total = report[dept].totalPresent + report[dept].totalAbsent;
      report[dept].avgAttendance =
        total > 0 ? ((report[dept].totalPresent / (total * report[dept].totalEmployees)) * 100).toFixed(2) : '0.00';
    });

    return Object.values(report);
  }, [attendanceSummaryReport]);

  // Employee Department Distribution
  const departmentDistribution = useMemo(() => {
    const dist = {};
    employees.forEach((emp) => {
      dist[emp.department] = (dist[emp.department] || 0) + 1;
    });
    return Object.entries(dist).map(([dept, count]) => ({
      department: dept,
      count,
    }));
  }, [employees]);

  // Designation Distribution
  const designationDistribution = useMemo(() => {
    const dist = {};
    employees.forEach((emp) => {
      dist[emp.designation] = (dist[emp.designation] || 0) + 1;
    });
    return Object.entries(dist).map(([desg, count]) => ({
      designation: desg,
      count,
    }));
  }, [employees]);

  // Status Distribution
  const statusDistribution = useMemo(() => {
    return {
      active: employees.filter((e) => e.status === 'Active').length,
      inactive: employees.filter((e) => e.status === 'Inactive').length,
    };
  }, [employees]);

  const handleDownloadReport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'attendance-summary') {
      csvContent += 'Employee ID,Name,Department,Present,Absent,Half-Day,Paid Leave,Unpaid Leave,Attendance %\n';
      attendanceSummaryReport.forEach((item) => {
        csvContent += `${item.empId},${item.empName},${item.department},${item.present},${item.absent},${item.halfDay},${item.paidLeave},${item.unpaidLeave},${item.attendancePercentage}%\n`;
      });
    } else if (reportType === 'department-attendance') {
      csvContent += 'Department,Total Employees,Total Present,Total Absent,Avg Attendance %\n';
      departmentAttendanceReport.forEach((item) => {
        csvContent += `${item.department},${item.totalEmployees},${item.totalPresent},${item.totalAbsent},${item.avgAttendance}%\n`;
      });
    } else if (reportType === 'department-distribution') {
      csvContent += 'Department,Number of Employees\n';
      departmentDistribution.forEach((item) => {
        csvContent += `${item.department},${item.count}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report_${reportType}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✅ Report downloaded successfully');
  };

  return (
    <Box>
      {/* Report Selector */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Select Report Type"
          select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="attendance-summary">Attendance Summary</MenuItem>
          <MenuItem value="department-attendance">Department Attendance</MenuItem>
          <MenuItem value="department-distribution">Department Distribution</MenuItem>
          <MenuItem value="designation-distribution">Designation Distribution</MenuItem>
          <MenuItem value="employee-status">Employee Status</MenuItem>
        </TextField>
        <TextField
          label="Select Month"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleDownloadReport}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </Button>
      </Box>

      {/* Attendance Summary Report */}
      {reportType === 'attendance-summary' && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            📊 Attendance Summary Report for {selectedMonth} (Total Working Days: {workingDaysPerMonth})
          </Alert>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Present</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Absent</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Half-Day</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Paid Leave</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Unpaid Leave</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceSummaryReport.map((item) => (
                  <TableRow key={item.empId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{item.empId}</TableCell>
                    <TableCell>{item.empName}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell align="center">
                      <Chip label={item.present} color="success" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={item.absent} color="error" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={item.halfDay} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={item.paidLeave} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={item.unpaidLeave} color="default" size="small" />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {item.attendancePercentage}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Department Attendance Report */}
      {reportType === 'department-attendance' && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            📍 Department-wise Attendance Report for {selectedMonth}
          </Alert>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Total Employees</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Total Present</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Total Absent</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Avg Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departmentAttendanceReport.map((item) => (
                  <TableRow key={item.department} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{item.department}</TableCell>
                    <TableCell align="center">{item.totalEmployees}</TableCell>
                    <TableCell align="center">
                      <Chip label={item.totalPresent} color="success" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={item.totalAbsent} color="error" size="small" />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {item.avgAttendance}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Department Distribution */}
      {reportType === 'department-distribution' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              📊 Employee Distribution by Department
            </Alert>
          </Grid>
          {departmentDistribution.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.department}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {item.department}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.count}
                  </Typography>
                  <Typography variant="caption">employees</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Designation Distribution */}
      {reportType === 'designation-distribution' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              📊 Employee Distribution by Designation
            </Alert>
          </Grid>
          {designationDistribution.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.designation}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {item.designation}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.count}
                  </Typography>
                  <Typography variant="caption">employees</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Employee Status Report */}
      {reportType === 'employee-status' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              📊 Employee Status Distribution
            </Alert>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Employees
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {statusDistribution.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Inactive Employees
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                  {statusDistribution.inactive}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ReportsSection;
