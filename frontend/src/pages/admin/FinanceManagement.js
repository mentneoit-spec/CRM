import React, { useState } from 'react';
import {
  Container, Box, Card, CardContent, Grid, Tab, Tabs, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Stack,
  Typography, Alert, CircularProgress, LinearProgress
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Download as DownloadIcon, Print as PrintIcon, Add as AddIcon
} from '@mui/icons-material';

const FinanceManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openFeeDialog, setOpenFeeDialog] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    studentId: '', amount: 0, paymentMethod: 'razorpay', status: 'completed'
  });

  const [feeForm, setFeeForm] = useState({
    studentId: '', feeType: 'tuition', amount: 50000, dueDate: '', frequency: 'yearly'
  });

  // Mock data
  const students = [
    { id: 1, name: 'Arjun Kumar', class: '10A', totalFeeAmount: 100000, paidAmount: 50000, dueAmount: 50000, dueDate: '2024-03-31' },
    { id: 2, name: 'Priya Singh', class: '10A', totalFeeAmount: 100000, paidAmount: 100000, dueAmount: 0, dueDate: '2024-02-28' },
    { id: 3, name: 'Rahul Patel', class: '9B', totalFeeAmount: 90000, paidAmount: 45000, dueAmount: 45000, dueDate: '2024-04-15' }
  ];

  const payments = [
    { id: 1, studentName: 'Arjun Kumar', amount: 50000, date: '2024-02-01', method: 'Razorpay', status: 'Completed' },
    { id: 2, studentName: 'Priya Singh', amount: 100000, date: '2024-01-15', method: 'Bank Transfer', status: 'Completed' },
    { id: 3, studentName: 'Rahul Patel', amount: 45000, date: '2024-01-20', method: 'UPI', status: 'Pending' }
  ];

  const financialStats = {
    totalCollected: 3500000,
    totalPending: 850000,
    totalStudents: 1250,
    collectionRate: 80.4
  };

  const monthlyRevenue = [
    { month: 'Jan', collected: 420000, pending: 80000 },
    { month: 'Feb', collected: 500000, pending: 50000 },
    { month: 'Mar', collected: 480000, pending: 120000 }
  ];

  const feeDistribution = [
    { name: 'Tuition Fee', value: 2000000 },
    { name: 'Transport', value: 600000 },
    { name: 'Exam Fee', value: 300000 },
    { name: 'Hostel', value: 250000 }
  ];

  const COLORS = ['#2196F3', '#4CAF50', '#FFC107', '#F44336'];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddPayment = () => {
    setOpenPaymentDialog(true);
  };

  const handlePaymentSubmit = () => {
    setOpenPaymentDialog(false);
    setPaymentForm({ studentId: '', amount: 0, paymentMethod: 'razorpay', status: 'completed' });
  };

  const handleAddFee = () => {
    setOpenFeeDialog(true);
  };

  const handleFeeSubmit = () => {
    setOpenFeeDialog(false);
    setFeeForm({ studentId: '', feeType: 'tuition', amount: 50000, dueDate: '', frequency: 'yearly' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Finance & Payments Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage fees, payments, and financial records
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Collected', value: `₹${(financialStats.totalCollected / 100000).toFixed(1)}L`, color: '#4CAF50' },
          { label: 'Pending Amount', value: `₹${(financialStats.totalPending / 100000).toFixed(2)}L`, color: '#FFC107' },
          { label: 'Collection Rate', value: `${financialStats.collectionRate}%`, color: '#2196F3' }
        ].map((metric, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ background: `linear-gradient(135deg, ${metric.color}20 0%, ${metric.color}05 100%)` }}>
              <CardContent>
                <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                  {metric.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                  {metric.value}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={financialStats.collectionRate}
                  sx={{ mt: 1, backgroundColor: `${metric.color}20`, '& .MuiLinearProgress-bar': { backgroundColor: metric.color } }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Monthly Collection Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collected" fill="#4CAF50" name="Collected" />
                  <Bar dataKey="pending" fill="#FFC107" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Fee Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value / 100000}L`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value / 100000}L`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Fee Status by Student" />
            <Tab label="Payment History" />
            <Tab label="Pending Fees" />
          </Tabs>
        </Box>

        {/* Fee Status Tab */}
        {tabValue === 0 && (
          <CardContent>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddFee}>
                Add Fee
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Fee</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Paid</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Due</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>₹{student.totalFeeAmount}</TableCell>
                      <TableCell sx={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{student.paidAmount}</TableCell>
                      <TableCell sx={{ color: student.dueAmount > 0 ? '#F44336' : '#4CAF50', fontWeight: 'bold' }}>
                        ₹{student.dueAmount}
                      </TableCell>
                      <TableCell>{student.dueDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.dueAmount === 0 ? 'Paid' : 'Pending'}
                          color={student.dueAmount === 0 ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Payment History Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPayment}>
                Record Payment
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />}>
                Print
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>{payment.studentName}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>₹{payment.amount}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={payment.status === 'Completed' ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Pending Fees Tab */}
        {tabValue === 2 && (
          <CardContent>
            {students.filter(s => s.dueAmount > 0).map((student) => (
              <Box
                key={student.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {student.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Class {student.class} • Due: {student.dueDate}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ color: '#F44336', fontWeight: 'bold' }}>
                    ₹{student.dueAmount}
                  </Typography>
                  <Button variant="contained" size="small" sx={{ mt: 1 }}>
                    Send Reminder
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={paymentForm.studentId}
                onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                label="Student"
              >
                {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                label="Payment Method"
              >
                <MenuItem value="razorpay">Razorpay</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" color="primary">Submit Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Fee Dialog */}
      <Dialog open={openFeeDialog} onClose={() => setOpenFeeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Fee</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select value={feeForm.studentId} onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })} label="Student">
                {students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Fee Type</InputLabel>
              <Select value={feeForm.feeType} onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })} label="Fee Type">
                <MenuItem value="tuition">Tuition Fee</MenuItem>
                <MenuItem value="transport">Transport Fee</MenuItem>
                <MenuItem value="exam">Exam Fee</MenuItem>
                <MenuItem value="hostel">Hostel Fee</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Amount" type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} fullWidth />
            <TextField label="Due Date" type="date" value={feeForm.dueDate} onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFeeDialog(false)}>Cancel</Button>
          <Button onClick={handleFeeSubmit} variant="contained" color="primary">Add Fee</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FinanceManagement;
