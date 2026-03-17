const prisma = require('../lib/prisma');

// ==================== TRANSPORT ROUTES ====================

// Create bus route
const createBusRoute = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const {
            routeName,
            routeNumber,
            startPoint,
            endPoint,
            distance,
            estimatedTime,
            stopsCount,
            fee,
            description,
            isActive,
        } = req.body;

        if (!routeName || !startPoint || !endPoint) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const finalRouteNumber = routeNumber || `R-${Date.now()}`;
        const finalFee = fee === undefined || fee === null ? 0 : parseFloat(fee);

        const route = await prisma.busRoute.create({
            data: {
                routeName,
                routeNumber: finalRouteNumber,
                startPoint,
                endPoint,
                distance: parseFloat(distance) || null,
                estimatedTime: estimatedTime || null,
                stopsCount: stopsCount === undefined || stopsCount === null ? null : parseInt(stopsCount),
                fee: finalFee,
                description: description || null,
                isActive: isActive === undefined ? undefined : Boolean(isActive),
                collegeId,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Bus route created successfully',
            data: route,
        });
    } catch (error) {
        console.error('Create route error:', error);
        res.status(500).json({ success: false, message: 'Error creating bus route' });
    }
};

// Get all bus routes
const getAllBusRoutes = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const routes = await prisma.busRoute.findMany({
            where: { collegeId },
            include: {
                Buses: { select: { id: true, busNumber: true, capacity: true, status: true } },
                _count: { select: { Buses: true, Students: true } },
            },
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.busRoute.count({ where: { collegeId } });

        res.status(200).json({
            success: true,
            data: routes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({ success: false, message: 'Error fetching routes' });
    }
};

// Update bus route
const updateBusRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const collegeId = req.collegeId;
        const {
            routeName,
            startPoint,
            endPoint,
            distance,
            estimatedTime,
            stopsCount,
            fee,
            description,
            isActive,
        } = req.body;

        const existing = await prisma.busRoute.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Route not found' });
        }

        const updated = await prisma.busRoute.update({
            where: { id },
            data: {
                routeName: routeName === undefined ? undefined : routeName,
                startPoint: startPoint === undefined ? undefined : startPoint,
                endPoint: endPoint === undefined ? undefined : endPoint,
                distance: distance === undefined ? undefined : (distance === null ? null : parseFloat(distance)),
                estimatedTime: estimatedTime === undefined ? undefined : estimatedTime,
                stopsCount: stopsCount === undefined ? undefined : (stopsCount === null ? null : parseInt(stopsCount)),
                fee: fee === undefined ? undefined : parseFloat(fee),
                description: description === undefined ? undefined : description,
                isActive: isActive === undefined ? undefined : Boolean(isActive),
            },
        });

        res.status(200).json({ success: true, message: 'Route updated successfully', data: updated });
    } catch (error) {
        console.error('Update route error:', error);
        res.status(500).json({ success: false, message: 'Error updating route' });
    }
};

// Delete bus route
const deleteBusRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const collegeId = req.collegeId;

        const existing = await prisma.busRoute.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Route not found' });
        }

        await prisma.busRoute.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Route deleted successfully' });
    } catch (error) {
        console.error('Delete route error:', error);
        res.status(500).json({ success: false, message: 'Error deleting route' });
    }
};

// ==================== BUS MANAGEMENT ====================

// Create bus
const createBus = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const {
            busNumber,
            regNumber,
            capacity,
            routeId,
            driverName,
            driverPhone,
            driverLicense,
            conductorName,
            conductorPhone,
            gpsDeviceId,
            status,
            lastServiceDate,
            nextServiceDate,
        } = req.body;

        if (!busNumber || !capacity || !routeId) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const finalRegNumber = regNumber || `${busNumber}-REG`;

        const bus = await prisma.bus.create({
            data: {
                busNumber,
                regNumber: finalRegNumber,
                capacity: parseInt(capacity),
                routeId,
                driverName: driverName || 'Unknown',
                driverPhone: driverPhone || 'N/A',
                driverLicense,
                conductorName: conductorName || null,
                conductorPhone: conductorPhone || null,
                gpsDeviceId: gpsDeviceId || null,
                status: status || undefined,
                lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
                nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
                collegeId,
            },
            include: { route: true },
        });

        res.status(201).json({
            success: true,
            message: 'Bus created successfully',
            data: bus,
        });
    } catch (error) {
        console.error('Create bus error:', error);
        res.status(500).json({ success: false, message: 'Error creating bus' });
    }
};

// Get all buses
const getAllBuses = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { routeId, page = 1, limit = 10 } = req.query;

        let filter = { collegeId };
        if (routeId) filter.routeId = routeId;

        const skip = (page - 1) * limit;

        const buses = await prisma.bus.findMany({
            where: filter,
            include: {
                route: true,
            },
            skip: parseInt(skip),
            take: parseInt(limit),
        });

        const total = await prisma.bus.count({ where: filter });

        res.status(200).json({
            success: true,
            data: buses,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get buses error:', error);
        res.status(500).json({ success: false, message: 'Error fetching buses' });
    }
};

// Update bus
const updateBus = async (req, res) => {
    try {
        const { id } = req.params;
        const collegeId = req.collegeId;
        const {
            busNumber,
            regNumber,
            capacity,
            routeId,
            driverName,
            driverPhone,
            driverLicense,
            conductorName,
            conductorPhone,
            gpsDeviceId,
            status,
            lastServiceDate,
            nextServiceDate,
        } = req.body;

        const existing = await prisma.bus.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Bus not found' });
        }

        const updated = await prisma.bus.update({
            where: { id },
            data: {
                busNumber: busNumber === undefined ? undefined : busNumber,
                regNumber: regNumber === undefined ? undefined : regNumber,
                capacity: capacity === undefined ? undefined : parseInt(capacity),
                routeId: routeId === undefined ? undefined : routeId,
                driverName: driverName === undefined ? undefined : driverName,
                driverPhone: driverPhone === undefined ? undefined : driverPhone,
                driverLicense: driverLicense === undefined ? undefined : driverLicense,
                conductorName: conductorName === undefined ? undefined : conductorName,
                conductorPhone: conductorPhone === undefined ? undefined : conductorPhone,
                gpsDeviceId: gpsDeviceId === undefined ? undefined : gpsDeviceId,
                status: status === undefined ? undefined : status,
                lastServiceDate: lastServiceDate === undefined ? undefined : (lastServiceDate ? new Date(lastServiceDate) : null),
                nextServiceDate: nextServiceDate === undefined ? undefined : (nextServiceDate ? new Date(nextServiceDate) : null),
            },
            include: { route: true },
        });

        res.status(200).json({ success: true, message: 'Bus updated successfully', data: updated });
    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json({ success: false, message: 'Error updating bus' });
    }
};

// Delete bus
const deleteBus = async (req, res) => {
    try {
        const { id } = req.params;
        const collegeId = req.collegeId;

        const existing = await prisma.bus.findFirst({ where: { id, collegeId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Bus not found' });
        }

        await prisma.bus.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Bus deleted successfully' });
    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json({ success: false, message: 'Error deleting bus' });
    }
};

// Assign student to bus
const assignStudentToBus = async (req, res) => {
    try {
        const { busId } = req.params;
        const { studentId } = req.body;
        const collegeId = req.collegeId;

        const bus = await prisma.bus.findUnique({
            where: { id: busId },
        });

        if (!bus || bus.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Bus not found' });
        }

        // Assign student to the bus route (schema links students to BusRoute)
        const student = await prisma.student.update({
            where: { id: studentId },
            data: { busRouteId: bus.routeId },
            include: { sclass: true, busRoute: true },
        });

        res.status(200).json({
            success: true,
            message: 'Student assigned to bus successfully',
            data: student,
        });
    } catch (error) {
        console.error('Assign student error:', error);
        res.status(500).json({ success: false, message: 'Error assigning student' });
    }
};

// ==================== BUS ATTENDANCE ====================

// Mark bus attendance
const markBusAttendance = async (req, res) => {
    try {
        // NOTE: Bus attendance model is not present in current Prisma schema.
        res.status(501).json({
            success: false,
            message: 'Transport attendance is not implemented in the current database schema',
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ success: false, message: 'Error marking attendance' });
    }
};

// Get bus attendance report
const getBusAttendanceReport = async (req, res) => {
    try {
        // NOTE: Bus attendance model is not present in current Prisma schema.
        res.status(501).json({
            success: false,
            message: 'Transport attendance reporting is not implemented in the current database schema',
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ success: false, message: 'Error fetching report' });
    }
};

// ==================== TRANSPORT FEES ====================

// Define transport fee
const defineTransportFee = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const {
            routeId,
            amount,
            feeAmount,
            frequency,
            dueDate,
            discountPercent,
            description,
        } = req.body;

        const finalAmount = amount === undefined ? feeAmount : amount;

        if (!routeId || finalAmount === undefined || finalAmount === null) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const fee = await prisma.transportFee.create({
            data: {
                routeId,
                amount: parseFloat(finalAmount),
                frequency: frequency || undefined,
                dueDate: dueDate ? new Date(dueDate) : null,
                discountPercent:
                    discountPercent === undefined || discountPercent === null ? undefined : parseFloat(discountPercent),
                description: description || null,
                collegeId,
            },
            include: { route: true },
        });

        res.status(201).json({
            success: true,
            message: 'Transport fee defined successfully',
            data: fee,
        });
    } catch (error) {
        console.error('Define fee error:', error);
        res.status(500).json({ success: false, message: 'Error defining transport fee' });
    }
};

// Get transport dashboard
const getTransportDashboard = async (req, res) => {
    try {
        const collegeId = req.collegeId;

        const totalRoutes = await prisma.busRoute.count({ where: { collegeId } });
        const totalBuses = await prisma.bus.count({ where: { collegeId } });
        const totalStudents = await prisma.student.count({
            where: { collegeId, busId: { not: null } },
        });

        const busesWithCapacity = await prisma.bus.findMany({
            where: { collegeId },
            include: {
                _count: { select: { students: true } },
            },
        });

        const capacityUsage = busesWithCapacity.reduce((acc, bus) => {
            const usage = (bus._count.students / bus.capacity) * 100;
            return acc + usage;
        }, 0) / busesWithCapacity.length;

        res.status(200).json({
            success: true,
            data: {
                totalRoutes,
                totalBuses,
                totalStudents,
                averageCapacityUsage: busesWithCapacity.length > 0 ? capacityUsage.toFixed(2) : 0,
                buses: busesWithCapacity,
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};

module.exports = {
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
};
