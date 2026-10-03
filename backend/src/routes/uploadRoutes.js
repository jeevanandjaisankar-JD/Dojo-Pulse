const express = require('express');
const multer = require('multer');

const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const {
  uploadDojoFile,
  getUploadHistory,
  deleteUploadHistory
} = require('../controllers/uploadController');

const router = express.Router();

// Upload a new Dojo CSV file
router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  uploadDojoFile
);

// Get upload history
router.get(
  '/history',
  authMiddleware,
  getUploadHistory
);

// Delete one upload history entry
router.delete(
  '/history/:id',
  authMiddleware,
  deleteUploadHistory
);

// Convert Multer validation errors into the same API error shape
// as the rest of the backend.
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to upload the selected file.'
    });
  }

  return next();
});

module.exports = router;