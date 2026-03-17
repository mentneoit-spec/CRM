import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, CircularProgress, Tooltip, MenuItem, Select, InputLabel, FormControl, Alert
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
    Delete as DeleteIcon, Refresh as RefreshIcon, SupervisorAccount as TeamIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchTeams, createTeamMember, clearAdminError, clearAdminSuccess } from '../../redux/slices/adminSlice';

const TeamManagement = () => {
    const dispatch = useDispatch();
    const { teams, loading, error, success, message } = useSelector((state) => state.admin);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Dialog State
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '', email: '', phone: '', password: '', role: 'AdmissionTeam'
    });

    useEffect(() => {
        dispatch(clearAdminError());
        dispatch(clearAdminSuccess());
        dispatch(fetchTeams());
    }, [dispatch]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };
    const handleRoleFilter = (event) => { setRoleFilter(event.target.value); setPage(0); };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        dispatch(createTeamMember(newMember)).then((res) => {
            if (!res.error) {
                setOpenAddDialog(false);
                setNewMember({ name: '', email: '', phone: '', password: '', role: 'AdmissionTeam' });
                dispatch(fetchTeams());
            }
        });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'AdmissionTeam': return 'primary';
            case 'AccountsTeam': return 'success';
            case 'TransportTeam': return 'warning';
            default: return 'default';
        }
    };

    const filteredTeams = teams?.filter((member) => {
        const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
        return matchesSearch && matchesRole;
    }) || [];

    const paginatedTeams = filteredTeams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <DashboardLayout role="admin">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
                    {error}
                </Alert>
            )}
            {success && message && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminSuccess())}>
                    {message}
                </Alert>
            )}

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Team Management
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => dispatch(fetchTeams())} sx={{ mr: 2 }}>
                        Refresh
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
                        Add Team Member
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        size="small"
                        sx={{ width: 300 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                    />
                    <FormControl size="small" sx={{ width: 200 }}>
                        <Select value={roleFilter} onChange={handleRoleFilter}>
                            <MenuItem value="ALL">All Roles</MenuItem>
                            <MenuItem value="AdmissionTeam">Admission Team</MenuItem>
                            <MenuItem value="AccountsTeam">Accounts Team</MenuItem>
                            <MenuItem value="TransportTeam">Transport Team</MenuItem>
                        </Select>
                    </FormControl>
                    {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Department Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Account Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedTeams.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No team members found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedTeams.map((member) => (
                                    <TableRow hover key={member.id}>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <TeamIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                                                {member.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>{member.phone || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={member.role.replace('Team', ' Team')} size="small" color={getRoleColor(member.role)} />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={member.user?.isActive ? 'ACTIVE' : 'INACTIVE'} size="small" variant="outlined" color={member.user?.isActive ? 'success' : 'default'} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Member">
                                                <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Remove Access">
                                                <IconButton color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredTeams.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add Team Member Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleAddSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Register Team Member</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField label="Full Name" fullWidth required value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Email Address" type="email" fullWidth required value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Phone Number" fullWidth required value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Temporary Password" type="password" fullWidth required value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Department Role</InputLabel>
                                    <Select
                                        value={newMember.role}
                                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                        label="Department Role"
                                    >
                                        <MenuItem value="AdmissionTeam">Admission Team</MenuItem>
                                        <MenuItem value="AccountsTeam">Accounts Team</MenuItem>
                                        <MenuItem value="TransportTeam">Transport Team</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Member'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </DashboardLayout>
    );
};

export default TeamManagement;
