const prisma = require('../lib/prisma');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { generatePaymentReceipt } = require('../utils/payment-receipt');

// Initialize Razorpay
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
    });
}

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
        const { name, phone, board, group, rollNum, dateOfBirth, gender, sclassId, sectionId, customClassName, customSectionName } = req.body;
        const integratedCourse = req.body.integratedCourse ?? req.body.integrated_course;
        const profileImage = req.body.profileImage ?? req.body.profile_image;

        const updateData = {
            name,
            phone,
            profileImage: profileImage === undefined ? undefined : profileImage,
            board: board === undefined ? undefined : board,
            integratedCourse: integratedCourse === undefined ? undefined : integratedCourse,
            group: group === undefined ? undefined : group,
            rollNum: rollNum === undefined ? undefined : (rollNum ? parseInt(rollNum, 10) : null),
            dateOfBirth: dateOfBirth === undefined ? undefined : dateOfBirth,
            gender: gender === undefined ? undefined : gender,
        };

        // Handle class - either use ID or custom name
        if (customClassName) {
            updateData.customClassName = customClassName;
            updateData.sclassId = null;
        } else if (sclassId) {
            updateData.sclassId = sclassId;
            updateData.customClassName = null;
        }

        // Handle section - either use ID or custom name
        if (customSectionName) {
            updateData.customSectionName = customSectionName;
            updateData.sectionId = null;
        } else if (sectionId) {
            updateData.sectionId = sectionId;
            updateData.customSectionName = null;
        }

        const student = await prisma.student.update({
            where: { userId: studentId },
            data: updateData,
        });

        // Also update user
        await prisma.user.update({
            where: { id: studentId },
            data: {
                name,
                phone,
                profileImage: profileImage === undefined ? undefined : profileImage,
            },
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

// Get exams for my class
const getMyExams = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            select: { id: true, collegeId: true, sclassId: true },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (!student.sclassId) {
            return res.status(200).json({ success: true, data: [] });
        }

        const exams = await prisma.exam.findMany({
            where: {
                collegeId,
                sclassId: student.sclassId,
                isPublished: true,
            },
            orderBy: {
                examDate: 'desc',
            },
        });

        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ success: false, message: 'Error fetching exams' });
    }
};

// ==================== COMPLAINTS ====================

// Submit a complaint
const submitComplaint = async (req, res) => {
    try {
        const studentUserId = req.user.id;
        const collegeId = req.collegeId;
        const { title, description, category, attachments } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const student = await prisma.student.findUnique({
            where: { userId: studentUserId },
            select: { id: true, collegeId: true },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const complaint = await prisma.complain.create({
            data: {
                title,
                description,
                category: category || 'General',
                status: 'pending',
                attachments: attachments || [],
                studentId: student.id,
                collegeId,
            },
        });

        res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: complaint });
    } catch (error) {
        console.error('Submit complaint error:', error);
        res.status(500).json({ success: false, message: 'Error submitting complaint' });
    }
};

// Get my complaints
const getMyComplaints = async (req, res) => {
    try {
        const studentUserId = req.user.id;
        const collegeId = req.collegeId;
        const { status, page = 1, limit = 10 } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId: studentUserId },
            select: { id: true, collegeId: true },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const skip = (page - 1) * limit;
        const filter = {
            studentId: student.id,
            collegeId,
            ...(status ? { status } : {}),
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

        // Add paidAmount and pendingAmount to each fee
        const feesWithAmounts = fees.map(fee => {
            const paidAmount = fee.Payments.reduce((sum, p) => sum + p.amount, 0);
            return {
                ...fee,
                paidAmount,
                pendingAmount: fee.amount - paidAmount,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                fees: feesWithAmounts,
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

        const homework = student.sclassId
            ? await prisma.homework.findMany({
                where: {
                    collegeId,
                    subject: {
                        is: {
                            sclassId: student.sclassId,
                        },
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
            })
            : [];

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
                class: student.sclass || null,
                subjects: student.sclass?.Subjects || [],
            },
        });
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ success: false, message: 'Error fetching timetable' });
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
        const homework = student.sclassId
            ? await prisma.homework.findMany({
                where: {
                    collegeId,
                    subject: {
                        is: {
                            sclassId: student.sclassId,
                        },
                    },
                },
                take: 5,
                orderBy: { dueDate: 'desc' },
            })
            : [];

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

// ==================== SUBJECTS ====================
const getMySubjects = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const subjects = await prisma.subject.findMany({
            where: {
                sclassId: student.sclassId,
                collegeId,
            },
            include: {
                teacher: true,
            },
        });

        res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ success: false, message: 'Error fetching subjects' });
    }
};

// ==================== TEACHERS ====================
const getMyTeachers = async (req, res) => {
    try {
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const subjects = await prisma.subject.findMany({
            where: {
                sclassId: student.sclassId,
                collegeId,
            },
            include: {
                teacher: true,
            },
        });

        const teachers = subjects.map(subject => subject.teacher).filter(Boolean);
        const uniqueTeachers = [...new Map(teachers.map(item => [item.id, item])).values()];

        res.status(200).json({ success: true, data: uniqueTeachers });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ success: false, message: 'Error fetching teachers' });
    }

};

// ==================== PAYMENT CREATION ====================

// Create payment (Razorpay order)
const createMyPayment = async (req, res) => {
    try {
        const { amount, feeType, feeId } = req.body;
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        // Validate amount
        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount required' });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
        }

        if (!razorpay) {
            return res.status(500).json({ success: false, message: 'Razorpay not configured' });
        }

        // Verify student
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Find fee if feeId provided
        let linkedFeeId = null;
        if (feeId) {
            const fee = await prisma.fee.findUnique({
                where: { id: feeId },
            });
            if (fee && fee.studentId === student.id && fee.collegeId === collegeId) {
                linkedFeeId = fee.id;
            }
        } else if (feeType) {
            // Find first pending fee of this type
            const fee = await prisma.fee.findFirst({
                where: {
                    studentId: student.id,
                    collegeId,
                    feeType: feeType,
                },
            });
            if (fee) {
                linkedFeeId = fee.id;
            }
        }

        // Create Razorpay order
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
        const receipt = `RCP${timestamp}`.substring(0, 40); // Max 40 chars
        
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(parsedAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: receipt,
            notes: {
                studentId: student.id,
                collegeId,
                feeType: feeType || 'Fee Payment',
            },
        });

        // Create payment record with fee link
        const payment = await prisma.payment.create({
            data: {
                transactionId: razorpayOrder.id,
                paymentMethod: 'razorpay',
                amount: parsedAmount,
                status: 'pending',
                studentId: student.id,
                collegeId,
                feeId: linkedFeeId,
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
                studentId: student.id,
                studentName: student.name,
            },
        });
    } catch (error) {
        console.error('Create payment error:', error.message || error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            description: error.description,
        });
        
        // Return more specific error messages
        if (error.statusCode === 400) {
            return res.status(400).json({ 
                success: false, 
                message: error.description || 'Invalid payment request' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error creating payment' 
        });
    }
};

// Verify payment
const verifyMyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        // Verify student
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: { college: true },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

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
                razorpayPaymentId: razorpayPaymentId,
                paymentDate: new Date(),
            },
        });

        // Generate receipt
        let receiptUrl = null;
        try {
            const receiptData = await generatePaymentReceipt({
                paymentId: payment.id,
                studentName: student.name,
                studentId: student.studentId,
                collegeName: student.college.name,
                amount: payment.amount,
                feeType: payment.notes,
                paymentDate: payment.paymentDate,
                transactionId: payment.razorpayPaymentId,
                paymentMethod: payment.paymentMethod,
            });
            receiptUrl = receiptData.url;
        } catch (receiptError) {
            console.error('Receipt generation error:', receiptError);
            // Don't fail payment verification if receipt generation fails
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                ...payment,
                receiptUrl,
            },
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
};

// Download payment receipt
const downloadPaymentReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const studentId = req.user.id;
        const collegeId = req.collegeId;

        // Verify student
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student || student.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Verify payment belongs to student
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment || payment.studentId !== student.id || payment.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Receipt only available for completed payments' });
        }

        // Generate receipt on demand
        const receiptData = await generatePaymentReceipt({
            paymentId: payment.id,
            studentName: student.name,
            studentId: student.studentId,
            collegeName: student.college?.name || 'School',
            amount: payment.amount,
            feeType: payment.notes,
            paymentDate: payment.paymentDate,
            transactionId: payment.razorpayPaymentId,
            paymentMethod: payment.paymentMethod,
        });

        // Send file
        res.download(receiptData.filepath, `receipt_${paymentId}.pdf`);
    } catch (error) {
        console.error('Download receipt error:', error);
        res.status(500).json({ success: false, message: 'Error downloading receipt' });
    }
};

module.exports = {
    getStudentProfile,
    updateStudentProfile,
    getMyAttendance,
    getMyMarks,
    getMyExams,
    getMyFees,
    getMyPaymentHistory,
    createMyPayment,
    verifyMyPayment,
    downloadPaymentReceipt,
    getMyHomework,
    getMyTimetable,
    getMyNotices,
    submitComplaint,
    getMyComplaints,
    getDashboard,
    getMySubjects,
    getMyTeachers,
};
