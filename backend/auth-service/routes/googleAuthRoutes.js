const express = require('express');
const { googleAuth, googleAuthCallback } = require('../controllers/googleAuthController');

const router = express.Router();

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth 2.0 authentication flow
 * @access  Public
 */
router.get('/google', googleAuth);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth 2.0 callback endpoint
 * @access  Public
 */
router.get('/google/callback', googleAuthCallback);

module.exports = router;
