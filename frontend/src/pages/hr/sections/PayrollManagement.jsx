import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Check as CheckIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { calculateSalary, payrollStatus as payrollStatusColors } from '../../../data/hr-data/payroll';
import { workingDaysPerMonth } from '../../../data/hr-data/attendance';

const PayrollManagement = ({ employees, attendance }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [processedPayroll, setProcessedPayroll] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Filter attendance records for selected month
  const monthlyAttendance = useMemo(() => {
    return attendance.filter((record) => record.date.startsWith(selectedMonth));
  }, [attendance, selectedMonth]);

  // Generate payroll for all employees
  const generatePayroll = useMemo(() => {
    return employees.map((employee) => {
      const salaryData = calculateSalary(employee, monthlyAttendance, workingDaysPerMonth);
      return {
        empId: employee.id,
        empName: employee.name,
        department: employee.department,
        designation: employee.designation,
        ...salaryData,
        status: 'Pending',
      };
    });
  }, [employees, monthlyAttendance]);

  const handleProcessPayroll = () => {
    const processed = generatePayroll.map((item) => ({
      ...item,
      status: 'Processed',
      processedDate: new Date().toISOString().split('T')[0],
    }));
    setProcessedPayroll(processed);
    alert('✅ Payroll processed successfully for ' + selectedMonth);
  };

  const handlePreviewSalary = (payrollItem) => {
    setPreviewData(payrollItem);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewData(null);
  };

  const handleDownloadPayroll = () => {
    if (processedPayroll.length === 0) {
      alert('⚠️ Please process payroll first');
      return;
    }

    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Employee ID,Name,Department,Gross,PF,ESI,Prof Tax,Net\n';

    processedPayroll.forEach((item) => {
      const row = [
        item.empId,
        item.empName,
        item.department,
        item.basicSalary,
        item.providentFund,
        item.esi,
        item.professionalTax,
        item.netSalary,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payroll_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✅ Payroll downloaded successfully');
  };

  const totalGross = useMemo(
    () => generatePayroll.reduce((sum, item) => sum + item.basicSalary, 0),
    [generatePayroll]
  );

  const totalDeductions = useMemo(
    () => generatePayroll.reduce((sum, item) => sum + item.totalDeductions, 0),
    [generatePayroll]
  );

  const totalNet = useMemo(
    () => generatePayroll.reduce((sum, item) => sum + item.netSalary, 0),
    [generatePayroll]
  );

  return (
    <Box>
      {/* Month Selector and Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Select Month"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleProcessPayroll}>
          <CheckIcon sx={{ mr: 1 }} />
          Process Payroll
        </Button>
        <Button
          variant="outlined"
          onClick={handleDownloadPayroll}
          disabled={processedPayroll.length === 0}
        >
          <DownloadIcon sx={{ mr: 1 }} />
          Download CSV
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Gross Salary
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ₹{totalGross.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Deductions
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                ₹{totalDeductions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Net Salary
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                ₹{totalNet.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Alert */}
      <Alert severity={processedPayroll.length > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
        {processedPayroll.length > 0
          ? `✅ Payroll processed for ${selectedMonth}`
          : '⚠️ Payroll not yet processed for this month'}
      </Alert>

      {/* Payroll Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Gross
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Deductions
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Net
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Preview
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {generatePayroll.map((item) => {
              const processed = processedPayroll.find((p) => p.empId === item.empId);
              const status = processed ? processed.status : 'Pending';
              return (
                <TableRow key={item.empId} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{item.empId}</TableCell>
                  <TableCell>{item.empName}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell align="right">
                    ₹{item.basicSalary.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    ₹{item.totalDeductions.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹{item.netSalary.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      color={status === 'Processed' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handlePreviewSalary(item)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Preview Dialog */}
      <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Salary Breakdown - {previewData?.empName}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {previewData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Earnings:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Gross Salary:</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    ₹{previewData.basicSalary.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Deductions:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>PF (12%):</Typography>
                  <Typography>₹{previewData.providentFund.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>ESI (4.75%):</Typography>
                  <Typography>₹{previewData.esi.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Professional Tax:</Typography>
                  <Typography>₹{previewData.professionalTax.toLocaleString()}</Typography>
                </Box>
                {previewData.lopDeduction > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography>Loss of Pay (LOP):</Typography>
                    <Typography>₹{previewData.lopDeduction.toLocaleString()}</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700 }}>Net Salary:</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#2e7d32' }}>
                    ₹{previewData.netSalary.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollManagement;
