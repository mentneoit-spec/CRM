const prisma = require('../lib/prisma');

// ==================== STUDENT PROFILE ====================

// Get student profile
const getStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                sclass: true,
                section: true,
                parent: true,
                _count: {
                    select: {
                        ExamResults: true,
                        Attendances: true,
                        Fees: true,
                    },
                },
            },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { name, phone } = req.body;

        const student = await prisma.student.update({
            where: { userId: studentId },
            data: {
                name,
                phone,
            },
        });

        // Also update user
        await prisma.user.update({
            where: { id: studentId },
            data: { name, phone },
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: student,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
};

// ==================== ATTENDANCE ====================

// Get my attendance
const getMyAttendance = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;
        const { month, year } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        let filter = { studentId: student.id };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            filter.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        const attendance = await prisma.attendance.findMany({
            where: filter,
            include: {
                subject: true,
            },
            orderBy: { date: 'desc' },
        });

        // Calculate percentage
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'present').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                attendance,
                summary: {
                    total,
                    present,
                    absent: total - present,
                    percentage: parseFloat(percentage),
                },
            },
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: 'Error fetching attendance' });
    }
};

// ==================== MARKS & EXAMS ====================

// Get my marks
const getMyMarks = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;
        const { examId } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        let filter = { studentId: student.id };
        if (examId) filter.examId = examId;

        const results = await prisma.examResult.findMany({
            where: filter,
            include: {
                subject: true,
                exam: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate overall stats
        let totalMarks = 0;
        let marksObtained = 0;
        let subjects = 0;

        results.forEach(result => {
            if (!results.some((r, i) => r.subjectId === result.subjectId && i > results.indexOf(result))) {
                totalMarks += result.subject.maxMarks || 100;
                marksObtained += result.marksObtained || 0;
                subjects++;
            }
        });

        const overallPercentage = totalMarks > 0 ? ((marksObtained / totalMarks) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                results,
                summary: {
                    totalMarks,
                    marksObtained,
                    percentage: parseFloat(overallPercentage),
                    subjects,
                },
            },
        });
    } catch (error) {
        console.error('Get marks error:', error);
        res.status(500).json({ success: false, message: 'Error fetching marks' });
    }
};

// ==================== FEES ====================

// Get my fees
const getMyFees = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const fees = await prisma.fee.findMany({
            where: { studentId: student.id, collegeId },
            include: {
                Payments: {
                    where: { status: 'completed' },
                },
            },
            orderBy: { dueDate: 'asc' },
        });

        let totalFee = 0;
        let totalPaid = 0;
        const feeSummary = {
            pending: [],
            paid: [],
            overdue: [],
        };

        fees.forEach(fee => {
            totalFee += fee.amount;
            const paidAmount = fee.Payments.reduce((sum, p) => sum + p.amount, 0);
            totalPaid += paidAmount;

            const feeData = {
                ...fee,
                paidAmount,
                pendingAmount: fee.amount - paidAmount,
            };

            if (paidAmount >= fee.amount) {
                feeSummary.paid.push(feeData);
            } else if (new Date() > fee.dueDate) {
                feeSummary.overdue.push(feeData);
            } else {
                feeSummary.pending.push(feeData);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                fees,
                summary: {
                    totalFee,
                    totalPaid,
                    totalPending: totalFee - totalPaid,
                    feeCounts: feeSummary,
                },
            },
        });
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ success: false, message: 'Error fetching fees' });
    }
};

// Get my payment history
const getMyPaymentHistory = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;
        const { page = 1, limit = 10 } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const skip = (page - 1) * limit;

        const payments = await prisma.payment.findMany({
            where: { studentId: student.id, collegeId },
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                fee: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.payment.count({
            where: { studentId: student.id, collegeId },
        });

        res.status(200).json({
            success: true,
            data: payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ success: false, message: 'Error fetching payment history' });
    }
};

// ==================== HOMEWORK ====================

// Get my homework
const getMyHomework = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const homework = await prisma.homework.findMany({
            where: {
                collegeId,
                subject: {
                    sclassId: student.sclassId,
                },
            },
            include: {
                teacher: true,
                subject: true,
            },
            orderBy: { dueDate: 'desc' },
        });

        const now = new Date();
        const categorized = {
            pending: homework.filter(h => h.dueDate > now),
            overdue: homework.filter(h => h.dueDate <= now),
        };

        res.status(200).json({
            success: true,
            data: {
                homework,
                categorized,
            },
        });
    } catch (error) {
        console.error('Get homework error:', error);
        res.status(500).json({ success: false, message: 'Error fetching homework' });
    }
};

// ==================== TIMETABLE ====================

// Get my timetable
const getMyTimetable = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                sclass: {
                    include: {
                        Subjects: {
                            include: {
                                teacher: true,
                            },
                        },
                    },
                },
            },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                class: student.sclass,
                subjects: student.sclass.Subjects,
            },
        });
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ success: false, message: 'Error fetching timetable' });
    }
};

// ==================== DASHBOARD ====================

// Get student dashboard
const getDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                sclass: true,
            },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get attendance percentage
        const attendanceData = await prisma.attendance.findMany({
            where: { studentId: student.id },
        });
        const presentDays = attendanceData.filter(a => a.status === 'present').length;
        const attendancePercentage = attendanceData.length > 0 
            ? ((presentDays / attendanceData.length) * 100).toFixed(2) 
            : 0;

        // Get marks
        const marks = await prisma.examResult.findMany({
            where: { studentId: student.id },
            include: { subject: true, exam: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        // Get pending fees
        const fees = await prisma.fee.findMany({
            where: { studentId: student.id, collegeId },
            include: {
                Payments: { where: { status: 'completed' } },
            },
        });

        let totalFeesDue = 0;
        fees.forEach(fee => {
            const paid = fee.Payments.reduce((sum, p) => sum + p.amount, 0);
            if (paid < fee.amount) {
                totalFeesDue += fee.amount - paid;
            }
        });

        // Get recent homework
        const homework = await prisma.homework.findMany({
            where: {
                collegeId,
                subject: { sclassId: student.sclassId },
            },
            take: 5,
            orderBy: { dueDate: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: {
                student,
                stats: {
                    attendance: {
                        total: attendanceData.length,
                        present: presentDays,
                        percentage: parseFloat(attendancePercentage),
                    },
                    marks: marks.length > 0 ? marks[0] : null,
                    fees: {
                        totalDue: totalFeesDue,
                        pendingCount: fees.filter(f => {
                            const paid = f.Payments.reduce((s, p) => s + p.amount, 0);
                            return paid < f.amount;
                        }).length,
                    },
                    homework: homework.length,
                },
                recentMarks: marks,
                upcomingHomework: homework.filter(h => h.dueDate > new Date()),
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};

module.exports = {
    getStudentProfile,
    updateStudentProfile,
    getMyAttendance,
    getMyMarks,
    getMyFees,
    getMyPaymentHistory,
    getMyHomework,
    getMyTimetable,
    getDashboard,
};
