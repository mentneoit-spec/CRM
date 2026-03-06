import React, { useState } from 'react';
import {
  Container, Box, Card, CardContent, Grid, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Stack,
  Typography, Alert, LinearProgress, Tabs, Tab, CardHeader, Divider
} from '@mui/material';
import {
  Download as DownloadIcon, Edit as EditIcon, Check as CheckIcon,
  Close as CloseIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';

const AdmissionsManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [admissions, setAdmissions] = useState([
    {
      id: 1,
      admissionNumber: 'ADM2024001',
      applicantName: 'Arjun Kumar',
      applicantEmail: 'arjun@email.com',
      applicantPhone: '9876543210',
      dateOfBirth: '2008-05-15',
      gender: 'Male',
      fatherName: 'Rajesh Kumar',
      motherName: 'Sunita Kumar',
      address: '123 Main Street',
      appliedFor: 'Class 10',
      appliedDate: '2024-02-01',
      status: 'Pending',
      documents: ['Birth Certificate', 'Previous School Certificate'],
      comments: 'Good academic record'
    },
    {
      id: 2,
      admissionNumber: 'ADM2024002',
      applicantName: 'Priya Singh',
      applicantEmail: 'priya@email.com',
      applicantPhone: '9876543211',
      dateOfBirth: '2009-03-20',
      gender: 'Female',
      fatherName: 'Vikram Singh',
      motherName: 'Neha Singh',
      address: '456 Oak Avenue',
      appliedFor: 'Class 9',
      appliedDate: '2024-02-10',
      status: 'Approved',
      documents: ['Birth Certificate', 'Previous School Certificate', 'Medical Report'],
      comments: 'All documents verified'
    },
    {
      id: 3,
      admissionNumber: 'ADM2024003',
      applicantName: 'Rahul Patel',
      applicantEmail: 'rahul@email.com',
      applicantPhone: '9876543212',
      dateOfBirth: '2007-08-10',
      gender: 'Male',
      fatherName: 'Dinesh Patel',
      motherName: 'Deepa Patel',
      address: '789 Pine Road',
      appliedFor: 'Class 11',
      appliedDate: '2024-02-05',
      status: 'Rejected',
      documents: ['Birth Certificate'],
      comments: 'Age limit exceeded'
    }
  ]);

  const [statusForm, setStatusForm] = useState({
    status: 'Pending',
    comments: ''
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStatusChange = (admission) => {
    setSelectedAdmission(admission);
    setStatusForm({ status: admission.status, comments: admission.comments || '' });
    setOpenDialog(true);
  };

  const handleStatusSubmit = () => {
    setAdmissions(admissions.map(a =>
      a.id === selectedAdmission.id
        ? { ...a, status: statusForm.status, comments: statusForm.comments }
        : a
    ));
    setOpenDialog(false);
  };

  const handleViewDetails = (admission) => {
    setSelectedAdmission(admission);
    setOpenDetailsDialog(true);
  };

  const filteredAdmissions = filterStatus === 'all'
    ? admissions
    : admissions.filter(a => a.status === filterStatus);

  const stats = {
    total: admissions.length,
    pending: admissions.filter(a => a.status === 'Pending').length,
    approved: admissions.filter(a => a.status === 'Approved').length,
    rejected: admissions.filter(a => a.status === 'Rejected').length
  };

  const conversionRate = stats.total > 0 ? (stats.approved / stats.total * 100).toFixed(1) : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Admissions Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Process and track student admission applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Applications', value: stats.total, color: '#2196F3' },
          { label: 'Pending', value: stats.pending, color: '#FFC107' },
          { label: 'Approved', value: stats.approved, color: '#4CAF50' },
          { label: 'Rejected', value: stats.rejected, color: '#F44336' }
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}05 100%)`, borderLeft: `4px solid ${stat.color}` }}>
              <CardContent>
                <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Conversion Rate */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Approval Conversion Rate
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {conversionRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={conversionRate}
            sx={{
              height: 10,
              borderRadius: '5px',
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': { backgroundColor: '#4CAF50' }
            }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Applications" />
            <Tab label="Pending Review" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Filter and Export */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export Applications
            </Button>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Application No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Applicant Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Applied For</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Applied Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmissions.map((admission) => (
                  <TableRow key={admission.id} hover>
                    <TableCell sx={{ fontWeight: '500' }}>{admission.admissionNumber}</TableCell>
                    <TableCell>{admission.applicantName}</TableCell>
                    <TableCell>{admission.appliedFor}</TableCell>
                    <TableCell>{admission.appliedDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={admission.status}
                        color={
                          admission.status === 'Approved'
                            ? 'success'
                            : admission.status === 'Rejected'
                              ? 'error'
                              : 'warning'
                        }
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(admission)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditIcon />}
                          onClick={() => handleStatusChange(admission)}
                        >
                          Update
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Applicant: {selectedAdmission?.applicantName}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Comments/Reason"
              multiline
              rows={3}
              value={statusForm.comments}
              onChange={(e) => setStatusForm({ ...statusForm, comments: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusSubmit} variant="contained" color="primary">Update Status</Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAdmission && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="textSecondary">Admission Number</Typography>
                <Typography sx={{ fontWeight: '500' }}>{selectedAdmission.admissionNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Applicant Information</Typography>
                <Typography>{selectedAdmission.applicantName}</Typography>
                <Typography variant="caption">{selectedAdmission.applicantEmail} | {selectedAdmission.applicantPhone}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="textSecondary">Parents</Typography>
                <Typography variant="caption">Father: {selectedAdmission.fatherName}</Typography>
                <Typography variant="caption">Mother: {selectedAdmission.motherName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Documents</Typography>
                {selectedAdmission.documents.map((doc, idx) => (
                  <Chip key={idx} label={doc} size="small" sx={{ mr: 1, mt: 1 }} />
                ))}
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Comments</Typography>
                <Typography>{selectedAdmission.comments}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdmissionsManagement;
