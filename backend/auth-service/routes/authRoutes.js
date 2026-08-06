const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register new user account
// @access  Public
router.post('/register', register);

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', login);

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password using reset token
// @access  Public
router.post('/reset-password', resetPassword);

module.exports = router;

