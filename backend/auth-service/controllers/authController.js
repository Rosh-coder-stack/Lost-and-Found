const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

		// Step 5: Compare the provided plain text password with the stored hashed password using bcrypt.compare()
		const isPasswordMatch = await bcrypt.compare(password, user.password);

		// Step 6: If password does not match, return a 401 Unauthorized response
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		// Step 7: Generate a JWT token using jsonwebtoken
		// Payload includes user's _id and role
		const payload = {
			_id: user._id,
			id: user._id,
			role: user.role,
		};

		// Sign token using JWT_SECRET from process.env, set to expire in 1 day ('1d')
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '1d',
		});

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

module.exports = {
	register,
	login,
};

