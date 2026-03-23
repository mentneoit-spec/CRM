const express = require('express');
const router = express.Router();

const { uploadLocal, uploadMemory } = require('../utils/file-upload-service');
const { uploadProfile, uploadDocuments, deleteFile } = require('../controllers/upload-controller');

const useS3 = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    (process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME)
);

// Frontend uses field name: "files" for uploads
const uploadImages = useS3 ? uploadMemory('files', 1, 'image') : uploadLocal('files', 1, 'image');
const uploadDocs = useS3 ? uploadMemory('files', 10, 'all') : uploadLocal('files', 10, 'all');

router.post('/profile', uploadImages, uploadProfile);
router.post('/documents', uploadDocs, uploadDocuments);
router.delete('/:fileKey', deleteFile);

// Ensure multer/fileFilter errors return JSON (instead of default HTML/stack)
router.use((err, req, res, next) => {
  if (!err) return next();
  const message = err?.message || 'Upload failed';
  const status = String(message).toLowerCase().includes('invalid file type') ? 400 : 500;
  return res.status(status).json({ success: false, message });
});

module.exports = router;
