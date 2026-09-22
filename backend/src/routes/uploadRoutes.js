const express = require('express');
const multer = require('multer');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadDojoFile, getUploadHistory } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', authMiddleware, upload.single('file'), uploadDojoFile);
router.get('/history', authMiddleware, getUploadHistory);

// Convert Multer validation errors into the same API error shape as the rest
// of the backend.
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
