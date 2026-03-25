import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Avatar
} from '@mui/material';
import {
  AttachMoney, TrendingUp, Warning, CheckCircle, Send, FileDownload, Notifications
} from '@mui/icons-material';

const FeeManagementDashboard = ({ feeData }) => {
  if (!feeData) return null;

  const {
    totalDues = 0,
    totalCollected = 0,
    totalPending = 0,
    overallCollectionRate = 0,
    overdueStudents = 0,
    recentFees = [],
  } = feeData;

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const avatarColors = ['#4facfe', '#43e97b', '#fa709a', '#feca57', '#667eea', '#ff6b6b'];
  const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

  return (
    <Box 
      sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        borderRadius: 3,
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'stars\' x=\'0\' y=\'0\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'1\' fill=\'rgba(255,255,255,0.3)\'/%3E%3Ccircle cx=\'50\' cy=\'30\' r=\'1.5\' fill=\'rgba(255,255,255,0.2)\'/%3E%3Ccircle cx=\'80\' cy=\'60\' r=\'1\' fill=\'rgba(255,255,255,0.4)\'/%3E%3Ccircle cx=\'30\' cy=\'80\' r=\'1\' fill=\'rgba(255,255,255,0.3)\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23stars)\'/%3E%3C/svg%3E")',
          opacity: 0.3,
          pointerEvents: 'none',
        }
      }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
            Fee Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Track, collect, and remind • AY 2025-26
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            sx={{
              bgcolor: 'rgba(79, 172, 254, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(79, 172, 254, 0.3)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(79, 172, 254, 0.3)', transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease',
            }}
          >
            Export Defaulters
          </Button>
          <Button
            variant="contained"
            startIcon={<Notifications />}
            sx={{
              bgcolor: 'rgba(245, 87, 108, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 87, 108, 0.3)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(245, 87, 108, 0.3)', transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease',
            }}
          >
            Send Reminders
          </Button>
          <Button
            variant="contained"
            startIcon={<AttachMoney />}
            sx={{
              bgcolor: 'rgba(67, 233, 123, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(67, 233, 123, 0.3)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(67, 233, 123, 0.3)', transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease',
            }}
          >
            Record Payment
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(255, 193, 7, 0.3)', width: 50, height: 50, mx: 'auto', mb: 2, border: '2px solid rgba(255, 193, 7, 0.5)' }}>
                <AttachMoney sx={{ fontSize: 28, color: '#ffc107' }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                {formatCurrency(totalDues)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Total Dues</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(67, 233, 123, 0.3)', width: 50, height: 50, mx: 'auto', mb: 2, border: '2px solid rgba(67, 233, 123, 0.5)' }}>
                <CheckCircle sx={{ fontSize: 28, color: '#43e97b' }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                {formatCurrency(totalCollected)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Collected</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(255, 152, 0, 0.3)', width: 50, height: 50, mx: 'auto', mb: 2, border: '2px solid rgba(255, 152, 0, 0.5)' }}>
                <TrendingUp sx={{ fontSize: 28, color: '#ff9800' }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                {formatCurrency(totalPending)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Pending</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(79, 172, 254, 0.3)', width: 50, height: 50, mx: 'auto', mb: 2, border: '2px solid rgba(79, 172, 254, 0.5)' }}>
                <TrendingUp sx={{ fontSize: 28, color: '#4facfe' }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                {overallCollectionRate}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Collection Rate</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(244, 67, 54, 0.3)', width: 50, height: 50, mx: 'auto', mb: 2, border: '2px solid rgba(244, 67, 54, 0.5)' }}>
                <Warning sx={{ fontSize: 28, color: '#f44336' }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                {overdueStudents}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Overdue Students</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {recentFees.length > 0 && (
        <Card sx={{ 
          borderRadius: 3, 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          zIndex: 1,
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255, 255, 255, 0.05)', '& th': { color: 'rgba(255,255,255,0.9)', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', py: 2 } }}>
                  <TableCell>STUDENT</TableCell>
                  <TableCell>CLASS</TableCell>
                  <TableCell>DUE AMOUNT</TableCell>
                  <TableCell>PAID AMOUNT</TableCell>
                  <TableCell>DUE DATE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentFees.map((fee, index) => (
                  <TableRow key={fee.id} sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }, '& td': { color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', py: 2 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(index), fontSize: '1rem', fontWeight: 700 }}>
                          {fee.student?.name?.charAt(0) || 'S'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                          {fee.student?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{fee.student?.sclass?.sclassName || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#ffc107' }}>₹{fee.amount?.toLocaleString() || 0}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#43e97b' }}>₹{fee.paidAmount?.toLocaleString() || 0}</TableCell>
                    <TableCell>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={fee.status === 'paid' ? 'Paid' : fee.status === 'pending' ? 'Pending' : 'Overdue'}
                        size="small"
                        sx={{
                          bgcolor: fee.status === 'paid' ? 'rgba(67, 233, 123, 0.2)' : fee.status === 'pending' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                          color: fee.status === 'paid' ? '#43e97b' : fee.status === 'pending' ? '#ffc107' : '#f44336',
                          fontWeight: 700,
                          border: `1px solid ${fee.status === 'paid' ? 'rgba(67, 233, 123, 0.3)' : fee.status === 'pending' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Send />}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default FeeManagementDashboard;
