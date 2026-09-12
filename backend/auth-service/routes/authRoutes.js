const express = require('express');
const {
	register,
	login,
	forgotPassword,
	resetPassword,
	getUserById,
	getAllUsers,
	updateUserStatus,
	getAdminUserById,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

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

// @route   GET /api/v1/auth/users/:id
// @desc    Get safe public user profile by ID
// @access  Public / Internal
router.get('/users/:id', getUserById);

// @route   GET /api/v1/auth/admin/users
// @desc    Get all registered users (Admin only)
// @access  Private (Admin)
router.get('/admin/users', protect, authorize('admin'), getAllUsers);

// @route   GET /api/v1/auth/admin/users/:id
// @desc    Get complete user details by ID (Admin only)
// @access  Private (Admin)
router.get('/admin/users/:id', protect, authorize('admin'), getAdminUserById);

// @route   PATCH /api/v1/auth/admin/users/:id/status
// @desc    Update user account status (Enable/Disable) (Admin only)
// @access  Private (Admin)
router.patch('/admin/users/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;

