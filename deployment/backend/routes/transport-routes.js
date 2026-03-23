const express = require('express');
const {
    createBusRoute,
    getAllBusRoutes,
    updateBusRoute,
    deleteBusRoute,
    createBus,
    getAllBuses,
    updateBus,
    deleteBus,
    assignStudentToBus,
    markBusAttendance,
    getBusAttendanceReport,
    defineTransportFee,
    getTransportDashboard,
    bulkImportBuses,
} = require('../controllers/transport-controller');
const { authorize, authorizeCollege } = require('../middleware/auth');
const { uploadMemory } = require('../utils/file-upload-service');

const router = express.Router();

// ==================== BUS ROUTES ====================
router.post('/routes', authorize('TransportTeam', 'Admin'), authorizeCollege, createBusRoute);
router.get('/routes', authorize('TransportTeam', 'Admin'), authorizeCollege, getAllBusRoutes);
router.put('/routes/:id', authorize('TransportTeam', 'Admin'), authorizeCollege, updateBusRoute);
router.delete('/routes/:id', authorize('TransportTeam', 'Admin'), authorizeCollege, deleteBusRoute);

// ==================== BUS MANAGEMENT ====================
router.post('/buses', authorize('TransportTeam', 'Admin'), authorizeCollege, createBus);
router.get('/buses', authorize('TransportTeam', 'Admin'), authorizeCollege, getAllBuses);
router.put('/buses/:id', authorize('TransportTeam', 'Admin'), authorizeCollege, updateBus);
router.delete('/buses/:id', authorize('TransportTeam', 'Admin'), authorizeCollege, deleteBus);
router.put('/buses/:busId/assign', authorize('TransportTeam', 'Admin'), authorizeCollege, assignStudentToBus);

// Bulk CSV import (multipart/form-data: file)
router.post(
    '/buses/import',
    authorize('TransportTeam', 'Admin'),
    authorizeCollege,
    uploadMemory('file', 1, 'spreadsheet'),
    bulkImportBuses
);

// ==================== BUS ATTENDANCE ====================
router.post('/buses/:busId/attendance', authorize('TransportTeam', 'Admin'), authorizeCollege, markBusAttendance);
router.get('/buses/:busId/report', authorize('TransportTeam', 'Admin'), authorizeCollege, getBusAttendanceReport);

// ==================== TRANSPORT FEES ====================
router.post('/fees', authorize('TransportTeam', 'Admin'), authorizeCollege, defineTransportFee);

// ==================== DASHBOARD ====================
router.get('/dashboard', authorize('TransportTeam', 'Admin'), authorizeCollege, getTransportDashboard);

module.exports = router;
