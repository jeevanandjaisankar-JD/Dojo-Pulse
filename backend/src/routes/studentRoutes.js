const express = require('express');
const { getStudents, getStudentById } = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getStudents);
router.get('/:id', authMiddleware, getStudentById);

module.exports = router;
