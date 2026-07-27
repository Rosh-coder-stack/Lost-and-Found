const express = require('express');
const { register } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register new user account
// @access  Public
router.post('/register', register);

module.exports = router;
