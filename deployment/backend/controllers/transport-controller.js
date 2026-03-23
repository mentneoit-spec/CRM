const prisma = require('../lib/prisma');
const { Readable } = require('stream');
const csvParser = require('csv-parser');

const normalizeCsvKey = (key) => {
    return String(key || '')
        .trim()
        .toLowerCase()
        .replace(/[\s/]+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
};

const pickCsvValue = (row, keys) => {
    for (const key of keys) {
        const normalized = normalizeCsvKey(key);
        if (Object.prototype.hasOwnProperty.call(row, normalized)) {
            const value = row[normalized];
            if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
        }
    }
    return '';
};

const parseFlexibleDate = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const day = parseInt(slash[1], 10);
        const month = parseInt(slash[2], 10);
        const year = parseInt(slash[3], 10);
        const d = new Date(Date.UTC(year, month - 1, day));
        return Number.isNaN(d.getTime()) ? null : d;
    }

    const dash = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dash) {
        const day = parseInt(dash[1], 10);
        const month = parseInt(dash[2], 10);
        const year = parseInt(dash[3], 10);
        const d = new Date(Date.UTC(year, month - 1, day));
        return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
};

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
        const { page = 1, limit = 50 } = req.query;

        const skip = (page - 1) * limit;

        const routes = await prisma.busRoute.findMany({
            where: { collegeId },
            select: {
                id: true,
                routeName: true,
                startPoint: true,
                endPoint: true,
                distance: true,
                estimatedTime: true,
                stopsCount: true,
                fee: true,
                isActive: true,
                createdAt: true,
                Buses: { select: { id: true, busNumber: true, capacity: true, status: true } },
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
        const { routeId, page = 1, limit = 50 } = req.query;

        let filter = { collegeId };
        if (routeId) filter.routeId = routeId;

        const skip = (page - 1) * limit;

        const buses = await prisma.bus.findMany({
            where: filter,
            select: {
                id: true,
                busNumber: true,
                registrationNo: true,
                capacity: true,
                driverName: true,
                driverPhone: true,
                status: true,
                createdAt: true,
                route: { select: { id: true, routeName: true } },
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

        // Student model uses busRouteId (not busId)
        const totalStudents = await prisma.student.count({
            where: { collegeId, busRouteId: { not: null }, isDeleted: false },
        });

        const routes = await prisma.busRoute.findMany({
            where: { collegeId },
            include: {
                Buses: { select: { id: true, capacity: true, busNumber: true } },
                _count: { select: { Students: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const routeUsages = routes
            .map((r) => {
                const capacity = (r.Buses || []).reduce((sum, b) => sum + (Number(b.capacity) || 0), 0);
                const students = r._count?.Students ?? 0;
                const usage = capacity > 0 ? (students / capacity) * 100 : 0;
                return { routeId: r.id, capacity, students, usage };
            })
            .filter((u) => u.capacity > 0);

        const averageCapacityUsage = routeUsages.length
            ? (routeUsages.reduce((sum, u) => sum + u.usage, 0) / routeUsages.length).toFixed(2)
            : '0';

        res.status(200).json({
            success: true,
            data: {
                totalRoutes,
                totalBuses,
                totalStudents,
                averageCapacityUsage,
                routes,
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};

// ==================== BUS MANAGEMENT (BULK IMPORT) ====================

const bulkImportBuses = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID required' });
        }

        const mode = String(req.query.mode || 'skip').toLowerCase() === 'update' ? 'update' : 'skip';

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(
                    csvParser({
                        mapHeaders: ({ header }) => normalizeCsvKey(header),
                    })
                )
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;

            try {
                const busNumber = pickCsvValue(raw, ['bus_number', 'busno', 'bus']);
                const regNumber = pickCsvValue(raw, ['reg_number', 'registration_number', 'regno']);
                const capacityRaw = pickCsvValue(raw, ['capacity', 'seats']);

                const routeId = pickCsvValue(raw, ['route_id', 'routeid']);
                const routeNumber = pickCsvValue(raw, ['route_number', 'routenumber']);
                const routeName = pickCsvValue(raw, ['route_name', 'routename']);

                const driverName = pickCsvValue(raw, ['driver_name', 'driver']);
                const driverPhone = pickCsvValue(raw, ['driver_phone', 'driver_mobile']);
                const driverLicense = pickCsvValue(raw, ['driver_license', 'license']);
                const conductorName = pickCsvValue(raw, ['conductor_name', 'conductor']);
                const conductorPhone = pickCsvValue(raw, ['conductor_phone', 'conductor_mobile']);
                const gpsDeviceId = pickCsvValue(raw, ['gps_device_id', 'gps']);
                const status = pickCsvValue(raw, ['status']);
                const lastServiceDateRaw = pickCsvValue(raw, ['last_service_date', 'lastservice']);
                const nextServiceDateRaw = pickCsvValue(raw, ['next_service_date', 'nextservice']);

                if (!busNumber || !capacityRaw) {
                    errors.push({ row: rowNumber, busNumber: busNumber || null, message: 'Missing required: busNumber and/or capacity' });
                    continue;
                }

                const capacity = parseInt(String(capacityRaw), 10);
                if (!Number.isFinite(capacity) || capacity <= 0) {
                    errors.push({ row: rowNumber, busNumber, message: `Invalid capacity: ${capacityRaw}` });
                    continue;
                }

                let route = null;
                if (routeId) {
                    route = await prisma.busRoute.findFirst({ where: { id: routeId, collegeId } });
                } else if (routeNumber) {
                    route = await prisma.busRoute.findFirst({ where: { routeNumber, collegeId } });
                } else if (routeName) {
                    route = await prisma.busRoute.findFirst({ where: { routeName, collegeId } });
                }

                if (!route) {
                    errors.push({ row: rowNumber, busNumber, message: 'Route not found (provide route_id or route_number or route_name)' });
                    continue;
                }

                const lastServiceDate = lastServiceDateRaw ? parseFlexibleDate(lastServiceDateRaw) : null;
                const nextServiceDate = nextServiceDateRaw ? parseFlexibleDate(nextServiceDateRaw) : null;

                const existing = await prisma.bus.findFirst({
                    where: {
                        collegeId,
                        OR: [
                            { busNumber },
                            ...(regNumber ? [{ regNumber }] : []),
                        ],
                    },
                });

                if (existing) {
                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    await prisma.bus.update({
                        where: { id: existing.id },
                        data: {
                            regNumber: regNumber || existing.regNumber,
                            capacity,
                            routeId: route.id,
                            driverName: driverName || existing.driverName,
                            driverPhone: driverPhone || existing.driverPhone,
                            driverLicense: driverLicense || existing.driverLicense,
                            conductorName: conductorName || existing.conductorName,
                            conductorPhone: conductorPhone || existing.conductorPhone,
                            gpsDeviceId: gpsDeviceId || existing.gpsDeviceId,
                            status: status || existing.status,
                            lastServiceDate: lastServiceDateRaw ? lastServiceDate : existing.lastServiceDate,
                            nextServiceDate: nextServiceDateRaw ? nextServiceDate : existing.nextServiceDate,
                        },
                    });

                    updated++;
                    continue;
                }

                const finalRegNumber = regNumber || `${busNumber}-REG`;

                await prisma.bus.create({
                    data: {
                        collegeId,
                        busNumber,
                        regNumber: finalRegNumber,
                        capacity,
                        routeId: route.id,
                        driverName: driverName || 'Unknown',
                        driverPhone: driverPhone || 'N/A',
                        driverLicense: driverLicense || null,
                        conductorName: conductorName || null,
                        conductorPhone: conductorPhone || null,
                        gpsDeviceId: gpsDeviceId || null,
                        status: status || undefined,
                        lastServiceDate: lastServiceDate || null,
                        nextServiceDate: nextServiceDate || null,
                    },
                });

                created++;
            } catch (err) {
                errors.push({ row: rowNumber, message: err?.message || 'Unknown error' });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bus import completed',
            data: { created, updated, skipped, total: rows.length, errors },
        });
    } catch (error) {
        console.error('Bulk import buses error:', error);
        res.status(500).json({ success: false, message: 'Error importing buses' });
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
    bulkImportBuses,
};
