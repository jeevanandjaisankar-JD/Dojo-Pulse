const cors = require('cors');
const express = require('express');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();


const configuredOrigins = [
  process.env.CLIENT_ORIGIN || '',
  process.env.CLIENT_ORIGINS || ''
]
  .flatMap((value) => value.split(','))
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(
  configuredOrigins.length
    ? configuredOrigins
    : ['http://localhost:3000']
);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header, such as server-to-server
    // health checks, don't need browser CORS permission.
    if (!origin) {
      return callback(null, true);
    }

    let isDojoPulsePreview = false;

    try {
      const parsedOrigin = new URL(origin);

      isDojoPulsePreview =
        parsedOrigin.protocol === 'https:' &&
        parsedOrigin.origin === origin &&
        /^dojo-pulse-[a-z0-9-]+\.vercel\.app$/i.test(
          parsedOrigin.hostname
        );
    } catch {
      isDojoPulsePreview = false;
    }

    if (allowedOrigins.has(origin) || isDojoPulsePreview) {
      return callback(null, true);
    }

    return callback(null, false);
  },
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
