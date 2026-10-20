const express = require('express');
const { getStudents, getStudentById } = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');
const router = express.Router();

router.get('/', authMiddleware, requireRole('mentor'), getStudents);
router.get('/:id', authMiddleware, requireRole('mentor'), getStudentById);

module.exports = router;
