import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Paper
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  School,
  CalendarToday,
  Payment,
  Home,
  AccountCircle
} from '@mui/icons-material';

const StudentDetailsModal = ({ open, onClose, student }) => {
  if (!student) return null;

  const InfoRow = ({ icon: Icon, label, value, color = 'primary' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Avatar sx={{ bgcolor: `${color}.light`, mr: 2, width: 40, height: 40 }}>
        <Icon sx={{ color: `${color}.main`, fontSize: 20 }} />
      </Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
          <Person sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Student Details
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Complete information about the student
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#667eea' }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={Person} 
                    label="Full Name" 
                    value={student.name}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={AccountCircle} 
                    label="Student ID / Roll No" 
                    value={student.studentId}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={Email} 
                    label="Email Address" 
                    value={student.email}
                    color="info"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={Phone} 
                    label="Contact Number" 
                    value={student.phone}
                    color="success"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Academic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#f5576c' }}>
                Academic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={School} 
                    label="Class" 
                    value={student.sclass?.sclassName}
                    color="error"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={School} 
                    label="Section" 
                    value={student.section?.sectionName}
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={CalendarToday} 
                    label="Admission Date" 
                    value={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    color="info"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.light', mr: 2, width: 40, height: 40 }}>
                      <Payment sx={{ color: 'success.main', fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Fee Status
                      </Typography>
                      <Chip 
                        label={student.feeStatus || 'Pending'} 
                        size="small" 
                        color={student.feeStatus === 'Paid' ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Parent/Guardian Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#43e97b' }}>
                Parent/Guardian Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={Person} 
                    label="Parent Name" 
                    value={student.parentName}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow 
                    icon={Phone} 
                    label="Parent Contact" 
                    value={student.parentPhone}
                    color="success"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Address Information (if available) */}
          {student.address && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#4facfe' }}>
                  Address Information
                </Typography>
                <InfoRow 
                  icon={Home} 
                  label="Address" 
                  value={student.address}
                  color="info"
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailsModal;
