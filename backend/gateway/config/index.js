// Config module: Loads environment variables using dotenv and exports configuration parameters.
const dotenv = require('dotenv');

// Load environment variables from .env file into process.env
dotenv.config();

const config = {
  // Port on which the API Gateway server listens
  port: process.env.PORT || 5000,

  // Target base URL for the Auth microservice
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',

  // Target base URL for the Item microservice
  itemServiceUrl: process.env.ITEM_SERVICE_URL || 'http://localhost:5002',

  // Target base URL for the Claim microservice
  claimServiceUrl: process.env.CLAIM_SERVICE_URL || 'http://localhost:5003',
};

module.exports = config;