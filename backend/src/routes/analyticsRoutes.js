const express = require('express');
const { getImprovementsAnalytics } = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/improvements', authMiddleware, getImprovementsAnalytics);

module.exports = router;
