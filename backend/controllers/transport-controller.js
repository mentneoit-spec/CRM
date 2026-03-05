const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== TRANSPORT ROUTES ====================

// Create bus route
const createBusRoute = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { routeName, startPoint, endPoint, distance, pickupTime, dropoffTime } = req.body;

        if (!routeName || !startPoint || !endPoint) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const route = await prisma.busRoute.create({
            data: {
                routeName,
                startPoint,
                endPoint,
                distance: parseFloat(distance) || null,
                pickupTime,
                dropoffTime,
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
                buses: { select: { id: true, busNumber: true, capacity: true } },
                _count: { select: { buses: true } },
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

// ==================== BUS MANAGEMENT ====================

// Create bus
const createBus = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { busNumber, capacity, routeId, driverName, driverPhone, driverLicense } = req.body;

        if (!busNumber || !capacity || !routeId) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const bus = await prisma.bus.create({
            data: {
                busNumber,
                capacity: parseInt(capacity),
                routeId,
                driverName,
                driverPhone,
                driverLicense,
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
                students: { select: { name: true, id: true } },
                _count: { select: { students: true } },
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

        // Check bus capacity
        const studentCount = await prisma.student.count({
            where: { busId },
        });

        if (studentCount >= bus.capacity) {
            return res.status(400).json({ success: false, message: 'Bus is at full capacity' });
        }

        const student = await prisma.student.update({
            where: { id: studentId },
            data: { busId },
            include: { sclass: true, bus: { include: { route: true } } },
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
        const { busId } = req.params;
        const { attendanceData } = req.body; // Array: [{studentId, status}]
        const collegeId = req.collegeId;

        const bus = await prisma.bus.findUnique({
            where: { id: busId },
        });

        if (!bus || bus.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Bus not found' });
        }

        const attendanceRecords = [];

        for (const record of attendanceData) {
            const attendance = await prisma.busAttendance.create({
                data: {
                    studentId: record.studentId,
                    busId,
                    date: new Date(),
                    status: record.status, // present, absent, sick
                    collegeId,
                },
            });
            attendanceRecords.push(attendance);
        }

        res.status(201).json({
            success: true,
            message: 'Bus attendance marked successfully',
            data: attendanceRecords,
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ success: false, message: 'Error marking attendance' });
    }
};

// Get bus attendance report
const getBusAttendanceReport = async (req, res) => {
    try {
        const { busId } = req.params;
        const { month, year } = req.query;
        const collegeId = req.collegeId;

        const bus = await prisma.bus.findUnique({
            where: { id: busId },
        });

        if (!bus || bus.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Bus not found' });
        }

        let filter = { busId };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            filter.date = { gte: startDate, lte: endDate };
        }

        const attendance = await prisma.busAttendance.findMany({
            where: filter,
            include: { student: { select: { name: true, sclass: { select: { name: true } } } } },
            orderBy: { date: 'desc' },
        });

        const summary = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            sick: attendance.filter(a => a.status === 'sick').length,
        };

        res.status(200).json({
            success: true,
            data: { attendance, summary },
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
        const { routeId, feeAmount, month } = req.body;

        if (!routeId || !feeAmount) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const fee = await prisma.transportFee.create({
            data: {
                routeId,
                feeAmount: parseFloat(feeAmount),
                month,
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
    createBus,
    getAllBuses,
    assignStudentToBus,
    markBusAttendance,
    getBusAttendanceReport,
    defineTransportFee,
    getTransportDashboard,
};
