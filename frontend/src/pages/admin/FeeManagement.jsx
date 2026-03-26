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
  // State management
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]); // Original backend data
  const [filteredStudents, setFilteredStudents] = useState([]); // Filtered data
  const [selectedFilter, setSelectedFilter] = useState('all'); // Filter state
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalFees: 0,
    totalCollected: 0,
    totalDue: 0,
    completedCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    collectionRate: 0
  }); // Summary statistics with defaults
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openRecordPayment, setOpenRecordPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    amount: '',
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  // Fetch data from backend
  useEffect(() => {
    fetchFeesData();
  }, []);

  const fetchFeesData = async (status = 'all') => {
    try {
      setLoading(true);
      setErrorMessage(''); // Clear previous errors
      
      console.log('🔄 Fetching fees data with status:', status);
      
      const params = status !== 'all' ? { status } : {};
      const response = await adminAPI.getFees(params);
      
      console.log('📡 API Response:', response);
      console.log('📡 Response type:', typeof response);
      console.log('📡 Response keys:', Object.keys(response || {}));
      console.log('📡 Response.success:', response?.success);
      console.log('📡 Response.data length:', response?.data?.length);
      console.log('📡 Response.summary:', response?.summary);
      
      // The API interceptor already extracts response.data, so response IS the actual data
      if (response?.success) {
        const feeRecords = response.data || [];
        const summaryData = response.summary || {
          totalStudents: 0,
          totalFees: 0,
          totalCollected: 0,
          totalDue: 0,
          completedCount: 0,
          pendingCount: 0,
          overdueCount: 0,
          collectionRate: 0
        };
        
        console.log('✅ Fee records received:', feeRecords.length);
        console.log('📊 Summary data:', summaryData);
        
        // If summary is empty but we have data, calculate it manually
        if (feeRecords.length > 0 && summaryData.totalStudents === 0) {
          console.log('🔧 Calculating summary manually from fee records');
          const manualSummary = {
            totalStudents: feeRecords.length,
            totalFees: feeRecords.reduce((sum, fee) => sum + (fee.totalFee || 0), 0),
            totalCollected: feeRecords.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0),
            totalDue: feeRecords.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0),
            completedCount: feeRecords.filter(fee => fee.feeStatus === 'completed').length,
            pendingCount: feeRecords.filter(fee => fee.feeStatus === 'pending').length,
            overdueCount: feeRecords.filter(fee => fee.feeStatus === 'overdue').length,
            collectionRate: 0
          };
          manualSummary.collectionRate = manualSummary.totalFees > 0 ? 
            Math.round((manualSummary.totalCollected / manualSummary.totalFees) * 100) : 0;
          
          console.log('🔧 Manual summary:', manualSummary);
          setSummary(manualSummary);
        } else {
          setSummary(summaryData);
        }
        
        setStudents(feeRecords);
        setFilteredStudents(feeRecords);
        
        if (feeRecords.length === 0) {
          setErrorMessage('No fee records found. Please create fee records first.');
        }
      } else {
        console.error('❌ API response not successful:', response);
        setErrorMessage('Failed to load fee data - API response not successful');
      }
    } catch (error) {
      console.error('❌ Error fetching fees data:', error);
      setErrorMessage(`Failed to load fee data: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const applyFilter = (filterType) => {
    setSelectedFilter(filterType);
    setPage(0); // Reset pagination
    
    let filtered = [];
    
    switch (filterType) {
      case 'pending':
        filtered = students.filter(student => student.feeStatus === 'pending');
        break;
      case 'overdue':
        filtered = students.filter(student => student.feeStatus === 'overdue');
        break;
      case 'completed':
        filtered = students.filter(student => student.feeStatus === 'completed');
        break;
      default:
        filtered = students;
    }
    
    setFilteredStudents(filtered);
  };
  // Utility functions
  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const avatarColors = ['#4facfe', '#43e97b', '#fa709a', '#feca57', '#667eea', '#ff6b6b'];
  const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#E8F5E9', color: '#2E7D32', border: '#4CAF50' };
      case 'pending': return { bg: '#FFF8E1', color: '#F57F17', border: '#FFC107' };
      case 'overdue': return { bg: '#FFEBEE', color: '#C62828', border: '#F44336' };
      default: return { bg: '#F5F5F5', color: '#666', border: '#CCC' };
    }
  };

  // Event handlers
  const handleRecordPayment = (student) => {
    console.log('🎯 Recording payment for student:', student);
    setPaymentForm({
      studentId: student.student?.id || student.id || '',
      amount: (student.dueAmount || 0).toString(),
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

      const paymentData = {
        studentId: paymentForm.studentId,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId || undefined,
        remarks: paymentForm.remarks || undefined,
        status: 'completed'
      };

      await adminAPI.createPayment(paymentData);

      setSuccessMessage('Payment recorded successfully');
      setOpenRecordPayment(false);
      
      // Reset form
      setPaymentForm({
        studentId: '',
        amount: '',
        paymentMethod: 'cash',
        transactionId: '',
        remarks: ''
      });
      
      fetchFeesData(selectedFilter);
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to record payment');
    }
  };

  const handleImportFees = async (file) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      console.log('📤 Starting CSV import for file:', file.name);
      
      const response = await adminAPI.bulkImportFees(file, 'update');
      const result = response?.data || response;
      
      console.log('📥 Import response:', result);
      
      const created = result?.created ?? 0;
      const updated = result?.updated ?? 0;
      const skipped = result?.skipped ?? 0;
      const errorCount = Array.isArray(result?.errors) ? result.errors.length : 0;
      
      setSuccessMessage(`Import complete: created ${created}, updated ${updated}, skipped ${skipped}, errors ${errorCount}`);
      
      console.log('✅ Import completed, refreshing data...');
      
      // Force refresh data after import with a delay
      setTimeout(async () => {
        await fetchFeesData('all');
        setSelectedFilter('all');
        console.log('🔄 Data refreshed after import');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Import error:', error);
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

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
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
            <Button
              variant="outlined"
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                // Clear all state first
                setStudents([]);
                setFilteredStudents([]);
                setSummary({
                  totalStudents: 0,
                  totalFees: 0,
                  totalCollected: 0,
                  totalDue: 0,
                  completedCount: 0,
                  pendingCount: 0,
                  overdueCount: 0,
                  collectionRate: 0
                });
                setSelectedFilter('all');
                // Then fetch fresh data
                fetchFeesData('all');
              }}
              sx={{
                borderColor: '#9C27B0',
                color: '#9C27B0',
                '&:hover': { 
                  borderColor: '#7B1FA2',
                  bgcolor: 'rgba(156, 39, 176, 0.04)',
                  transform: 'translateY(-2px)' 
                },
                transition: 'all 0.3s ease',
              }}
            >
              🔄 Refresh
            </Button>
          </Box>
        </Box>
        {/* Summary Cards with Filtering */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* All Students Card */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card 
              onClick={() => applyFilter('all')}
              sx={{
                background: selectedFilter === 'all' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
                borderRadius: 3,
                boxShadow: selectedFilter === 'all' 
                  ? '0 8px 24px rgba(102, 126, 234, 0.4)' 
                  : '0 4px 12px rgba(255, 193, 7, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)' 
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ 
                  bgcolor: selectedFilter === 'all' ? 'rgba(255,255,255,0.2)' : '#FFC107', 
                  width: 50, height: 50, mx: 'auto', mb: 2 
                }}>
                  <AttachMoney sx={{ fontSize: 28, color: selectedFilter === 'all' ? 'white' : 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: selectedFilter === 'all' ? 'white' : '#F57F17', 
                  mb: 0.5 
                }}>
                  {summary?.totalStudents || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: selectedFilter === 'all' ? 'rgba(255,255,255,0.9)' : '#F57F17', 
                  fontWeight: 600 
                }}>
                  All Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Card */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card 
              onClick={() => applyFilter('pending')}
              sx={{
                background: selectedFilter === 'pending' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                borderRadius: 3,
                boxShadow: selectedFilter === 'pending' 
                  ? '0 8px 24px rgba(102, 126, 234, 0.4)' 
                  : '0 4px 12px rgba(255, 152, 0, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 12px 32px rgba(255, 152, 0, 0.3)' 
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ 
                  bgcolor: selectedFilter === 'pending' ? 'rgba(255,255,255,0.2)' : '#FF9800', 
                  width: 50, height: 50, mx: 'auto', mb: 2 
                }}>
                  <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: selectedFilter === 'pending' ? 'white' : '#E65100', 
                  mb: 0.5 
                }}>
                  {summary?.pendingCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: selectedFilter === 'pending' ? 'rgba(255,255,255,0.9)' : '#E65100', 
                  fontWeight: 600 
                }}>
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Overdue Card */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card 
              onClick={() => applyFilter('overdue')}
              sx={{
                background: selectedFilter === 'overdue' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                borderRadius: 3,
                boxShadow: selectedFilter === 'overdue' 
                  ? '0 8px 24px rgba(102, 126, 234, 0.4)' 
                  : '0 4px 12px rgba(244, 67, 54, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 12px 32px rgba(244, 67, 54, 0.3)' 
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ 
                  bgcolor: selectedFilter === 'overdue' ? 'rgba(255,255,255,0.2)' : '#F44336', 
                  width: 50, height: 50, mx: 'auto', mb: 2 
                }}>
                  <Warning sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: selectedFilter === 'overdue' ? 'white' : '#C62828', 
                  mb: 0.5 
                }}>
                  {summary?.overdueCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: selectedFilter === 'overdue' ? 'rgba(255,255,255,0.9)' : '#C62828', 
                  fontWeight: 600 
                }}>
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Card */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card 
              onClick={() => applyFilter('completed')}
              sx={{
                background: selectedFilter === 'completed' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                borderRadius: 3,
                boxShadow: selectedFilter === 'completed' 
                  ? '0 8px 24px rgba(102, 126, 234, 0.4)' 
                  : '0 4px 12px rgba(76, 175, 80, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 12px 32px rgba(76, 175, 80, 0.3)' 
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ 
                  bgcolor: selectedFilter === 'completed' ? 'rgba(255,255,255,0.2)' : '#4CAF50', 
                  width: 50, height: 50, mx: 'auto', mb: 2 
                }}>
                  <CheckCircle sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: selectedFilter === 'completed' ? 'white' : '#2E7D32', 
                  mb: 0.5 
                }}>
                  {summary?.completedCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: selectedFilter === 'completed' ? 'rgba(255,255,255,0.9)' : '#2E7D32', 
                  fontWeight: 600 
                }}>
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Collection Rate Card */}
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
                  {summary?.collectionRate || 0}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#0D47A1', fontWeight: 600 }}>Collection Rate</Typography>
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
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              {selectedFilter === 'all' ? 'All Students' : 
               selectedFilter === 'pending' ? 'Pending Payments' :
               selectedFilter === 'overdue' ? 'Overdue Payments' :
               selectedFilter === 'completed' ? 'Completed Payments' : 'Fee Records'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} found
            </Typography>
          </Box>
          
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
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: '#666', py: 4 }}>
                      {selectedFilter === 'all' ? 'No fee records found' : 
                       `No ${selectedFilter} payments found`}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student, index) => {
                    const statusStyle = getStatusColor(student.feeStatus);
                    return (
                      <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#f5f7fa' }, '& td': { color: '#1a1a1a', borderBottom: '1px solid #e0e0e0', py: 2 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(index), fontSize: '1rem', fontWeight: 700 }}>
                              {student.name?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                {student.name || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {student.studentId || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{student.class || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1976D2' }}>₹{(student.totalFee || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2E7D32' }}>₹{(student.paidAmount || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#F57F17' }}>₹{(student.dueAmount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {student.dueDate ? new Date(student.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.feeStatus === 'completed' ? 'Paid' : 
                                  student.feeStatus === 'pending' ? 'Pending' : 
                                  student.feeStatus === 'overdue' ? 'Overdue' : 'Unknown'}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 700,
                              border: `1px solid ${statusStyle.border}`,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {student.feeStatus !== 'completed' && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Send />}
                              onClick={() => handleRecordPayment(student)}
                              sx={{
                                bgcolor: '#4CAF50',
                                color: 'white',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                py: 0.75,
                                px: 2,
                                '&:hover': { bgcolor: '#45A049' }
                              }}
                            >
                              Record Payment
                            </Button>
                          )}
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
            count={filteredStudents.length}
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
                    {formatCurrency(summary?.totalFees || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    Total Fees
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#2E7D32', mb: 0.5 }}>
                    {formatCurrency(summary?.totalCollected || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    Total Collected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#F57F17', mb: 0.5 }}>
                    {formatCurrency(summary?.totalDue || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    Total Due
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0D47A1', mb: 0.5 }}>
                    {summary?.totalStudents || 0}
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
                    <MenuItem key={student.id} value={student.student?.id || student.id}>
                      {student.name || 'Unknown'} - {student.studentId || 'N/A'} ({student.class || 'N/A'})
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