const express = require('express');
const { getImprovementsAnalytics } = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');
const router = express.Router();

router.get(
  '/improvements',
  authMiddleware,
  requireRole('mentor'),
  getImprovementsAnalytics
);

module.exports = router;
