const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

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
        const profileImage = req.body.profileImage ?? req.body.profile_image;

        const teacher = await prisma.teacher.update({
            where: { userId: teacherId },
            data: {
                name,
                phone,
                qualification,
                experience: experience ? parseInt(experience) : undefined,
                specialization,
                profileImage: profileImage === undefined ? undefined : profileImage,
            },
        });

        // Also update user
        await prisma.user.update({
            where: { id: teacherId },
            data: {
                name,
                phone,
                profileImage: profileImage === undefined ? undefined : profileImage,
            },
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

// ==================== STUDENT MANAGEMENT (TEACHER) ====================

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

const getTeacherAndAccessibleClasses = async ({ teacherUserId, collegeId }) => {
    const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) {
        return { teacher: null, classes: [] };
    }

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
        select: {
            id: true,
            sclassName: true,
            sclassCode: true,
        },
        orderBy: { sclassName: 'asc' },
    });

    return { teacher, classes };
};

const createStudentForTeacher = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const teacherUserId = req.user.id;

        const { name, studentId, email, phone, password, sclassId, sectionId } = req.body || {};
        const profileImage = req.body?.profileImage ?? req.body?.profile_image;

        if (!name || !studentId || !sclassId) {
            return res.status(400).json({ success: false, message: 'Required fields missing: name, studentId, sclassId' });
        }

        const { teacher, classes } = await getTeacherAndAccessibleClasses({ teacherUserId, collegeId });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const accessibleClassIds = new Set(classes.map((c) => c.id));
        if (!accessibleClassIds.has(String(sclassId))) {
            return res.status(403).json({ success: false, message: 'Not allowed to add students to this class' });
        }

        const existing = await prisma.student.findFirst({ where: { collegeId, studentId: String(studentId).trim() } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Student ID already exists' });
        }

        let resolvedSectionId = null;
        if (sectionId) {
            const section = await prisma.section.findFirst({
                where: { id: String(sectionId), collegeId, sclassId: String(sclassId) },
            });
            if (!section) {
                return res.status(400).json({ success: false, message: 'Invalid sectionId for this class' });
            }
            resolvedSectionId = section.id;
        }

        const fallbackPassword = String(process.env.DEFAULT_STUDENT_PASSWORD || '').trim() || 'Student@123';
        const effectivePassword = String(password || '').trim() || fallbackPassword;
        const hashedPassword = await bcrypt.hash(effectivePassword, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: String(name).trim(),
                    email: email ? String(email).trim() : null,
                    phone: phone ? String(phone).trim() : null,
                    password: hashedPassword,
                    profileImage: profileImage ? String(profileImage).trim() : null,
                    role: 'Student',
                    collegeId,
                    isActive: true,
                },
            });

            const student = await tx.student.create({
                data: {
                    name: String(name).trim(),
                    studentId: String(studentId).trim(),
                    email: email ? String(email).trim() : null,
                    phone: phone ? String(phone).trim() : null,
                    password: hashedPassword,
                    profileImage: profileImage ? String(profileImage).trim() : null,
                    collegeId,
                    sclassId: String(sclassId),
                    sectionId: resolvedSectionId,
                    userId: user.id,
                    isActive: true,
                },
                include: {
                    section: true,
                    sclass: true,
                },
            });

            return { user, student };
        });

        res.status(201).json({ success: true, message: 'Student created successfully', data: result });
    } catch (error) {
        console.error('Teacher create student error:', error);
        res.status(500).json({ success: false, message: 'Error creating student' });
    }
};

const bulkImportStudentsForTeacher = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const teacherUserId = req.user.id;

        const mode = String(req.query.mode || 'skip').toLowerCase() === 'update' ? 'update' : 'skip';

        const file = Array.isArray(req.files) ? req.files[0] : null;
        if (!file) {
            return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
        }

        const { teacher, classes } = await getTeacherAndAccessibleClasses({ teacherUserId, collegeId });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const accessibleClassIds = new Set(classes.map((c) => c.id));
        const classByName = new Map(classes.map((c) => [String(c.sclassName || '').toLowerCase(), c]));
        const classByCode = new Map(classes.map((c) => [String(c.sclassCode || '').toLowerCase(), c]));

        const rows = [];
        await new Promise((resolve, reject) => {
            Readable.from([file.buffer])
                .pipe(csvParser({ mapHeaders: ({ header }) => normalizeCsvKey(header) }))
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;
        let defaultPasswordUsed = 0;
        const errors = [];

        const fallbackPassword = String(process.env.DEFAULT_STUDENT_PASSWORD || '').trim() || 'Student@123';
        const allowedBoards = new Set(['STATE', 'CBSE', 'IGCSE', 'IB']);

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;

            try {
                const studentId = pickCsvValue(raw, ['student_id', 'studentid', 'roll_no', 'roll', 'id']);
                const name = pickCsvValue(raw, ['name', 'student_name', 'full_name']);
                const email = pickCsvValue(raw, ['email', 'student_email']);
                const phone = pickCsvValue(raw, ['phone', 'mobile', 'contact']);
                const password = pickCsvValue(raw, ['password', 'temp_password', 'temporary_password']);
                const classIdRaw = pickCsvValue(raw, ['class_id', 'sclass_id', 'sclassid']);
                const className = pickCsvValue(raw, ['class', 'class_name', 'sclass', 'sclass_name']);
                const classCode = pickCsvValue(raw, ['class_code', 'sclass_code']);
                const sectionName = pickCsvValue(raw, ['section', 'section_name']);
                const parentName = pickCsvValue(raw, ['parent_name', 'guardian_name']);
                const parentPhone = pickCsvValue(raw, ['parent_phone', 'guardian_phone']);
                const boardRaw = pickCsvValue(raw, ['board']);
                const group = pickCsvValue(raw, ['group']);
                const integratedCourse = pickCsvValue(raw, ['integrated_course', 'integratedcourse']);
                const profileImage = pickCsvValue(raw, ['profile_image', 'profileimage']);

                if (!studentId || !name) {
                    errors.push({ row: rowNumber, studentId: studentId || null, message: 'Missing required: studentId and/or name' });
                    continue;
                }

                let sclass = null;
                if (classIdRaw) {
                    if (!accessibleClassIds.has(classIdRaw)) {
                        errors.push({ row: rowNumber, studentId, message: `Not allowed for classId: ${classIdRaw}` });
                        continue;
                    }
                    sclass = classes.find((c) => c.id === classIdRaw) || null;
                } else if (classCode) {
                    sclass = classByCode.get(String(classCode).toLowerCase()) || null;
                } else if (className) {
                    sclass = classByName.get(String(className).toLowerCase()) || null;
                }

                if (!sclass) {
                    errors.push({ row: rowNumber, studentId, message: 'Missing/invalid Class (must be one of your assigned classes)' });
                    continue;
                }

                let section = null;
                if (sectionName) {
                    section = await prisma.section.findFirst({
                        where: { collegeId, sclassId: sclass.id, sectionName },
                    });
                    if (!section) {
                        errors.push({ row: rowNumber, studentId, message: `Section not found: ${sectionName} (Class: ${sclass.sclassName})` });
                        continue;
                    }
                }

                let board = null;
                if (boardRaw) {
                    const normalizedBoard = String(boardRaw).trim().toUpperCase();
                    if (!allowedBoards.has(normalizedBoard)) {
                        errors.push({ row: rowNumber, studentId, message: `Invalid board: ${boardRaw}. Allowed: ${Array.from(allowedBoards).join(', ')}` });
                        continue;
                    }
                    board = normalizedBoard;
                }

                const existingStudent = await prisma.student.findFirst({ where: { collegeId, studentId } });
                if (existingStudent) {
                    const canTouchExisting = !existingStudent.sclassId || accessibleClassIds.has(existingStudent.sclassId);
                    if (!canTouchExisting) {
                        errors.push({ row: rowNumber, studentId, message: 'Not allowed to update a student outside your classes' });
                        continue;
                    }

                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    const updateData = { name };
                    if (email) updateData.email = email;
                    if (phone) updateData.phone = phone;
                    if (parentName) updateData.parentName = parentName;
                    if (parentPhone) updateData.parentPhone = parentPhone;
                    if (profileImage) updateData.profileImage = profileImage;
                    if (board) updateData.board = board;
                    if (integratedCourse) updateData.integratedCourse = integratedCourse;
                    if (group) updateData.group = group;
                    updateData.sclassId = sclass.id;
                    if (section) updateData.sectionId = section.id;

                    await prisma.student.update({ where: { id: existingStudent.id }, data: updateData });

                    if (existingStudent.userId) {
                        const userUpdate = { name };
                        if (email) userUpdate.email = email;
                        if (phone) userUpdate.phone = phone;
                        if (profileImage) userUpdate.profileImage = profileImage;
                        await prisma.user.update({ where: { id: existingStudent.userId }, data: userUpdate });
                    }

                    if (password) {
                        const hashed = await bcrypt.hash(password, 10);
                        await prisma.student.update({ where: { id: existingStudent.id }, data: { password: hashed } });
                        if (existingStudent.userId) {
                            await prisma.user.update({ where: { id: existingStudent.userId }, data: { password: hashed } });
                        }
                    }

                    updated++;
                    continue;
                }

                const effectivePassword = password || fallbackPassword;
                if (!password) defaultPasswordUsed++;
                const hashedPassword = await bcrypt.hash(effectivePassword, 10);

                await prisma.$transaction(async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            name,
                            email: email || null,
                            phone: phone || null,
                            password: hashedPassword,
                            profileImage: profileImage || null,
                            role: 'Student',
                            collegeId,
                            isActive: true,
                        },
                    });

                    await tx.student.create({
                        data: {
                            name,
                            studentId,
                            email: email || null,
                            phone: phone || null,
                            password: hashedPassword,
                            parentName: parentName || null,
                            parentPhone: parentPhone || null,
                            profileImage: profileImage || null,
                            board,
                            integratedCourse: integratedCourse || null,
                            group: group || null,
                            collegeId,
                            sclassId: sclass.id,
                            sectionId: section ? section.id : null,
                            userId: user.id,
                            isActive: true,
                        },
                    });
                });

                created++;
            } catch (rowError) {
                errors.push({
                    row: rowNumber,
                    studentId: pickCsvValue(raw, ['student_id', 'studentid', 'roll_no', 'roll', 'id']) || null,
                    message: rowError?.message || 'Row import failed',
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Student import completed',
            data: {
                totalRows: rows.length,
                created,
                updated,
                skipped,
                defaultPasswordUsed,
                errorCount: errors.length,
                errors,
            },
        });
    } catch (error) {
        console.error('Teacher bulk import students error:', error);
        res.status(500).json({ success: false, message: 'Error importing students' });
    }
};
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
    createStudentForTeacher,
    bulkImportStudentsForTeacher,
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