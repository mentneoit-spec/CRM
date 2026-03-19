const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// AWS S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'college-erp-files';

// File type validation
const allowedFileTypes = {
    image: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/jfif',
        'image/pjpeg',
        'image/bmp',
    ],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/csv'],
    all: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/jfif',
        'image/pjpeg',
        'image/bmp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/csv',
        'application/octet-stream',
    ],
};

// Multer storage configuration (local fallback)
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// Multer memory storage (for S3 upload)
const memoryStorage = multer.memoryStorage();

// File filter
const fileFilter = (allowedTypes = 'all') => {
    return (req, file, cb) => {
        const types = allowedFileTypes[allowedTypes] || allowedFileTypes.all;
        
        if (types.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed types: ${types.join(', ')}`), false);
        }
    };
};

// Multer upload configurations
const uploadLocal = (fieldName, maxCount = 1, allowedTypes = 'all') => {
    return multer({
        storage: localStorage,
        fileFilter: fileFilter(allowedTypes),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    }).array(fieldName, maxCount);
};

const uploadMemory = (fieldName, maxCount = 1, allowedTypes = 'all') => {
    return multer({
        storage: memoryStorage,
        fileFilter: fileFilter(allowedTypes),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    }).array(fieldName, maxCount);
};

// Upload file to S3
const uploadToS3 = async (file, folder = 'general', collegeId = null) => {
    try {
        const fileName = `${folder}/${collegeId || 'platform'}/${Date.now()}-${file.originalname}`;
        
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private', // Changed to private for security
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        return {
            success: true,
            url: fileUrl,
            key: fileName,
            size: file.size,
            mimetype: file.mimetype,
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        return {
            success: false,
            message: 'Error uploading file to S3',
            error: error.message,
        };
    }
};

// Upload multiple files to S3
const uploadMultipleToS3 = async (files, folder = 'general', collegeId = null) => {
    try {
        const uploadPromises = files.map(file => uploadToS3(file, folder, collegeId));
        const results = await Promise.all(uploadPromises);
        
        const successfulUploads = results.filter(r => r.success);
        const failedUploads = results.filter(r => !r.success);

        return {
            success: failedUploads.length === 0,
            uploaded: successfulUploads,
            failed: failedUploads,
            total: files.length,
        };
    } catch (error) {
        console.error('Multiple S3 upload error:', error);
        return {
            success: false,
            message: 'Error uploading files',
            error: error.message,
        };
    }
};

// Delete file from S3
const deleteFromS3 = async (fileKey) => {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileKey,
        };

        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);

        return {
            success: true,
            message: 'File deleted successfully',
        };
    } catch (error) {
        console.error('S3 delete error:', error);
        return {
            success: false,
            message: 'Error deleting file from S3',
            error: error.message,
        };
    }
};

// Delete multiple files from S3
const deleteMultipleFromS3 = async (fileKeys) => {
    try {
        const deletePromises = fileKeys.map(key => deleteFromS3(key));
        const results = await Promise.all(deletePromises);

        return {
            success: results.every(r => r.success),
            results,
        };
    } catch (error) {
        console.error('Multiple S3 delete error:', error);
        return {
            success: false,
            message: 'Error deleting files',
            error: error.message,
        };
    }
};

// Generate presigned URL for private file access
const getPresignedUrl = async (fileKey, expiresIn = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });

        return {
            success: true,
            url,
            expiresIn,
        };
    } catch (error) {
        console.error('Presigned URL error:', error);
        return {
            success: false,
            message: 'Error generating presigned URL',
            error: error.message,
        };
    }
};

// Validate file size
const validateFileSize = (file, maxSizeInMB = 10) => {
    const maxSize = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSize;
};

// Get file extension
const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    return `${name}-${timestamp}-${random}${ext}`;
};

// Middleware for handling file uploads
const handleFileUpload = (folder = 'general') => {
    return async (req, res, next) => {
        try {
            if (!req.files || req.files.length === 0) {
                return next();
            }

            const collegeId = req.collegeId || req.user?.collegeId;
            const uploadResults = await uploadMultipleToS3(req.files, folder, collegeId);

            if (!uploadResults.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading files',
                    details: uploadResults,
                });
            }

            req.uploadedFiles = uploadResults.uploaded;
            next();
        } catch (error) {
            console.error('File upload middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing file upload',
                error: error.message,
            });
        }
    };
};

module.exports = {
    uploadLocal,
    uploadMemory,
    uploadToS3,
    uploadMultipleToS3,
    deleteFromS3,
    deleteMultipleFromS3,
    getPresignedUrl,
    validateFileSize,
    getFileExtension,
    generateUniqueFilename,
    handleFileUpload,
    allowedFileTypes,
};
