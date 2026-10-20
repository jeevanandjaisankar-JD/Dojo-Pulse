const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, service: 'dojo-pulse-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`
  });
});

app.use((error, req, res, next) => {
  const status = Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
    ? error.status
    : 500;

  if (status === 500) {
    console.error('[API Error] An unexpected server error occurred.');
  }

  res.status(status).json({
    success: false,
    message: status === 500
      ? 'An unexpected server error occurred.'
      : error.message || 'Request failed.'
  });
});

module.exports = app;
