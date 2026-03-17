const prisma = require('../lib/prisma');

// ==================== TEACHER PROFILE ====================

// Get teacher profile
const getTeacherProfile = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: teacherId },
            include: {
                Subjects: {
                    include: {
                        sclass: true,
                    },
                },
                ClassTeacherOf: true,
                _count: {
                    select: {
                        Subjects: true,
                        Homeworks: true,
                    },
                },
            },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher profile not found' });
        }

        res.status(200).json({ success: true, data: teacher });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
};

// Update teacher profile
const updateTeacherProfile = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { name, phone, qualification, experience, specialization } = req.body;

        const teacher = await prisma.teacher.update({
            where: { userId: teacherId },
            data: {
                name,
                phone,
                qualification,
                experience: experience ? parseInt(experience) : undefined,
                specialization,
            },
        });

        // Also update user
        await prisma.user.update({
            where: { id: teacherId },
            data: { name, phone },
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: teacher,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
};

// ==================== CLASS & STUDENTS ====================

// Get my class details
const getMyClasses = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const collegeId = req.collegeId;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: teacherId },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Get classes where teacher is assigned
        const classes = await prisma.sclass.findMany({
            where: {
                collegeId,
                OR: [
                    { classTeacherId: teacher.id },
                    {
                        Subjects: {
                            some: { teacherId: teacher.id },
                        },
                    },
                ],
            },
            include: {
                Subjects: {
                    where: { teacherId: teacher.id },
                },
                classTeacher: true,
                _count: {
                    select: { Students: true },
                },
            },
        });

        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ success: false, message: 'Error fetching classes' });
    }
};

// Get my students (across accessible classes) or filtered by classId
const getMyStudents = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { classId } = req.query;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        if (classId) {
            const students = await prisma.student.findMany({
                where: {
                    collegeId,
                    sclassId: classId,
                    isDeleted: false,
                    isActive: true,
                },
                include: { sclass: true, section: true, parent: true },
                orderBy: { rollNum: 'asc' },
            });

            return res.status(200).json({ success: true, data: students });
        }

        const classes = await prisma.sclass.findMany({
            where: {
                collegeId,
                OR: [
                    { classTeacherId: teacher.id },
                    { Subjects: { some: { teacherId: teacher.id } } },
                ],
            },
            select: { id: true },
        });

        const classIds = classes.map(c => c.id);

        const students = await prisma.student.findMany({
            where: {
                collegeId,
                isDeleted: false,
                isActive: true,
                sclassId: { in: classIds.length ? classIds : ['__none__'] },
            },
            include: { sclass: true, section: true, parent: true },
            orderBy: [{ sclassId: 'asc' }, { rollNum: 'asc' }],
        });

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error('Get my students error:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }

};

// Get students in class
const getClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;
        const collegeId = req.collegeId;
        const teacherId = req.user.id;

        // Verify teacher has access to this class
        const sclass = await prisma.sclass.findUnique({
            where: { id: classId },
        });

        if (!sclass || sclass.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        const students = await prisma.student.findMany({
            where: {
                sclassId: classId,
                collegeId,
            },
            include: {
                section: true,
                parent: true,
                _count: {
                    select: {
                        Attendances: true,
                        ExamResults: true,
                    },
                },
            },
            orderBy: { rollNum: 'asc' },
        });

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
};

// ==================== ATTENDANCE ====================

// Mark attendance
const markAttendance = async (req, res) => {
    try {
        const { classId, subjectId, date, attendance } = req.body;
        const collegeId = req.collegeId;

        if (!classId || !subjectId || !date || !attendance || !Array.isArray(attendance)) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        // Verify subject and class
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
        });

        if (!subject || subject.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        // Delete existing attendance for this date
        await prisma.attendance.deleteMany({
            where: {
                date: new Date(date),
                subjectId,
            },
        });

        // Create new attendance records
        const attendanceRecords = attendance.map(item => ({
            studentId: item.studentId,
            subjectId,
            date: new Date(date),
            status: item.status,
            remarks: item.remarks || null,
            collegeId,
        }));

        const created = await prisma.attendance.createMany({
            data: attendanceRecords,
        });

        res.status(201).json({
            success: true,
            message: `Attendance marked for ${created.count} students`,
            data: { count: created.count },
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ success: false, message: 'Error marking attendance' });
    }
};

// Get attendance report
const getAttendanceReport = async (req, res) => {
    try {
        const classId = req.query.classId || req.params.classId;
        const { subjectId, month, year } = req.query;
        const collegeId = req.collegeId;

        let filter = { collegeId };
        if (subjectId) filter.subjectId = subjectId;
        if (classId) {
            filter.subject = { is: { sclassId: classId } };
        }
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            filter.date = { gte: startDate, lte: endDate };
        }

        const attendance = await prisma.attendance.findMany({
            where: filter,
            include: {
                student: true,
                subject: true,
            },
            orderBy: { date: 'desc' },
        });

        // Group by student
        const byStudent = {};
        attendance.forEach(record => {
            if (!byStudent[record.studentId]) {
                byStudent[record.studentId] = {
                    student: record.student,
                    total: 0,
                    present: 0,
                    absent: 0,
                    leave: 0,
                    percentage: 0,
                };
            }
            byStudent[record.studentId].total++;
            if (record.status === 'present') {
                byStudent[record.studentId].present++;
            } else if (record.status === 'absent') {
                byStudent[record.studentId].absent++;
            } else if (record.status === 'leave') {
                byStudent[record.studentId].leave++;
            }
        });

        // Calculate percentages
        Object.keys(byStudent).forEach(studentId => {
            const data = byStudent[studentId];
            if (data.total > 0) {
                data.percentage = ((data.present / data.total) * 100).toFixed(2);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                attendance,
                byStudent: Object.values(byStudent),
            },
        });
    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({ success: false, message: 'Error fetching attendance report' });
    }
};

// ==================== MARKS ====================

// Upload marks
const uploadMarks = async (req, res) => {
    try {
        const { examId, subjectId, marks } = req.body;
        const collegeId = req.collegeId;

        if (!examId || !subjectId || !marks || !Array.isArray(marks)) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        // Verify exam and subject
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
        });

        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
        });

        if (!exam || exam.collegeId !== collegeId || !subject || subject.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Exam or subject not found' });
        }

        let created = 0;
        let updated = 0;

        for (const markData of marks) {
            const existing = await prisma.examResult.findFirst({
                where: {
                    studentId: markData.studentId,
                    subjectId,
                    examId,
                },
            });

            const marksObtained = parseFloat(markData.marksObtained);
            const percentage = (marksObtained / (subject.maxMarks || 100)) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            if (existing) {
                await prisma.examResult.update({
                    where: { id: existing.id },
                    data: {
                        marksObtained,
                        percentage: percentage.toFixed(2),
                        grade,
                        remarks: markData.remarks || null,
                    },
                });
                updated++;
            } else {
                await prisma.examResult.create({
                    data: {
                        studentId: markData.studentId,
                        subjectId,
                        examId,
                        collegeId,
                        marksObtained,
                        percentage: percentage.toFixed(2),
                        grade,
                        remarks: markData.remarks || null,
                    },
                });
                created++;
            }
        }

        res.status(201).json({
            success: true,
            message: `Marks uploaded: ${created} created, ${updated} updated`,
            data: { created, updated },
        });
    } catch (error) {
        console.error('Upload marks error:', error);
        res.status(500).json({ success: false, message: 'Error uploading marks' });
    }
};

// Get marks report
const getMarksReport = async (req, res) => {
    try {
        const { classId, examId } = req.query;
        const collegeId = req.collegeId;

        let filter = { collegeId };
        if (examId) filter.examId = examId;
        if (classId) {
            filter.student = { is: { sclassId: classId } };
        }

        const results = await prisma.examResult.findMany({
            where: filter,
            include: {
                student: true,
                subject: true,
                exam: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by student
        const byStudent = {};
        results.forEach(result => {
            if (!byStudent[result.studentId]) {
                byStudent[result.studentId] = {
                    student: result.student,
                    subjects: [],
                    totalMarks: 0,
                    obtainedMarks: 0,
                };
            }
            byStudent[result.studentId].subjects.push(result);
            byStudent[result.studentId].totalMarks += result.subject.maxMarks || 100;
            byStudent[result.studentId].obtainedMarks += result.marksObtained;
        });

        res.status(200).json({
            success: true,
            data: {
                results,
                byStudent: Object.values(byStudent),
            },
        });
    } catch (error) {
        console.error('Get marks report error:', error);
        res.status(500).json({ success: false, message: 'Error fetching marks' });
    }
};

// ==================== HOMEWORK ====================

// Create homework
const createHomework = async (req, res) => {
    try {
        const { subjectId, title, description, dueDate, instructions, totalMarks } = req.body;
        const collegeId = req.collegeId;

        if (!subjectId || !title || !dueDate) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const homework = await prisma.homework.create({
            data: {
                title,
                description,
                dueDate: new Date(dueDate),
                instructions,
                totalMarks: totalMarks ? parseInt(totalMarks) : null,
                subjectId,
                teacherId: teacher.id,
                collegeId,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Homework created successfully',
            data: homework,
        });
    } catch (error) {
        console.error('Create homework error:', error);
        res.status(500).json({ success: false, message: 'Error creating homework' });
    }
};

// Get my homework
const getMyHomework = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const collegeId = req.collegeId;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: teacherId },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const homework = await prisma.homework.findMany({
            where: {
                teacherId: teacher.id,
                collegeId,
            },
            include: {
                subject: true,
            },
            orderBy: { dueDate: 'asc' },
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

// Update homework
const updateHomework = async (req, res) => {
    try {
        const { id } = req.params;
        const collegeId = req.collegeId;
        const { subjectId, title, description, dueDate, instructions, totalMarks } = req.body;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const existing = await prisma.homework.findFirst({
            where: { id, teacherId: teacher.id, collegeId },
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Homework not found' });
        }

        const homework = await prisma.homework.update({
            where: { id },
            data: {
                subjectId: subjectId === undefined ? undefined : subjectId,
                title: title === undefined ? undefined : title,
                description: description === undefined ? undefined : description,
                dueDate: dueDate === undefined ? undefined : new Date(dueDate),
                instructions: instructions === undefined ? undefined : instructions,
                totalMarks:
                    totalMarks === undefined ? undefined : (totalMarks === null ? null : parseInt(totalMarks)),
            },
            include: { subject: true },
        });

        res.status(200).json({ success: true, message: 'Homework updated successfully', data: homework });
    } catch (error) {
        console.error('Update homework error:', error);
        res.status(500).json({ success: false, message: 'Error updating homework' });
    }
};

// Delete homework
const deleteHomework = async (req, res) => {
    try {
        const { id } = req.params;
        const collegeId = req.collegeId;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const existing = await prisma.homework.findFirst({
            where: { id, teacherId: teacher.id, collegeId },
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Homework not found' });
        }

        await prisma.homework.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Homework deleted successfully' });
    } catch (error) {
        console.error('Delete homework error:', error);
        res.status(500).json({ success: false, message: 'Error deleting homework' });
    }
};

// ==================== DASHBOARD ====================

// Get teacher dashboard
const getDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const collegeId = req.collegeId;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: teacherId },
            include: {
                Subjects: true,
                ClassTeacherOf: true,
            },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Get total students
        const totalStudents = await prisma.student.count({
            where: {
                sclass: {
                    Subjects: {
                        some: { teacherId: teacher.id },
                    },
                },
            },
        });

        // Get recent homework
        const recentHomework = await prisma.homework.findMany({
            where: {
                teacherId: teacher.id,
                collegeId,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        // Get classes
        const classes = await prisma.sclass.findMany({
            where: {
                collegeId,
                OR: [
                    { classTeacherId: teacher.id },
                    { Subjects: { some: { teacherId: teacher.id } } },
                ],
            },
        });

        res.status(200).json({
            success: true,
            data: {
                teacher,
                stats: {
                    classes: classes.length,
                    subjects: teacher.Subjects.length,
                    totalStudents,
                    homeworkCount: recentHomework.length,
                },
                recentHomework,
            },
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard' });
    }
};

// ==================== REPORTS ====================
const getMyReports = async (req, res) => {
    try {
        const collegeId = req.collegeId;

        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
            include: { Subjects: true },
        });

        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        const subjectIds = teacher.Subjects.map(s => s.id);

        const [attendanceCount, marksCount, homeworkCount] = await Promise.all([
            prisma.attendance.count({
                where: {
                    collegeId,
                    subjectId: { in: subjectIds.length ? subjectIds : ['__none__'] },
                },
            }),
            prisma.examResult.count({
                where: {
                    collegeId,
                    subjectId: { in: subjectIds.length ? subjectIds : ['__none__'] },
                },
            }),
            prisma.homework.count({
                where: {
                    collegeId,
                    teacherId: teacher.id,
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    attendanceRecords: attendanceCount,
                    marksUploaded: marksCount,
                    homeworkCreated: homeworkCount,
                },
            },
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Error fetching reports' });
    }
};

// ==================== EXAMS ====================
const getMyExams = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const classes = await prisma.sclass.findMany({
            where: {
                collegeId,
                OR: [
                    { classTeacherId: teacher.id },
                    { Subjects: { some: { teacherId: teacher.id } } },
                ],
            },
            select: { id: true, sclassName: true },
        });

        const classIds = classes.map(c => c.id);

        const exams = await prisma.exam.findMany({
            where: {
                collegeId,
                sclassId: { in: classIds.length ? classIds : ['__none__'] },
            },
            include: {
                sclass: true,
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

// ==================== ASSIGNMENTS ====================
const getMyAssignments = async (req, res) => {
    // This can be an alias for getMyHomework for now
    return getMyHomework(req, res);
};

// ==================== NOTICES ====================
const getMyNotices = async (req, res) => {
    try {
        const collegeId = req.collegeId;

        const notices = await prisma.notice.findMany({
            where: {
                collegeId,
                isActive: true,
            },
            orderBy: {
                publishedDate: 'desc',
            },
        });

        res.status(200).json({ success: true, data: notices });
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({ success: false, message: 'Error fetching notices' });
    }
};


module.exports = {
    getTeacherProfile,
    updateTeacherProfile,
    getMyClasses,
    getClassStudents,
    getMyStudents,
    markAttendance,
    getAttendanceReport,
    uploadMarks,
    getMarksReport,
    createHomework,
    getMyHomework,
    updateHomework,
    deleteHomework,
    getDashboard,
    getMyReports,
    getMyExams,
    getMyAssignments,
    getMyNotices,
};