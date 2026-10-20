
const express = require('express');
const { rateLimit } = require('express-rate-limit');

const {
  getProfile,
  getMentorsRoster
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');
const { googleLogin } = require('../controllers/googleAuthController');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

const googleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many Google sign-in attempts. Please try again later.'
  }
});

router.post('/google', googleLoginLimiter, googleLogin);

router.get('/profile', authMiddleware, getProfile);

router.get(
  '/roster',
  authMiddleware,
  requireRole('mentor'),
  getMentorsRoster
);

module.exports = router;
