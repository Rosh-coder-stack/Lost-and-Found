// Server module: starts the HTTP server listener on the specified port.
const app = require('./app');
const config = require('../config');

const PORT = config.port;

// Start the Gateway HTTP server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(` API Gateway running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(` Auth Proxy:   http://localhost:${PORT}/api/v1/auth -> ${config.authServiceUrl}`);
  console.log(`===========================================`);
});
