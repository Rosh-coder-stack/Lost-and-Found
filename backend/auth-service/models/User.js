const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: [
				function () {
					return this.provider === 'local';
				},
				'Password is required for local authentication',
			],
		},
		provider: {
			type: String,
			enum: ['local', 'google'],
			default: 'local',
		},
		googleId: {
			type: String,
			default: null,
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		resetPasswordToken: {
			type: String,
			default: null,
		},
		resetPasswordExpires: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model('User', userSchema);

module.exports = User;
