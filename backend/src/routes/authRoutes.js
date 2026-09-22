const express = require('express');
const {
  login,
  getProfile,
  getMentorsRoster
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.get('/roster', authMiddleware, getMentorsRoster);

module.exports = router;
