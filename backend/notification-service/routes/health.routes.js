const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Notification Service',
    message: 'Notification Service is active and healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
