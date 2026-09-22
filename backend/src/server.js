require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`[Server] Dojo-Pulse API listening on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('[Server] Failed to start:', error);
  process.exit(1);
});
