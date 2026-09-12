const crypto = require('crypto'); // for password reset token generation
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { publishToExchange } = require('../../shared/utils/rabbitmq');
const rabbitmqConfig = require('../../shared/config/rabbitmq');

const generateToken = (user) => {
	return jwt.sign(
		{
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		},  // Payload

		process.env.JWT_SECRET, // secret key for signing the token
		{
			expiresIn: '1d',
		}
	);
};


/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res) => {
	try {
		const { name, fullName, email, password } = req.body;

		const userName = name || fullName;

		// 1. Input Validation
		if (!userName || !email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide all required fields: name, email, and password',
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: 'Password must be at least 6 characters long',
			});
		}

		// Basic email format check
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: 'Please provide a valid email address',
			});
		}

		const normalizedEmail = email.toLowerCase().trim();

		// 2. Check if user already exists
		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User already exists with this email address',
			});
		}

		// 3. Hash Password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// 4. Create and Save User in MongoDB
		const user = await User.create({
			name: userName.trim(),
			email: normalizedEmail,
			password: hashedPassword,
		});

		// 5. Return Clean JSON Response
		const token = generateToken(user);

		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
			token,
			user: {
				_id: user._id,
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		console.error(`Register Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error occurred during user registration',
			error: error.message,
		});
	}
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
	try {
		// Step 1: Extract email and password from the incoming request body
		const { email, password } = req.body;

		// Step 2: Validate that both required fields (email and password) are provided
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide both email and password',
			});
		}

		// Normalize email to lowercase and trim extra spaces for consistent database lookup
		const normalizedEmail = email.toLowerCase().trim();

		// Step 3: Find the user in MongoDB by their email address
		const user = await User.findOne({ email: normalizedEmail });

		// Step 4: Check if user exists. If not found, return a 404 Not Found response
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		if (!user.password || user.provider === 'google') {
			return res.status(400).json({
				success: false,
				message: 'This account was registered using Google Sign-In. Please sign in with Google.',
			});
		}

		// Step 5: Compare the provided plain text password with the stored hashed password using bcrypt.compare()
		const isPasswordMatch = await bcrypt.compare(password, user.password);

		// Step 6: If password does not match, return a 401 Unauthorized response
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		// Step 6b: Check if the user account is disabled
		if (user.isActive === false) {
			return res.status(403).json({
				success: false,
				message: 'User account is disabled',
			});
		}

		// Step 7: Generate a JWT token using jsonwebtoken
		const token = generateToken(user);

		// Step 8: Return a JSON response containing success message, JWT token, and basic user information
		return res.status(200).json({
			success: true,
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error(`Login Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error occurred during login',
			error: error.message,
		});
	}
};

/**
 * @desc    Forgot Password - Send reset link to user's email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		// 1. Validate email input
		if (!email) {
			return res.status(400).json({
				success: false,
				message: 'Please provide an email address',
			});
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: 'Please provide a valid email address',
			});
		}

		const normalizedEmail = email.toLowerCase().trim();

		// 2. Check whether the user exists
		const user = await User.findOne({ email: normalizedEmail });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found with this email address',
			});
		}

		// 3. Generate secure random reset token using Node.js crypto
		const resetToken = crypto.randomBytes(32).toString('hex');

		// 4. Save resetPasswordToken and resetPasswordExpires (15 minutes from now) in DB
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
		await user.save();

		// 5. Publish PASSWORD_RESET_REQUESTED event to notification_exchange via RabbitMQ
		try {
			await publishToExchange(
				rabbitmqConfig.exchanges.NOTIFICATION_EXCHANGE,
				rabbitmqConfig.routingKeys.NOTIFICATION_PASSWORD_RESET,
				{
					event: 'PASSWORD_RESET_REQUESTED',
					email: user.email,
					resetToken: resetToken,
				},
				'topic'
			);
		} catch (publishError) {
			console.error(`Failed to publish password reset event to RabbitMQ: ${publishError.message}`);
			return res.status(500).json({
				success: false,
				message: 'Failed to process password reset request. Please try again later.',
				error: publishError.message,
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Password reset link has been sent to your email address',
		});
	} catch (error) {
		console.error(`Forgot Password Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error occurred during forgot password request',
			error: error.message,
		});
	}
};

/**
 * @desc    Reset Password using token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
	try {
		const token = req.body.token || req.body.resetToken || req.body.resetPasswordToken;
		const newPassword = req.body.newPassword || req.body.password;

		// 1. Validate inputs
		if (!token || !newPassword) {
			return res.status(400).json({
				success: false,
				message: 'Please provide both reset token and new password',
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: 'Password must be at least 6 characters long',
			});
		}

		// 2. Verify that token exists and has not expired
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: new Date() },
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired password reset token',
			});
		}

		// 3. Hash the new password using bcrypt
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// 4. Update user password and clear reset fields
		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		// 5. Return success response
		return res.status(200).json({
			success: true,
			message: 'Password has been reset successfully',
		});
	} catch (error) {
		console.error(`Reset Password Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error occurred during password reset',
			error: error.message,
		});
	}
};

/**
 * @desc    Get safe public user profile by ID
 * @route   GET /api/v1/auth/users/:id
 * @access  Public / Internal
 */
const getUserById = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid user ID format',
			});
		}

		const user = await User.findById(id).select('_id name email role createdAt');
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				_id: user._id,
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		console.error(`Get User By ID Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error retrieving user',
			error: error.message,
		});
	}
};

/**
 * @desc    Get all users with optional search filtering by name or email (Admin only)
 * @route   GET /api/v1/auth/admin/users?search=...
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res) => {
	try {
		const { search } = req.query;
		const queryFilter = {};

		// If search query is provided, perform case-insensitive partial match on name or email
		if (search && typeof search === 'string' && search.trim() !== '') {
			// Escape special characters to safely build RegExp from user input
			const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const searchRegex = new RegExp(escapedSearch, 'i');

			queryFilter.$or = [
				{ name: { $regex: searchRegex } },
				{ email: { $regex: searchRegex } },
			];
		}

		const users = await User.find(queryFilter)
			.select('-password -resetPasswordToken -resetPasswordExpires')
			.sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			count: users.length,
			data: users,
		});
	} catch (error) {
		console.error(`Get All Users Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error retrieving users',
			error: error.message,
		});
	}
};

/**
 * @desc    Update user status (Enable / Disable user account) (Admin only)
 * @route   PATCH /api/v1/auth/admin/users/:id/status
 * @access  Private (Admin)
 */
const updateUserStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { isActive } = req.body;

		// 1. Validate MongoDB Object ID format
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid user ID format',
			});
		}

		// 2. Strict boolean validation for isActive
		if (typeof isActive !== 'boolean') {
			return res.status(400).json({
				success: false,
				message: 'Invalid input: isActive must be a boolean value (true or false)',
			});
		}

		// 3. Find target user
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// 4. Update only isActive field and save
		user.isActive = isActive;
		await user.save();

		// 5. Build clean, safe user representation without sensitive fields
		const safeUser = {
			_id: user._id,
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isActive: user.isActive,
			provider: user.provider,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		return res.status(200).json({
			success: true,
			message: `User account has been ${isActive ? 'enabled' : 'disabled'} successfully`,
			data: safeUser,
		});
	} catch (error) {
		console.error(`Update User Status Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error updating user status',
			error: error.message,
		});
	}
};

/**
 * @desc    Get complete user details by ID (Admin only)
 * @route   GET /api/v1/auth/admin/users/:id
 * @access  Private (Admin)
 */
const getAdminUserById = async (req, res) => {
	try {
		const { id } = req.params;

		// 1. Validate MongoDB Object ID format
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid user ID format',
			});
		}

		// 2. Query user excluding sensitive credentials and reset tokens
		const user = await User.findById(id).select('-password -resetPasswordToken -resetPasswordExpires');
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				_id: user._id,
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isActive: user.isActive,
				provider: user.provider,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		});
	} catch (error) {
		console.error(`Get Admin User By ID Error: ${error.message}`);
		return res.status(500).json({
			success: false,
			message: 'Server error retrieving user details',
			error: error.message,
		});
	}
};

module.exports = {
	register,
	login,
	forgotPassword,
	resetPassword,
	getUserById,
	getAllUsers,
	updateUserStatus,
	getAdminUserById,
	generateToken,
};


