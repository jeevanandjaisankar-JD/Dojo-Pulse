require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const port = Number(process.env.PORT) || 5000;

const validateEnvironment = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be configured with at least 32 characters.'
    );
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be configured.');
  }
};

const startServer = async () => {
  validateEnvironment();

  await connectDB();

  app.listen(port, () => {
    console.log('[Server] Dojo-Pulse API started successfully.');
  });
};

startServer().catch((error) => {
  console.error('[Server] Startup failed:', error.message);
  process.exit(1);
});