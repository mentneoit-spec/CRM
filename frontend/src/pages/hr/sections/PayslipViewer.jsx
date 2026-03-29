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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { calculateSalary, payrollStatus as payrollStatusColors } from '../../../data/hr-data/payroll';
import { workingDaysPerMonth } from '../../../data/hr-data/attendance';

const PayslipViewer = ({ employees, attendance }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(
    employees.length > 0 ? employees[0].id : ''
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [openPayslip, setOpenPayslip] = useState(false);

  // Get current employee's data
  const currentEmployee = useMemo(() => {
    return employees.find((emp) => emp.id === selectedEmployee);
  }, [employees, selectedEmployee]);

  // Get attendance records for selected month
  const monthlyAttendance = useMemo(() => {
    return attendance.filter((record) => record.date.startsWith(selectedMonth));
  }, [attendance, selectedMonth]);

  // Calculate salary for current employee
  const salaryData = useMemo(() => {
    if (!currentEmployee) return null;
    return calculateSalary(currentEmployee, monthlyAttendance, workingDaysPerMonth);
  }, [currentEmployee, monthlyAttendance]);

  // Get attendance breakdown
  const attendanceBreakdown = useMemo(() => {
    const breakdown = {
      Present: 0,
      Absent: 0,
      'Half-Day': 0,
      'Paid-Leave': 0,
      'Unpaid-Leave': 0,
    };

    const employeeRecords = monthlyAttendance.filter(
      (a) => a.empId === selectedEmployee
    );
    employeeRecords.forEach((record) => {
      breakdown[record.status] = (breakdown[record.status] || 0) + 1;
    });

    return breakdown;
  }, [monthlyAttendance, selectedEmployee]);

  const handleViewPayslip = () => {
    setOpenPayslip(true);
  };

  const handleClosePayslip = () => {
    setOpenPayslip(false);
  };

  const handleDownloadPayslip = () => {
    if (!currentEmployee || !salaryData) return;

    const content = `
Employee Payslip
================
Employee ID: ${currentEmployee.id}
Employee Name: ${currentEmployee.name}
Designation: ${currentEmployee.designation}
Department: ${currentEmployee.department}
Salary Month: ${selectedMonth}
Generation Date: ${new Date().toLocaleDateString()}

Attendance Summary:
- Working Days: ${workingDaysPerMonth}
- Present: ${attendanceBreakdown.Present}
- Absent: ${attendanceBreakdown.Absent}
- Half-Day: ${attendanceBreakdown['Half-Day']}
- Paid Leave: ${attendanceBreakdown['Paid-Leave']}
- Unpaid Leave: ${attendanceBreakdown['Unpaid-Leave']}

Salary Breakdown:
================
Gross Salary: ₹${salaryData.basicSalary.toLocaleString()}

Deductions:
- PF (12%): ₹${salaryData.providentFund.toLocaleString()}
- ESI (4.75%): ₹${salaryData.esi.toLocaleString()}
- Professional Tax: ₹${salaryData.professionalTax.toLocaleString()}
${salaryData.lopDeduction > 0 ? `- Loss of Pay (LOP): ₹${salaryData.lopDeduction.toLocaleString()}\n` : ''}

Net Salary: ₹${salaryData.netSalary.toLocaleString()}
    `;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    );
    element.setAttribute('download', `payslip_${currentEmployee.id}_${selectedMonth}.txt`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('✅ Payslip downloaded successfully');
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  if (!currentEmployee || !salaryData) {
    return (
      <Alert severity="warning">
        No employees found or attendance data unavailable
      </Alert>
    );
  }

  return (
    <Box>
      {/* Employee and Month Selection */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Select Employee"
            select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.id})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Select Month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={handleViewPayslip}>
          View Payslip
        </Button>
        <Button variant="outlined" onClick={handleDownloadPayslip}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </Button>
        <Button variant="outlined" onClick={handlePrintPayslip}>
          <PrintIcon sx={{ mr: 1 }} />
          Print
        </Button>
      </Box>

      {/* Payslip Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Employee Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Employee ID:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{currentEmployee.id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Name:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{currentEmployee.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Department:</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {currentEmployee.department}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Designation:</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {currentEmployee.designation}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Attendance Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(attendanceBreakdown).map(([status, count]) => (
                <Box
                  key={status}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography variant="body2">{status}:</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{count} days</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Salary Breakdown */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Salary Breakdown - {selectedMonth}
          </Typography>

          <Grid container spacing={3}>
            {/* Earnings */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Earnings
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Gross Salary:</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    ₹{salaryData.basicSalary.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Deductions */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Deductions
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>PF (12%):</Typography>
                  <Typography>₹{salaryData.providentFund.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>ESI (4.75%):</Typography>
                  <Typography>₹{salaryData.esi.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Prof Tax:</Typography>
                  <Typography>₹{salaryData.professionalTax.toLocaleString()}</Typography>
                </Box>
                {salaryData.lopDeduction > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography>LOP:</Typography>
                    <Typography>₹{salaryData.lopDeduction.toLocaleString()}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 600 }}>Total Deductions:</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    ₹{salaryData.totalDeductions.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Net Salary */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: '#f3e5f5',
              borderRadius: 1,
              border: '2px solid #7c4dff',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Net Salary Payable:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c4dff' }}>
                ₹{salaryData.netSalary.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Payslip Dialog - Print Version */}
      <Dialog open={openPayslip} onClose={handleClosePayslip} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, backgroundColor: '#f5f5f5' }}>
          Payslip - {currentEmployee.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                EMPLOYEE PAYSLIP
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Salary Month: {selectedMonth}
              </Typography>
            </Box>

            {/* Employee Details */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Employee Details:
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {currentEmployee.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {currentEmployee.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Department:</strong> {currentEmployee.department}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Designation & Salary:
                </Typography>
                <Typography variant="body2">
                  <strong>Designation:</strong> {currentEmployee.designation}
                </Typography>
                <Typography variant="body2">
                  <strong>Gross Salary:</strong> ₹{salaryData.basicSalary.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Salary Breakdown Table */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Salary Breakdown:
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Particulars</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Gross Salary</TableCell>
                    <TableCell align="right">
                      ₹{salaryData.basicSalary.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Deductions:</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} />
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>PF (12%)</TableCell>
                    <TableCell align="right">₹{salaryData.providentFund.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>ESI (4.75%)</TableCell>
                    <TableCell align="right">₹{salaryData.esi.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Professional Tax</TableCell>
                    <TableCell align="right">
                      ₹{salaryData.professionalTax.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  {salaryData.lopDeduction > 0 && (
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Loss of Pay (LOP)</TableCell>
                      <TableCell align="right">₹{salaryData.lopDeduction.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Net Salary Payable:</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      ₹{salaryData.netSalary.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />

            {/* Footer */}
            <Box sx={{ textAlign: 'right', mt: 3 }}>
              <Typography variant="caption" color="textSecondary">
                Generated on: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePayslip}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayslipViewer;
