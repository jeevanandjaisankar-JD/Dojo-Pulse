const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');
const router = express.Router();

router.get(
  '/stats',
  authMiddleware,
  requireRole('mentor'),
  getDashboardStats
);

module.exports = router;
