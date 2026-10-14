
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const {
  login,
  getProfile,
  getMentorsRoster
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
});

router.post('/login', loginLimiter, login);
router.get('/profile', authMiddleware, getProfile);
router.get('/roster', authMiddleware, getMentorsRoster);

module.exports = router;
