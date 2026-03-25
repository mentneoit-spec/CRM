import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Alert, TablePagination
} from '@mui/material';
import {
  AttachMoney, TrendingUp, Warning, CheckCircle, Send, CloudUpload, Notifications, Add
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../config/api';

const FeeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const [allFees, setAllFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openRecordPayment, setOpenRecordPayment] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    amount: '',
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  useEffect(() => {
    fetchFeeManagementData();
    fetchAllFees();
    fetchStudents();
  }, []);

  const fetchFeeManagementData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setFeeData(response?.data?.feeManagement || null);
    } catch (error) {
      console.error('Error fetching fee management data:', error);
      setErrorMessage('Failed to load fee management data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFees = async () => {
    try {
      const response = await adminAPI.getFees();
      setAllFees(response?.data || []);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await adminAPI.getStudents();
      setStudents(response?.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const avatarColors = ['#4facfe', '#43e97b', '#fa709a', '#feca57', '#667eea', '#ff6b6b'];
  const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

  const handleRecordPayment = (fee) => {
    setSelectedFee(fee);
    setPaymentForm({
      studentId: fee.student?.id || '',
      amount: '',
      paymentMethod: 'cash',
      transactionId: '',
      remarks: ''
    });
    setOpenRecordPayment(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      if (!paymentForm.studentId || !paymentForm.amount) {
        setErrorMessage('Student and amount are required');
        return;
      }

      await adminAPI.createPayment({
        studentId: paymentForm.studentId,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId || undefined,
        remarks: paymentForm.remarks || undefined,
        status: 'completed'
      });

      setSuccessMessage('Payment recorded successfully');
      setOpenRecordPayment(false);
      fetchFeeManagementData();
      fetchAllFees();
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to record payment');
    }
  };

  const handleSendReminder = async (fee) => {
    try {
      // Implement send reminder functionality
      setSuccessMessage(`Reminder sent to ${fee.student?.name}`);
    } catch (error) {
      setErrorMessage('Failed to send reminder');
    }
  };

  const handleImportFees = async (file) => {
    try {
      setLoading(true);
      const response = await adminAPI.bulkImportFees(file, 'update');
      const result = response?.data;
      const created = result?.created ?? 0;
      const updated = result?.updated ?? 0;
      const skipped = result?.skipped ?? 0;
      const errorCount = Array.isArray(result?.errors) ? result.errors.length : 0;
      setSuccessMessage(`Import complete: created ${created}, updated ${updated}, skipped ${skipped}, errors ${errorCount}`);
      fetchFeeManagementData();
      fetchAllFees();
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to import fees CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  const recentFees = feeData?.recentFees || [];
  const paginatedFees = allFees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <DashboardLayout role="admin">
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: '#f5f7fa',
          p: 4,
        }}
      >
        {/* Alerts */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
              Fee Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Track, collect, and remind • AY 2025-26
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{
                borderColor: '#2196F3',
                color: '#2196F3',
                '&:hover': { 
                  borderColor: '#1976D2',
                  bgcolor: 'rgba(33, 150, 243, 0.04)',
                  transform: 'translateY(-2px)' 
                },
                transition: 'all 0.3s ease',
              }}
            >
              Import Fees CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportFees(file);
                  }
                  e.target.value = '';
                }}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<Notifications />}
              sx={{
                borderColor: '#FF9800',
                color: '#FF9800',
                '&:hover': { 
                  borderColor: '#F57C00',
                  bgcolor: 'rgba(255, 152, 0, 0.04)',
                  transform: 'translateY(-2px)' 
                },
                transition: 'all 0.3s ease',
              }}
            >
              Send Reminders
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenRecordPayment(true)}
              sx={{
                bgcolor: '#4CAF50',
                color: 'white',
                '&:hover': { 
                  bgcolor: '#45A049',
                  transform: 'translateY(-2px)' 
                },
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              }}
            >
              Record Payment
            </Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(255, 193, 7, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(255, 193, 7, 0.25)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#FFC107', width: 50, height: 50, mx: 'auto', mb: 2 }}>
                  <AttachMoney sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#F57F17', mb: 0.5 }}>
                  {formatCurrency(feeData?.totalDues || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#F57F17', fontWeight: 600 }}>Total Dues</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(76, 175, 80, 0.25)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#4CAF50', width: 50, height: 50, mx: 'auto', mb: 2 }}>
                  <CheckCircle sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#2E7D32', mb: 0.5 }}>
                  {formatCurrency(feeData?.totalCollected || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>Collected</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(255, 152, 0, 0.25)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#FF9800', width: 50, height: 50, mx: 'auto', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#E65100', mb: 0.5 }}>
                  {formatCurrency(feeData?.totalPending || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#E65100', fontWeight: 600 }}>Pending</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(33, 150, 243, 0.25)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#2196F3', width: 50, height: 50, mx: 'auto', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0D47A1', mb: 0.5 }}>
                  {feeData?.overallCollectionRate || 0}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#0D47A1', fontWeight: 600 }}>Collection Rate</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(244, 67, 54, 0.25)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#F44336', width: 50, height: 50, mx: 'auto', mb: 2 }}>
                  <Warning sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#C62828', mb: 0.5 }}>
                  {feeData?.overdueStudents || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#C62828', fontWeight: 600 }}>Overdue Students</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Fee Records Table */}
        <Card sx={{ 
          borderRadius: 3, 
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa', '& th': { color: '#1a1a1a', fontWeight: 700, borderBottom: '2px solid #e0e0e0', py: 2 } }}>
                  <TableCell>STUDENT</TableCell>
                  <TableCell>CLASS</TableCell>
                  <TableCell>TOTAL FEE</TableCell>
                  <TableCell>PAID AMOUNT</TableCell>
                  <TableCell>DUE AMOUNT</TableCell>
                  <TableCell>DUE DATE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: '#666', py: 4 }}>
                      No fee records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFees.map((fee, index) => {
                    const status = fee.isActive ? 'pending' : 'paid';
                    return (
                      <TableRow key={fee.id} sx={{ '&:hover': { bgcolor: '#f5f7fa' }, '& td': { color: '#1a1a1a', borderBottom: '1px solid #e0e0e0', py: 2 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(index), fontSize: '1rem', fontWeight: 700 }}>
                              {fee.student?.name?.charAt(0) || 'S'}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                              {fee.student?.name || 'Unknown'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{fee.student?.sclass?.sclassName || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1976D2' }}>₹{fee.amount?.toLocaleString() || 0}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2E7D32' }}>₹0</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#F57F17' }}>₹{fee.amount?.toLocaleString() || 0}</TableCell>
                        <TableCell>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={status === 'paid' ? 'Paid' : 'Pending'}
                            size="small"
                            sx={{
                              bgcolor: status === 'paid' ? '#E8F5E9' : '#FFF8E1',
                              color: status === 'paid' ? '#2E7D32' : '#F57F17',
                              fontWeight: 700,
                              border: `1px solid ${status === 'paid' ? '#4CAF50' : '#FFC107'}`,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Send />}
                            onClick={() => handleSendReminder(fee)}
                            sx={{
                              bgcolor: 'rgba(79, 172, 254, 0.2)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(79, 172, 254, 0.3)',
                              color: 'white',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              py: 0.75,
                              px: 2,
                              '&:hover': { bgcolor: 'rgba(79, 172, 254, 0.3)' }
                            }}
                          >
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={allFees.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ 
              color: '#1a1a1a',
              borderTop: '1px solid #e0e0e0',
              '& .MuiTablePagination-select': { color: '#1a1a1a' },
              '& .MuiTablePagination-selectIcon': { color: '#1a1a1a' },
              '& .MuiTablePagination-displayedRows': { color: '#1a1a1a' }
            }}
          />
        </Card>

        {/* Summary Card at Bottom */}
        <Card sx={{ 
          mt: 4,
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
          boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)',
        }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2E7D32', mb: 3, textAlign: 'center' }}>
              Fee Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976D2', mb: 0.5 }}>
                    {formatCurrency(allFees.reduce((sum, fee) => sum + (fee.amount || 0), 0))}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    Total Fees
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2E7D32', mb: 0.5 }}>
                    ₹0
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    Total Collected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#F57F17', mb: 0.5 }}>
                    {formatCurrency(allFees.reduce((sum, fee) => sum + (fee.amount || 0), 0))}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    Total Due
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0D47A1', mb: 0.5 }}>
                    {allFees.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    Total Students
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Record Payment Dialog */}
        <Dialog open={openRecordPayment} onClose={() => setOpenRecordPayment(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Record Payment</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select
                  value={paymentForm.studentId}
                  label="Student"
                  onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} - {student.studentId} ({student.sclass?.sclassName || 'N/A'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                inputProps={{ min: 0 }}
              />

              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentForm.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Transaction ID (Optional)"
                fullWidth
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
              />

              <TextField
                label="Remarks (Optional)"
                fullWidth
                multiline
                rows={3}
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenRecordPayment(false)}>Cancel</Button>
            <Button variant="contained" onClick={handlePaymentSubmit}>
              Record Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default FeeManagement;
