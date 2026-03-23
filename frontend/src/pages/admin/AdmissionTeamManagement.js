import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const AdmissionTeamManagement = () => {
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Load team members
    useEffect(() => {
        loadTeamMembers();
    }, []);

    const loadTeamMembers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAdmissionTeamMembers();
            if (response.data.success) {
                setTeamMembers(response.data.data || []);
            }
        } catch (err) {
            setError('Failed to load team members');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGeneratedPassword(password);
        setFormData({ ...formData, password, confirmPassword: password });
    };

    const handleOpenDialog = (member = null) => {
        if (member) {
            setEditingId(member.id);
            setFormData({
                name: member.name,
                email: member.email,
                phone: member.phone,
                password: '',
                confirmPassword: '',
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
            });
            generatePassword();
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
        setGeneratedPassword('');
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        });
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Phone is required');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        setError(null);
        if (!validateForm()) return;

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            };

            if (editingId) {
                const response = await adminAPI.updateAdmissionTeamMember(editingId, payload);
                if (response.data.success) {
                    setMessage('Team member updated successfully');
                    loadTeamMembers();
                    handleCloseDialog();
                }
            } else {
                const response = await adminAPI.createAdmissionTeamMember(payload);
                if (response.data.success) {
                    setMessage('Team member created successfully');
                    loadTeamMembers();
                    handleCloseDialog();
                }
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save team member');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this team member?')) return;

        try {
            const response = await adminAPI.deleteAdmissionTeamMember(id);
            if (response.data.success) {
                setMessage('Team member deleted successfully');
                loadTeamMembers();
            }
        } catch (err) {
            setError('Failed to delete team member');
            console.error(err);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setMessage('Copied to clipboard');
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Admission Team Management
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Team Member
                    </Button>
                </Box>

                {message && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Statistics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Members
                                </Typography>
                                <Typography variant="h5">{teamMembers.length}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: '#e8f5e9' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Active
                                </Typography>
                                <Typography variant="h5">
                                    {teamMembers.filter(m => m.isActive).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Team Members Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teamMembers.length > 0 ? (
                                teamMembers.map((member) => (
                                    <TableRow key={member.id} hover>
                                        <TableCell>{member.name}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>{member.phone}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.isActive ? 'Active' : 'Inactive'}
                                                color={member.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(member)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(member.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        No team members found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Add/Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {editingId ? 'Edit Team Member' : 'Add New Team Member'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter team member name"
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter email address"
                            />
                            <TextField
                                fullWidth
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Enter phone number"
                            />

                            {/* Password Section */}
                            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Password
                                    </Typography>
                                    {!editingId && (
                                        <Button
                                            size="small"
                                            onClick={generatePassword}
                                        >
                                            Generate
                                        </Button>
                                    )}
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter password"
                                    size="small"
                                    sx={{ mb: 1 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Confirm password"
                                    size="small"
                                    sx={{ mb: 1 }}
                                />

                                {generatedPassword && (
                                    <Box sx={{ backgroundColor: '#fff', p: 1, borderRadius: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {showPassword ? generatedPassword : '••••••••'}
                                        </Typography>
                                        <Tooltip title="Copy password">
                                            <IconButton
                                                size="small"
                                                onClick={() => copyToClipboard(generatedPassword)}
                                            >
                                                <FileCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="caption" sx={{ color: 'gray' }}>
                                Password must be at least 8 characters long
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSave} color="primary" variant="contained">
                            {editingId ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default AdmissionTeamManagement;
