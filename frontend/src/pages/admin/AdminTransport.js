import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, TextField,
    InputAdornment, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, CircularProgress, Tooltip, Tab, Tabs
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
    Delete as DeleteIcon, Refresh as RefreshIcon, DirectionsBus as BusIcon,
    Route as RouteIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchRoutes, createRoute, fetchBuses, createBus } from '../../redux/slices/adminSlice';

const AdminTransport = () => {
    const dispatch = useDispatch();
    const { routes, buses, loading } = useSelector((state) => state.admin);

    // Tabs State
    const [tabValue, setTabValue] = useState(0);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [openRouteDialog, setOpenRouteDialog] = useState(false);
    const [openBusDialog, setOpenBusDialog] = useState(false);

    const [newRoute, setNewRoute] = useState({ routeName: '', startPoint: '', endPoint: '', distance: '', stops: '' });
    const [newBus, setNewBus] = useState({ busNumber: '', registrationNo: '', capacity: '', driverName: '', driverPhone: '', routeId: '' });

    useEffect(() => {
        dispatch(fetchRoutes());
        dispatch(fetchBuses());
    }, [dispatch]);

    const handleTabChange = (event, newValue) => { setTabValue(newValue); setPage(0); };
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearch = (event) => { setSearchTerm(event.target.value); setPage(0); };

    const handleAddRoute = (e) => {
        e.preventDefault();
        dispatch(createRoute({ ...newRoute, distance: parseFloat(newRoute.distance), stops: newRoute.stops.split(',').map(s => s.trim()) })).then((res) => {
            if (!res.error) {
                setOpenRouteDialog(false);
                setNewRoute({ routeName: '', startPoint: '', endPoint: '', distance: '', stops: '' });
                dispatch(fetchRoutes());
            }
        });
    };

    const handleAddBus = (e) => {
        e.preventDefault();
        dispatch(createBus({ ...newBus, capacity: parseInt(newBus.capacity) })).then((res) => {
            if (!res.error) {
                setOpenBusDialog(false);
                setNewBus({ busNumber: '', registrationNo: '', capacity: '', driverName: '', driverPhone: '', routeId: '' });
                dispatch(fetchBuses());
            }
        });
    };

    const currentData = tabValue === 0 ? routes : buses;
    const filteredData = currentData?.filter((item) => {
        if (tabValue === 0) return item.routeName?.toLowerCase().includes(searchTerm.toLowerCase());
        return item.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || item.registrationNo?.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];
    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <DashboardLayout role="admin">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Transport Management
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { dispatch(fetchRoutes()); dispatch(fetchBuses()); }} sx={{ mr: 2 }}>
                        Refresh
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => tabValue === 0 ? setOpenRouteDialog(true) : setOpenBusDialog(true)}>
                        Add {tabValue === 0 ? 'Route' : 'Bus'}
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary" sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tab icon={<RouteIcon sx={{ mr: 1 }} />} iconPosition="start" label="Bus Routes" />
                    <Tab icon={<BusIcon sx={{ mr: 1 }} />} iconPosition="start" label="Fleet Management" />
                </Tabs>

                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        placeholder={`Search ${tabValue === 0 ? 'routes by name' : 'buses by number'}...`}
                        value={searchTerm}
                        onChange={handleSearch}
                        size="small"
                        sx={{ width: 400 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                    />
                    {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            {tabValue === 0 ? (
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Route Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Start Point</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>End Point</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Stops</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Bus Number</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Registration No</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Driver Info</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                            )}
                        </TableHead>
                        <TableBody>
                            {paginatedData.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No data found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item) => (
                                    <TableRow hover key={item.id}>
                                        {tabValue === 0 ? (
                                            <>
                                                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{item.routeName}</TableCell>
                                                <TableCell>{item.startPoint}</TableCell>
                                                <TableCell>{item.endPoint}</TableCell>
                                                <TableCell><Chip label={`${item.stops?.length || 0} Stops`} size="small" /></TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell sx={{ fontWeight: 600 }}><BusIcon sx={{ mr: 1, fontSize: 'small', color: 'success.main' }} />{item.busNumber}</TableCell>
                                                <TableCell><Chip label={item.registrationNo} size="small" variant="outlined" /></TableCell>
                                                <TableCell>{item.capacity} Seats</TableCell>
                                                <TableCell>{item.driverName} ({item.driverPhone})</TableCell>
                                            </>
                                        )}
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
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
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add Route Dialog */}
            <Dialog open={openRouteDialog} onClose={() => setOpenRouteDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleAddRoute}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Bus Route</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField label="Route Name" fullWidth required value={newRoute.routeName} onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Start Point" fullWidth required value={newRoute.startPoint} onChange={(e) => setNewRoute({ ...newRoute, startPoint: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="End Point" fullWidth required value={newRoute.endPoint} onChange={(e) => setNewRoute({ ...newRoute, endPoint: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Stops (comma separated)" fullWidth value={newRoute.stops} onChange={(e) => setNewRoute({ ...newRoute, stops: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Distance (km)" type="number" fullWidth value={newRoute.distance} onChange={(e) => setNewRoute({ ...newRoute, distance: e.target.value })} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenRouteDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained">Create Route</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Add Bus Dialog */}
            <Dialog open={openBusDialog} onClose={() => setOpenBusDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleAddBus}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Register New Bus</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Bus Number (e.g., Bus #1)" fullWidth required value={newBus.busNumber} onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Registration No (e.g., AB12CD3456)" fullWidth required value={newBus.registrationNo} onChange={(e) => setNewBus({ ...newBus, registrationNo: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Seating Capacity" type="number" fullWidth required value={newBus.capacity} onChange={(e) => setNewBus({ ...newBus, capacity: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Driver Name" fullWidth value={newBus.driverName} onChange={(e) => setNewBus({ ...newBus, driverName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Driver Phone" fullWidth value={newBus.driverPhone} onChange={(e) => setNewBus({ ...newBus, driverPhone: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Assigned Route ID" fullWidth value={newBus.routeId} onChange={(e) => setNewBus({ ...newBus, routeId: e.target.value })} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenBusDialog(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained">Register Bus</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminTransport;
