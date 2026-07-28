const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register new user account
// @access  Public
router.post('/register', register);

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', login);

module.exports = router;

