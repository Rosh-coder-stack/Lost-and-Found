// Health Routes: Endpoint to check operational status of the API Gateway microservice.
const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Returns status 200 OK along with gateway metadata.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

module.exports = router;