const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

function normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

async function generateAdmissionNumber(collegeId) {
    // Readable + very low collision chance, scoped by unique constraint.
    const year = new Date().getFullYear();
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ADM${year}-${collegeId.slice(0, 4).toUpperCase()}-${suffix}`;
}

// ==================== ADMISSIONS (BULK IMPORT) ====================

const bulkImportAdmissions = async (req, res) => {
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

        const allowedStatus = new Set(['pending', 'approved', 'rejected']);

        for (let index = 0; index < rows.length; index++) {
            const raw = rows[index] || {};
            const rowNumber = index + 2;
            try {
                const admissionNumber = pickCsvValue(raw, ['admission_number', 'admissionnumber', 'id']);
                const applicantName = pickCsvValue(raw, ['applicant_name', 'student_name', 'studentname', 'name']);
                const applicantEmail = pickCsvValue(raw, ['applicant_email', 'email']);
                const applicantPhone = pickCsvValue(raw, ['applicant_phone', 'phone', 'mobile', 'contact']);
                const appliedFor = pickCsvValue(raw, ['applied_for', 'class_applied', 'class']);
                const dateOfBirthRaw = pickCsvValue(raw, ['date_of_birth', 'dob']);
                const gender = pickCsvValue(raw, ['gender']);
                const fatherName = pickCsvValue(raw, ['father_name', 'fathername']);
                const motherName = pickCsvValue(raw, ['mother_name', 'mothername']);
                const address = pickCsvValue(raw, ['address']);
                const previousSchool = pickCsvValue(raw, ['previous_school', 'school']);
                const previousGrade = pickCsvValue(raw, ['previous_grade', 'grade']);
                const documents = pickCsvValue(raw, ['documents']);
                const comments = pickCsvValue(raw, ['comments', 'comment', 'notes']);
                const statusRaw = pickCsvValue(raw, ['status']);

                if (!applicantName || !applicantEmail || !applicantPhone || !address) {
                    errors.push({ row: rowNumber, admissionNumber: admissionNumber || null, message: 'Missing required: applicantName, applicantEmail, applicantPhone, and/or address' });
                    continue;
                }

                const dob = normalizeDate(dateOfBirthRaw);
                if (dateOfBirthRaw && !dob) {
                    errors.push({ row: rowNumber, admissionNumber: admissionNumber || null, message: `Invalid dateOfBirth: ${dateOfBirthRaw}` });
                    continue;
                }

                let status = 'pending';
                if (statusRaw) {
                    const normalizedStatus = String(statusRaw).trim().toLowerCase();
                    if (!allowedStatus.has(normalizedStatus)) {
                        errors.push({ row: rowNumber, admissionNumber: admissionNumber || null, message: `Invalid status: ${statusRaw}. Allowed: pending, approved, rejected` });
                        continue;
                    }
                    status = normalizedStatus;
                }

                let existing = null;
                if (admissionNumber) {
                    existing = await prisma.admission.findFirst({ where: { collegeId, admissionNumber } });
                }

                if (existing) {
                    if (mode === 'skip') {
                        skipped++;
                        continue;
                    }

                    const updateData = {
                        applicantName,
                        applicantEmail,
                        applicantPhone,
                        address,
                    };
                    if (appliedFor) updateData.appliedFor = appliedFor;
                    if (dob !== null) updateData.dateOfBirth = dob;
                    if (gender) updateData.gender = gender;
                    if (fatherName) updateData.fatherName = fatherName;
                    if (motherName) updateData.motherName = motherName;
                    if (previousSchool) updateData.previousSchool = previousSchool;
                    if (previousGrade) updateData.previousGrade = previousGrade;
                    if (documents) updateData.documents = documents;
                    if (comments) updateData.comments = comments;
                    if (statusRaw) updateData.status = status;

                    await prisma.admission.update({ where: { id: existing.id }, data: updateData });
                    updated++;
                    continue;
                }

                if (admissionNumber) {
                    await prisma.admission.create({
                        data: {
                            admissionNumber,
                            applicantName,
                            applicantEmail,
                            applicantPhone,
                            appliedFor: appliedFor || null,
                            dateOfBirth: dob,
                            gender: gender || null,
                            fatherName: fatherName || null,
                            motherName: motherName || null,
                            address,
                            previousSchool: previousSchool || null,
                            previousGrade: previousGrade || null,
                            documents: documents || null,
                            comments: comments || null,
                            collegeId,
                            status,
                        },
                    });
                    created++;
                    continue;
                }

                // Generate admissionNumber with retry on unique collision
                for (let attempt = 0; attempt < 3; attempt++) {
                    const generated = await generateAdmissionNumber(collegeId);
                    try {
                        await prisma.admission.create({
                            data: {
                                admissionNumber: generated,
                                applicantName,
                                applicantEmail,
                                applicantPhone,
                                appliedFor: appliedFor || null,
                                dateOfBirth: dob,
                                gender: gender || null,
                                fatherName: fatherName || null,
                                motherName: motherName || null,
                                address,
                                previousSchool: previousSchool || null,
                                previousGrade: previousGrade || null,
                                documents: documents || null,
                                comments: comments || null,
                                collegeId,
                                status,
                            },
                        });
                        created++;
                        break;
                    } catch (err) {
                        if (err?.code === 'P2002' && attempt < 2) continue;
                        throw err;
                    }
                }
            } catch (rowError) {
                errors.push({
                    row: rowNumber,
                    admissionNumber: pickCsvValue(raw, ['admission_number', 'admissionnumber', 'id']) || null,
                    message: rowError?.message || 'Row import failed',
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk import completed',
            data: {
                mode,
                totalRows: rows.length,
                created,
                updated,
                skipped,
                errorCount: errors.length,
                errors,
            },
        });
    } catch (error) {
        console.error('Bulk import admissions error:', error);
        res.status(500).json({ success: false, message: 'Error importing admissions' });
    }
};

// ==================== ADMISSION FORM ====================

// Create admission form
const createAdmissionForm = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId || req.body.collegeId;

        const {
            // New schema names
            applicantName,
            applicantEmail,
            applicantPhone,
            appliedFor,
            dateOfBirth,
            gender,
            fatherName,
            motherName,
            address,
            previousSchool,
            previousGrade,
            documents,
            comments,

            // Backwards-compatible aliases (older frontend/controller)
            studentName,
            email,
            phone,
        } = req.body;

        const finalApplicantName = applicantName || studentName;
        const finalApplicantEmail = applicantEmail || email;
        const finalApplicantPhone = applicantPhone || phone;

        if (!collegeId || !finalApplicantName || !finalApplicantEmail || !finalApplicantPhone || !address) {
            return res.status(400).json({
                success: false,
                message: 'Required fields missing (collegeId, applicantName, applicantEmail, applicantPhone, address)',
            });
        }

        const dob = normalizeDate(dateOfBirth);

        // Generate admissionNumber with retry on unique collision
        let admission;
        for (let attempt = 0; attempt < 3; attempt++) {
            const admissionNumber = await generateAdmissionNumber(collegeId);
            try {
                admission = await prisma.admission.create({
                    data: {
                        admissionNumber,
                        applicantName: finalApplicantName,
                        applicantEmail: finalApplicantEmail,
                        applicantPhone: finalApplicantPhone,
                        appliedFor: appliedFor || null,
                        dateOfBirth: dob,
                        gender: gender || null,
                        fatherName: fatherName || null,
                        motherName: motherName || null,
                        address,
                        previousSchool: previousSchool || null,
                        previousGrade: previousGrade || null,
                        documents: documents || null,
                        comments: comments || null,
                        collegeId,
                        status: 'pending',
                    },
                });
                break;
            } catch (err) {
                // Prisma unique constraint violation
                if (err?.code === 'P2002' && attempt < 2) continue;
                throw err;
            }
        }

        res.status(201).json({
            success: true,
            message: 'Admission form submitted successfully',
            data: admission,
        });
    } catch (error) {
        console.error('Create admission error:', error);
        res.status(500).json({ success: false, message: 'Error creating admission form' });
    }
};

// Get all admission forms
const getAllAdmissions = async (req, res) => {
    try {
        const collegeId = req.collegeId || req.query.collegeId;
        const { status, page = 1, limit = 50 } = req.query;

        let filter = { collegeId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const admissions = await prisma.admission.findMany({
            where: filter,
            skip: parseInt(skip),
            take: parseInt(limit),
            select: {
                id: true,
                admissionNumber: true,
                applicantName: true,
                applicantEmail: true,
                applicantPhone: true,
                appliedFor: true,
                status: true,
                appliedDate: true,
                createdAt: true,
                admissionTeam: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.admission.count({ where: filter });

        res.status(200).json({
            success: true,
            data: admissions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get admissions error:', error);
        res.status(500).json({ success: false, message: 'Error fetching admissions' });
    }
};

// Get admission details
const getAdmissionDetails = async (req, res) => {
    try {
        const { admissionId } = req.params;
        const collegeId = req.collegeId;

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
            include: { admissionTeam: true },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        res.status(200).json({ success: true, data: admission });
    } catch (error) {
        console.error('Get admission details error:', error);
        res.status(500).json({ success: false, message: 'Error fetching admission details' });
    }
};

// Update admission details
const updateAdmissionDetails = async (req, res) => {
    try {
        const { admissionId } = req.params;
        const collegeId = req.collegeId;
        const {
            applicantName,
            applicantEmail,
            applicantPhone,
            fatherName,
            motherName,
            dateOfBirth,
            gender,
            address,
            previousSchool,
            previousGrade,
            documents,
            status,
            appliedFor,
            comments,
        } = req.body;

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        const updated = await prisma.admission.update({
            where: { id: admissionId },
            data: {
                applicantName: applicantName ?? admission.applicantName,
                applicantEmail: applicantEmail ?? admission.applicantEmail,
                applicantPhone: applicantPhone ?? admission.applicantPhone,
                fatherName: fatherName ?? admission.fatherName,
                motherName: motherName ?? admission.motherName,
                dateOfBirth: dateOfBirth ? normalizeDate(dateOfBirth) : admission.dateOfBirth,
                gender: gender ?? admission.gender,
                address: address ?? admission.address,
                previousSchool: previousSchool ?? admission.previousSchool,
                previousGrade: previousGrade ?? admission.previousGrade,
                documents: documents ?? admission.documents,
                appliedFor: appliedFor ?? admission.appliedFor,
                comments: comments ?? admission.comments,
                status: status ?? admission.status,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Admission updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error('Update admission error:', error);
        res.status(500).json({ success: false, message: 'Error updating admission' });
    }
};

// Upload admission documents
const uploadDocuments = async (req, res) => {
    try {
        const { admissionId } = req.params;
        const collegeId = req.collegeId;
        const { documents } = req.body; // Array of {docName, docUrl}

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        const updated = await prisma.admission.update({
            where: { id: admissionId },
            data: {
                documents: documents || admission.documents,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Documents uploaded successfully',
            data: updated,
        });
    } catch (error) {
        console.error('Upload documents error:', error);
        res.status(500).json({ success: false, message: 'Error uploading documents' });
    }
};

// ==================== ADMISSION APPROVAL ====================

// Approve admission
const approveAdmission = async (req, res) => {
    try {
        const { admissionId } = req.params;
        const collegeId = req.collegeId;

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        if (admission.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Admission is already ${admission.status}` });
        }

        const existingUser = await prisma.user.findFirst({
            where: { email: admission.applicantEmail, collegeId },
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists' });
        }

        // Default password = part before @ (can be changed later)
        const basePassword = (admission.applicantEmail || '').split('@')[0] || 'student@123';
        const hashedPassword = await bcrypt.hash(basePassword, 10);
        const studentId = admission.admissionNumber;

        const result = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name: admission.applicantName,
                    email: admission.applicantEmail,
                    password: hashedPassword,
                    phone: admission.applicantPhone,
                    role: 'Student',
                    collegeId,
                    isEmailVerified: true,
                    isActive: true,
                },
            });

            await tx.student.create({
                data: {
                    userId: createdUser.id,
                    name: admission.applicantName,
                    studentId,
                    email: admission.applicantEmail,
                    phone: admission.applicantPhone,
                    password: hashedPassword,
                    dateOfBirth: admission.dateOfBirth,
                    gender: admission.gender,
                    parentName: admission.fatherName || null,
                    address: admission.address,
                    admissionYear: new Date().getFullYear(),
                    admissionNumber: admission.admissionNumber,
                    collegeId,
                },
            });

            const updatedAdmission = await tx.admission.update({
                where: { id: admissionId },
                data: { status: 'approved', approvedDate: new Date() },
            });

            return { updatedAdmission };
        });

        res.status(200).json({
            success: true,
            message: 'Admission approved successfully',
            data: result.updatedAdmission,
        });
    } catch (error) {
        console.error('Approve admission error:', error);
        res.status(500).json({ success: false, message: 'Error approving admission' });
    }
};

// Reject admission
const rejectAdmission = async (req, res) => {
    try {
        const { admissionId } = req.params;
        const reason = req.body?.rejectionReason || req.body?.reason;
        const collegeId = req.collegeId;

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        if (!reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const updated = await prisma.admission.update({
            where: { id: admissionId },
            data: { 
                status: 'rejected',
                rejectionReason: reason,
                approvedDate: null,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Admission rejected',
            data: updated,
        });
    } catch (error) {
        console.error('Reject admission error:', error);
        res.status(500).json({ success: false, message: 'Error rejecting admission' });
    }
};

// ==================== COMMUNICATION ====================

// Send message to parent
const sendMessageToParent = async (req, res) => {
    try {
        const { admissionId } = req.params;
        const { message } = req.body;
        const collegeId = req.collegeId;

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const auditLog = await prisma.auditLog.create({
            data: {
                action: 'ADMISSION_MESSAGE',
                entityType: 'Admission',
                entityId: admissionId,
                changes: `Message sent to ${admission.applicantName}${admission.fatherName ? `/${admission.fatherName}` : ''}: ${message}`,
                collegeId,
                userId: req.user?.id || null,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: auditLog,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
};

// Get admission statistics
const getAdmissionStats = async (req, res) => {
    try {
        const collegeId = req.collegeId;

        const stats = await prisma.admission.groupBy({
            by: ['status'],
            where: { collegeId },
            _count: true,
        });

        const total = await prisma.admission.count({ where: { collegeId } });
        const pending = await prisma.admission.count({ where: { collegeId, status: 'pending' } });
        const approved = await prisma.admission.count({ where: { collegeId, status: 'approved' } });
        const rejected = await prisma.admission.count({ where: { collegeId, status: 'rejected' } });

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected,
                conversionRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
};

module.exports = {
    createAdmissionForm,
    bulkImportAdmissions,
    getAllAdmissions,
    getAdmissionDetails,
    updateAdmissionDetails,
    uploadDocuments,
    approveAdmission,
    rejectAdmission,
    sendMessageToParent,
    getAdmissionStats,
};
