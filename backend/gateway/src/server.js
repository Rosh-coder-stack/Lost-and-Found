// Server module: starts the HTTP server listener on the specified port.
const app = require('./app');
const config = require('../config');
const { connectRedis } = require('../config/redis');

const PORT = config.port;

const startServer = async () => {
  // Connect to Redis for distributed rate limiting (with graceful fail-open fallback)
  await connectRedis();

  // Start the Gateway HTTP server
  app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(` API Gateway running on port ${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(` Auth Proxy:   http://localhost:${PORT}/api/v1/auth -> ${config.authServiceUrl}`);
    console.log(` Item Proxy:   http://localhost:${PORT}/api/v1/items -> ${config.itemServiceUrl}`);
    console.log(` Claim Proxy:  http://localhost:${PORT}/api/v1/claims -> ${config.claimServiceUrl}`);
    console.log(`===========================================`);
  });
};

startServer();

