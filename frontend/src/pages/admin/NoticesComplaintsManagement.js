import React, { useState } from 'react';
import {
  Container, Box, Card, CardContent, Grid, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Stack,
  Typography, Tab, Tabs, Divider, CardHeader, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Done as DoneIcon, Reply as ReplyIcon, Attachment as AttachmentIcon
} from '@mui/icons-material';

const NoticesComplaintsManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [notices, setNotices] = useState([
    {
      id: 1,
      title: 'Annual Examination Schedule',
      description: 'The annual examinations will be held from March 15-31, 2024',
      category: 'Academic',
      priority: 'High',
      publishedDate: '2024-02-28',
      createdBy: 'Admin',
      isActive: true
    },
    {
      id: 2,
      title: 'Holiday Announcement',
      description: 'School will remain closed on March 8 (Women\'s Day)',
      category: 'Holiday',
      priority: 'Normal',
      publishedDate: '2024-02-25',
      createdBy: 'Admin',
      isActive: true
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting',
      description: 'PTM scheduled for all classes on March 22, 2024',
      category: 'Event',
      priority: 'High',
      publishedDate: '2024-02-20',
      createdBy: 'Admin',
      isActive: false
    }
  ]);

  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: 'Lab Equipment Not Working',
      description: 'Microscopes in the biology lab are not functioning properly',
      category: 'Facilities',
      priority: 'High',
      status: 'Pending',
      submittedBy: 'Teacher - Dr. Sharma',
      submittedDate: '2024-03-01',
      adminResponse: ''
    },
    {
      id: 2,
      title: 'Classroom Air Conditioning',
      description: 'AC in Class 10A is not working, temperature is too high',
      category: 'Facilities',
      priority: 'High',
      status: 'Resolved',
      submittedBy: 'Student - Arjun',
      submittedDate: '2024-02-28',
      adminResponse: 'AC has been repaired. Should be working now.'
    },
    {
      id: 3,
      title: 'Syllabus Doubt',
      description: 'Chapter 5 syllabus is not clear, needs explanation',
      category: 'Academic',
      priority: 'Normal',
      status: 'Pending',
      submittedBy: 'Student - Priya',
      submittedDate: '2024-03-02',
      adminResponse: ''
    }
  ]);

  const [formData, setFormData] = useState({
    title: '', description: '', category: '', priority: 'Normal', attachments: []
  });

  const [replyForm, setReplyForm] = useState({ response: '' });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddNotice = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', category: '', priority: 'Normal', attachments: [] });
    setOpenDialog(true);
  };

  const handleEditNotice = (notice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      description: notice.description,
      category: notice.category,
      priority: notice.priority,
      attachments: []
    });
    setOpenDialog(true);
  };

  const handleSaveNotice = () => {
    if (editingId) {
      setNotices(notices.map(n => n.id === editingId ? { ...n, ...formData } : n));
    } else {
      const newNotice = {
        id: Math.max(...notices.map(n => n.id), 0) + 1,
        ...formData,
        publishedDate: new Date().toISOString().split('T')[0],
        createdBy: 'Admin',
        isActive: true
      };
      setNotices([...notices, newNotice]);
    }
    setOpenDialog(false);
  };

  const handleDeleteNotice = (id) => {
    if (window.confirm('Delete this notice?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  const handleReplyComplaint = (complaint) => {
    setSelectedItem(complaint);
    setReplyForm({ response: complaint.adminResponse });
    setOpenReplyDialog(true);
  };

  const handleSubmitReply = () => {
    setComplaints(complaints.map(c =>
      c.id === selectedItem.id
        ? { ...c, adminResponse: replyForm.response, status: 'Resolved' }
        : c
    ));
    setOpenReplyDialog(false);
  };

  const complaintStats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    rejectionRate: ((complaints.filter(c => c.status === 'Rejected').length / complaints.length) * 100).toFixed(1)
  };

  const noticeStats = {
    total: notices.length,
    active: notices.filter(n => n.isActive).length,
    archived: notices.filter(n => !n.isActive).length
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Notices & Complaints Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage notices, announcements, and student/staff complaints
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Notices (${noticeStats.total})`} />
            <Tab label={`Complaints (${complaintStats.total})`} />
          </Tabs>
        </Box>

        {/* Notices Tab */}
        {tabValue === 0 && (
          <CardContent>
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Active Notices</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                      {noticeStats.active}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography color="textSecondary" variant="caption">Archived</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                      {noticeStats.archived}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Add Button */}
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNotice}>
                Add Notice
              </Button>
            </Box>

            {/* Notices Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow key={notice.id} hover>
                      <TableCell sx={{ fontWeight: '500' }}>{notice.title}</TableCell>
                      <TableCell>{notice.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={notice.priority}
                          color={notice.priority === 'High' ? 'error' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{notice.publishedDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={notice.isActive ? 'Active' : 'Archived'}
                          color={notice.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditNotice(notice)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDeleteNotice(notice.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Complaints Tab */}
        {tabValue === 1 && (
          <CardContent>
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Total Complaints', value: complaintStats.total, color: '#2196F3' },
                { label: 'Pending', value: complaintStats.pending, color: '#FFC107' },
                { label: 'Resolved', value: complaintStats.resolved, color: '#4CAF50' }
              ].map((stat, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card sx={{ borderLeft: `4px solid ${stat.color}` }}>
                    <CardContent sx={{ pb: 2 }}>
                      <Typography color="textSecondary" variant="caption">{stat.label}</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Complaints Table */}
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Submitted By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell sx={{ fontWeight: '500' }}>{complaint.title}</TableCell>
                      <TableCell>{complaint.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.status}
                          color={complaint.status === 'Resolved' ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{complaint.submittedBy}</TableCell>
                      <TableCell>{complaint.submittedDate}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<ReplyIcon />}
                          onClick={() => handleReplyComplaint(complaint)}
                        >
                          Reply
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* Add/Edit Notice Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Notice' : 'Add New Notice'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Notice Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="Event">Event</MenuItem>
                <MenuItem value="Holiday">Holiday</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNotice} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Reply to Complaint Dialog */}
      <Dialog open={openReplyDialog} onClose={() => setOpenReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Complaint</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedItem && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {selectedItem.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {selectedItem.description}
                </Typography>
              </Box>
              <Divider />
              <TextField
                label="Your Response"
                value={replyForm.response}
                onChange={(e) => setReplyForm({ response: e.target.value })}
                multiline
                rows={4}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenReplyDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitReply} variant="contained" color="primary">Send Reply</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NoticesComplaintsManagement;
