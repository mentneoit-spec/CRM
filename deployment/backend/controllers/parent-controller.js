const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay - gracefully handle missing credentials
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
    });
}

// ==================== PARENT PROFILE ====================

// Get parent profile
const getParentProfile = async (req, res) => {
    try {
        const parentId = req.user.id;

        const parent = await prisma.parent.findUnique({
            where: { userId: parentId },
            include: {
                Students: {
                    include: {
                        sclass: true,
                        section: true,
                    },
                },
                Payments: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent profile not found' });
        }

        res.status(200).json({ success: true, data: parent });
    } catch (error) {
        console.error('Get parent profile error:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
};

// Update parent profile
const updateParentProfile = async (req, res) => {
    try {
        const parentId = req.user.id;
        const { name, email, phone, occupation, address } = req.body;
        const profileImage = req.body.profileImage ?? req.body.profile_image;

        const parent = await prisma.parent.update({
            where: { userId: parentId },
            data: {
                name,
                email,
                phone,
                occupation,
                address,
                profileImage: profileImage === undefined ? undefined : profileImage,
            },
        });

        // Also update user table
        await prisma.user.update({
            where: { id: parentId },
            data: {
                name,
                email,
                phone,
                profileImage: profileImage === undefined ? undefined : profileImage,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: parent,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
};

// ==================== STUDENT INFORMATION ====================

// Get all my students
const getMyStudents = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const parentId = req.user.id;

        const parent = await prisma.parent.findUnique({
            where: { userId: parentId },
        });

        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        const students = await prisma.student.findMany({
            where: {
                parentId: parent.id,
                collegeId,
            },
            include: {
                sclass: true,
                section: true,
                _count: {
                    select: {
                        ExamResults: true,
                        Attendances: true,
                    },
                },
            },
        });

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
};

// Get specific student profile
const getStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
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
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ success: false, message: 'Error fetching student' });
    }
};

// ==================== ATTENDANCE ====================

// Get student attendance
const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { month, year } = req.query;
        const collegeId = req.collegeId;

        // Verify student belongs to parent
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        let filter = { studentId };

        // Add month/year filter if provided
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

// Get student exam results
const getStudentMarks = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { examId } = req.query;
        const collegeId = req.collegeId;

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        let filter = { studentId };
        if (examId) filter.examId = examId;

        const results = await prisma.examResult.findMany({
            where: filter,
            include: {
                subject: true,
                exam: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate overall percentage
        let totalMarks = 0;
        let marksObtained = 0;

        results.forEach(result => {
            totalMarks += result.subject.maxMarks || 100;
            marksObtained += result.marksObtained || 0;
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
                },
            },
        });
    } catch (error) {
        console.error('Get marks error:', error);
        res.status(500).json({ success: false, message: 'Error fetching marks' });
    }
};

// ==================== FEES & PAYMENTS ====================

// Get student fees
const getStudentFees = async (req, res) => {
    try {
        const { studentId } = req.params;
        const collegeId = req.collegeId;

        const computeAcademicYearLabel = (date) => {
            const d = date instanceof Date ? date : new Date(date);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const startYear = month >= 4 ? year : year - 1;
            const endYear = startYear + 1;
            return `${startYear}-${String(endYear).slice(-2)}`;
        };

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                sclass: { select: { id: true, sclassName: true } },
                section: { select: { id: true, sectionName: true } },
                college: { select: { id: true, name: true } },
            },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const fees = await prisma.fee.findMany({
            where: { studentId, collegeId },
            include: {
                Payments: {
                    where: { status: 'completed' },
                },
            },
            orderBy: { dueDate: 'asc' },
        });

        // Calculate fee summary
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

        const byAccYear = new Map();
        fees.forEach((fee) => {
            const accYear = computeAcademicYearLabel(fee.dueDate);
            const paidAmount = fee.Payments.reduce((sum, p) => sum + p.amount, 0);

            const current = byAccYear.get(accYear) || { accYear, payable: 0, paid: 0 };
            current.payable += fee.amount;
            current.paid += paidAmount;
            byAccYear.set(accYear, current);
        });

        const duesByYear = Array.from(byAccYear.values())
            .map((row) => ({
                accYear: row.accYear,
                payable: row.payable,
                paid: row.paid,
                due: row.payable - row.paid,
            }))
            .sort((a, b) => String(a.accYear).localeCompare(String(b.accYear)));

        res.status(200).json({
            success: true,
            data: {
                student,
                fees,
                duesByYear,
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

// ==================== PAYMENTS ====================

// Get payment history
const getPaymentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const collegeId = req.collegeId;

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const skip = (page - 1) * limit;

        const payments = await prisma.payment.findMany({
            where: { studentId, collegeId },
            skip: parseInt(skip),
            take: parseInt(limit),
            include: {
                fee: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.payment.count({
            where: { studentId, collegeId },
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

// Create payment (Razorpay order)
const createPayment = async (req, res) => {
    try {
        const { studentId, amount, feeType } = req.body;
        const collegeId = req.collegeId;

        if (!studentId || !amount) {
            return res.status(400).json({ success: false, message: 'Student ID and amount required' });
        }

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get parent
        const parent = await prisma.parent.findUnique({
            where: { userId: req.user.id },
        });

        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(parseFloat(amount) * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${studentId}_${Date.now()}`,
            notes: {
                studentId,
                parentId: parent.id,
                collegeId,
                feeType: feeType || 'Fee Payment',
            },
        });

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                transactionId: razorpayOrder.id,
                paymentMethod: 'razorpay',
                amount: parseFloat(amount),
                status: 'pending',
                studentId,
                collegeId,
                notes: feeType || 'Fee Payment',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Razorpay order created successfully',
            data: {
                paymentId: payment.id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount / 100,
                studentId,
                studentName: student.name,
            },
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, message: 'Error creating payment' });
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Verify signature
        const message = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(message)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Update payment status
        const payment = await prisma.payment.update({
            where: { transactionId: razorpayOrderId },
            data: {
                status: 'completed',
                transactionId: razorpayPaymentId,
                paidAt: new Date(),
            },
            include: { student: true },
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: payment,
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
};

// ==================== HOMEWORK & ASSIGNMENTS ====================

// Get student homework
const getStudentHomework = async (req, res) => {
    try {
        const { studentId } = req.params;
        const collegeId = req.collegeId;

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
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
                ...(student.sectionId
                    ? {
                        OR: [{ sectionId: null }, { sectionId: student.sectionId }],
                    }
                    : { sectionId: null }),
            },
            include: {
                teacher: true,
                subject: true,
                section: true,
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

// ==================== COMPLAINTS ====================

// Raise complaint
const raiseComplaint = async (req, res) => {
    try {
        const { studentId, title, description, category, attachments } = req.body;
        const collegeId = req.collegeId;

        if (!studentId || !title || !description) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get parent
        const parent = await prisma.parent.findUnique({
            where: { userId: req.user.id },
        });

        const complaint = await prisma.complain.create({
            data: {
                title,
                description,
                category: category || 'General',
                status: 'pending',
                attachments: attachments || [],
                studentId,
                parentId: parent?.id || null,
                collegeId,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaint,
        });
    } catch (error) {
        console.error('Raise complaint error:', error);
        res.status(500).json({ success: false, message: 'Error raising complaint' });
    }
};

// Get my complaints
const getMyComplaints = async (req, res) => {
    try {
        const { studentId } = req.params;
        const collegeId = req.collegeId;
        const { status, page = 1, limit = 10 } = req.query;

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const skip = (page - 1) * limit;
        let filter = { studentId, collegeId };
        if (status) filter.status = status;

        const complaints = await prisma.complain.findMany({
            where: filter,
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.complain.count({ where: filter });

        res.status(200).json({
            success: true,
            data: complaints,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ success: false, message: 'Error fetching complaints' });
    }
};

// ==================== REPORTS & DOWNLOADS ====================

// Download student report card
const downloadReportCard = async (req, res) => {
    try {
        const { studentId } = req.params;
        const collegeId = req.collegeId;

        // Verify student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                sclass: true,
                ExamResults: {
                    include: {
                        exam: true,
                        subject: true,
                    },
                },
            },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // TODO: Generate PDF report card
        // For now, return report data
        res.status(200).json({
            success: true,
            message: 'Report card generated. Download PDF.',
            data: {
                student,
                generatedAt: new Date(),
                // PDF URL would be added here
                pdfUrl: null,
            },
        });
    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({ success: false, message: 'Error generating report' });
    }
};

// ==================== DASHBOARD ====================

// Get parent dashboard
const getDashboard = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const parentUserId = req.user.id;

        const parent = await prisma.parent.findUnique({
            where: { userId: parentUserId },
        });

        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        // Get all students
        const students = await prisma.student.findMany({
            where: { parentId: parent.id, collegeId },
            include: {
                sclass: true,
            },
        });

        // Get pending fees
        const pendingFees = await prisma.fee.findMany({
            where: {
                collegeId,
                student: {
                    parentId: parent.id,
                },
            },
            include: {
                student: true,
                Payments: {
                    where: { status: 'completed' },
                },
            },
        });

        let totalFeesDue = 0;
        pendingFees.forEach(fee => {
            const paid = fee.Payments.reduce((sum, p) => sum + p.amount, 0);
            if (paid < fee.amount) {
                totalFeesDue += fee.amount - paid;
            }
        });

        // Get recent complaints
        const recentComplaints = await prisma.complain.findMany({
            where: {
                studentId: { in: students.map(s => s.id) },
                collegeId,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        // Get attendance summary
        const attendanceSummary = {};
        for (const student of students) {
            const attendanceData = await prisma.attendance.findMany({
                where: { studentId: student.id },
            });
            const present = attendanceData.filter(a => a.status === 'present').length;
            attendanceSummary[student.id] = {
                total: attendanceData.length,
                present,
                percentage: attendanceData.length > 0 ? ((present / attendanceData.length) * 100).toFixed(2) : 0,
            };
        }

        res.status(200).json({
            success: true,
            data: {
                studentCount: students.length,
                students,
                totalFeesDue,
                pendingFeesCount: pendingFees.length,
                recentComplaints,
                attendanceSummary,
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};

// ==================== NOTICES ====================

// Get college notices
const getMyNotices = async (req, res) => {
    try {
        const collegeId = req.collegeId;

        const notices = await prisma.notice.findMany({
            where: {
                collegeId,
                isActive: true,
            },
            orderBy: { publishedDate: 'desc' },
        });

        res.status(200).json({ success: true, data: notices });
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({ success: false, message: 'Error fetching notices' });
    }
};

// ==================== COMPLAINTS (ALL) ====================

// Get all complaints related to this parent and their children
const getMyComplaintsAll = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { status, page = 1, limit = 10 } = req.query;

        const parent = await prisma.parent.findUnique({
            where: { userId: req.user.id },
            select: { id: true },
        });

        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        const skip = (page - 1) * limit;
        const filter = {
            collegeId,
            ...(status ? { status } : {}),
            OR: [
                { parentId: parent.id },
                { student: { is: { parentId: parent.id } } },
            ],
        };

        const complaints = await prisma.complain.findMany({
            where: filter,
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.complain.count({ where: filter });

        res.status(200).json({
            success: true,
            data: complaints,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ success: false, message: 'Error fetching complaints' });
    }
};

module.exports = {
    getParentProfile,
    updateParentProfile,
    getMyStudents,
    getStudentProfile,
    getStudentAttendance,
    getStudentMarks,
    getStudentFees,
    getPaymentHistory,
    createPayment,
    verifyPayment,
    getStudentHomework,
    raiseComplaint,
    getMyComplaints,
    getMyComplaintsAll,
    getMyNotices,
    downloadReportCard,
    getDashboard,
};
