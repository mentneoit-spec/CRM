const prisma = require('../lib/prisma');

// ==================== ADMISSION FORM ====================

// Create admission form
const createAdmissionForm = async (req, res) => {
    try {
        const collegeId = req.collegeId;
        const { studentName, fatherName, motherName, dateOfBirth, gender, email, phone, address, sclassId } = req.body;

        if (!studentName || !fatherName || !email || !phone || !address || !sclassId) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const admission = await prisma.admission.create({
            data: {
                studentName,
                fatherName,
                motherName,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                email,
                phone,
                address,
                collegeId,
                sclassId,
                status: 'pending',
            },
        });

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
        const collegeId = req.collegeId;
        const { status, page = 1, limit = 10 } = req.query;

        let filter = { collegeId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const admissions = await prisma.admission.findMany({
            where: filter,
            include: { sclass: true },
            skip: parseInt(skip),
            take: parseInt(limit),
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
            include: { sclass: true },
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
        const { studentName, fatherName, motherName, dateOfBirth, gender, email, phone, address, sclassId, documents } = req.body;

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        const updated = await prisma.admission.update({
            where: { id: admissionId },
            data: {
                studentName: studentName || admission.studentName,
                fatherName: fatherName || admission.fatherName,
                motherName: motherName || admission.motherName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : admission.dateOfBirth,
                gender: gender || admission.gender,
                email: email || admission.email,
                phone: phone || admission.phone,
                address: address || admission.address,
                sclassId: sclassId || admission.sclassId,
                documents: documents || admission.documents,
            },
            include: { sclass: true },
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

        // Create user for admitted student
        const hashedPassword = await require('bcryptjs').hash(admission.email.split('@')[0], 10);

        const user = await prisma.user.create({
            data: {
                name: admission.studentName,
                email: admission.email,
                password: hashedPassword,
                phone: admission.phone,
                role: 'Student',
                collegeId,
            },
        });

        // Create student record
        await prisma.student.create({
            data: {
                userId: user.id,
                name: admission.studentName,
                email: admission.email,
                phone: admission.phone,
                dateOfBirth: admission.dateOfBirth,
                gender: admission.gender,
                address: admission.address,
                sclassId: admission.sclassId,
                collegeId,
            },
        });

        // Update admission status
        const updated = await prisma.admission.update({
            where: { id: admissionId },
            data: { status: 'approved', approvedAt: new Date() },
        });

        res.status(200).json({
            success: true,
            message: 'Admission approved successfully',
            data: updated,
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
        const { reason } = req.body;
        const collegeId = req.collegeId;

        const admission = await prisma.admission.findUnique({
            where: { id: admissionId },
        });

        if (!admission || admission.collegeId !== collegeId) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        const updated = await prisma.admission.update({
            where: { id: admissionId },
            data: { 
                status: 'rejected',
                rejectionReason: reason,
                rejectedAt: new Date(),
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

        // Store message in audit log or separate messages table
        const auditLog = await prisma.auditLog.create({
            data: {
                action: 'ADMISSION_MESSAGE',
                description: `Message sent to ${admission.studentName}/${admission.fatherName}: ${message}`,
                collegeId,
                performedBy: req.user.id,
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
    getAllAdmissions,
    getAdmissionDetails,
    updateAdmissionDetails,
    uploadDocuments,
    approveAdmission,
    rejectAdmission,
    sendMessageToParent,
    getAdmissionStats,
};
