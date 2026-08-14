const nodemailer = require('nodemailer'); // use nodemailer for sending emails

/**
 * Creates and returns a Nodemailer transporter instance using environment variables.
 */
const createTransporter = () => { // To send emails, we need to create a transporter using nodemailer. This transporter will be configured with SMTP settings from environment variables.

	const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
	const port = parseInt(process.env.SMTP_PORT || '2525', 10);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== undefined
		? process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true'
		: false;

	const transportOptions = {
		host,
		port,
		secure: port === 465, // true for 465, false for other ports
		tls: {
			rejectUnauthorized,
		},
	};

	if (user && pass) {
		transportOptions.auth = { user, pass };
	}

	return nodemailer.createTransport(transportOptions); // return the transporter instance
};

/**
 * Sends a password reset email with the reset link.
 * @param {string} toEmail - Recipient email address
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (toEmail, resetToken) => {
	const transporter = createTransporter();
	const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
	const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

	const mailOptions = {
		from: process.env.SMTP_FROM || process.env.FROM_EMAIL || '"Lost and Found Support" <noreply@lostandfound.com>',
		to: toEmail,
		subject: 'Password Reset Request',
		text: `You requested a password reset for your account.\n\nPlease click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
		html: `
			<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
				<h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
				<p style="color: #475569; font-size: 16px; line-height: 1.6;">You are receiving this email because you (or someone else) requested a password reset for your account.</p>
				<p style="color: #475569; font-size: 16px; line-height: 1.6;">Please click the button below to reset your password. This link will expire in <strong>15 minutes</strong>.</p>
				<div style="text-align: center; margin: 32px 0;">
					<a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
				</div>
				<p style="color: #64748b; font-size: 14px; line-height: 1.6;">If the button above doesn't work, copy and paste the following link into your browser:</p>
				<p style="color: #4f46e5; font-size: 14px; word-break: break-all;"><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
				<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
				<p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
			</div>
		`,
	};

	return await transporter.sendMail(mailOptions);
};

module.exports = {
	sendPasswordResetEmail,
};
