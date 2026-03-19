const path = require('path');
const fs = require('fs');
const { uploadMultipleToS3, deleteFromS3 } = require('../utils/file-upload-service');

const hasS3Config = () => {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      (process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME)
  );
};

const toPublicUploadUrl = (req, filename) => {
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${encodeURIComponent(filename)}`;
};

const uploadProfile = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'File is required (field name: files)' });
    }

    const collegeId = req.collegeId || req.user?.collegeId || null;

    if (hasS3Config() && files[0]?.buffer) {
      const result = await uploadMultipleToS3(files, 'profile', collegeId);
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Error uploading file', details: result });
      }

      const uploaded = result.uploaded?.[0] || null;
      return res.status(200).json({
        success: true,
        message: 'Profile picture uploaded',
        data: uploaded,
      });
    }

    const file = files[0];
    const filename = file.filename || path.basename(file.path);
    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded',
      data: {
        success: true,
        url: toPublicUploadUrl(req, filename),
        key: filename,
        size: file.size,
        mimetype: file.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload profile error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile picture' });
  }
};

const uploadDocuments = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'Files are required (field name: files)' });
    }

    const folder = String(req.body?.folder || 'documents').trim() || 'documents';
    const collegeId = req.collegeId || req.user?.collegeId || null;

    if (hasS3Config() && files[0]?.buffer) {
      const result = await uploadMultipleToS3(files, folder, collegeId);
      if (!result.success) {
        return res.status(500).json({ success: false, message: 'Error uploading files', details: result });
      }

      return res.status(200).json({
        success: true,
        message: 'Documents uploaded',
        data: result,
      });
    }

    const uploaded = files.map((file) => {
      const filename = file.filename || path.basename(file.path);
      return {
        success: true,
        url: toPublicUploadUrl(req, filename),
        key: filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Documents uploaded',
      data: {
        success: true,
        uploaded,
        failed: [],
        total: uploaded.length,
      },
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ success: false, message: 'Error uploading documents' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileKey = String(req.params?.fileKey || '').trim();
    if (!fileKey) {
      return res.status(400).json({ success: false, message: 'fileKey is required' });
    }

    if (hasS3Config()) {
      const result = await deleteFromS3(fileKey);
      if (!result.success) {
        return res.status(500).json({ success: false, message: result.message || 'Error deleting file', details: result });
      }
      return res.status(200).json({ success: true, message: 'File deleted successfully' });
    }

    // Local delete (only allow basenames to prevent path traversal)
    const safeName = path.basename(fileKey);
    if (safeName !== fileKey) {
      return res.status(400).json({ success: false, message: 'Invalid fileKey' });
    }

    const uploadDir = path.join(__dirname, '../uploads');
    const fullPath = path.join(uploadDir, safeName);
    if (!fullPath.startsWith(uploadDir)) {
      return res.status(400).json({ success: false, message: 'Invalid fileKey' });
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
};

module.exports = {
  uploadProfile,
  uploadDocuments,
  deleteFile,
};
