require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const app = require('./app');
const connectDB = require('../config/db');
const { connectRedis } = require('../config/redis');

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`[Item Service] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[Item Service] Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

