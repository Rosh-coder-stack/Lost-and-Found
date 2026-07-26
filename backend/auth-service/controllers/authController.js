const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
			user: {
				_id: user._id,
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

module.exports = {
	register,
};
