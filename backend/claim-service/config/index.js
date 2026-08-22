const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: process.env.PORT || 5003,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  itemServiceUrl: process.env.ITEM_SERVICE_URL || 'http://localhost:5002',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = config;
