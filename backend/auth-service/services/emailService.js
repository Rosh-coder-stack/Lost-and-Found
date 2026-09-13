const nodemailer = require('nodemailer');

/**
 * Creates and returns a Nodemailer transporter instance using environment variables.
 */
const createTransporter = () => {
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

	return nodemailer.createTransport(transportOptions);
};

/**
 * Generic reusable function to send an email via Nodemailer.
 * @param {Object} options - Email parameters
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Subject line of the email
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML content
 * @param {string} [options.from] - Sender email address (defaults to configured SMTP_FROM or default)
 * @param {Array} [options.attachments] - Optional email attachments
 * @param {string|string[]} [options.cc] - Optional CC recipient(s)
 * @param {string|string[]} [options.bcc] - Optional BCC recipient(s)
 * @param {string} [options.replyTo] - Optional Reply-To address
 * @returns {Promise<Object>} Nodemailer sendMail result info
 */
const sendEmail = async ({ to, subject, text, html, from, attachments, cc, bcc, replyTo }) => {
	if (!to || (Array.isArray(to) && to.length === 0)) {
		throw new Error('Recipient email ("to") is required');
	}

	if (!subject) {
		throw new Error('Email subject ("subject") is required');
	}

	if (!text && !html) {
		throw new Error('Email content ("text" or "html") is required');
	}

	const transporter = createTransporter();
	const defaultFrom = process.env.SMTP_FROM || process.env.FROM_EMAIL || '"Lost and Found Support" <noreply@lostandfound.com>';

	const mailOptions = {
		from: from || defaultFrom,
		to, 
		subject,
		...(text && { text }),
		...(html && { html }),
		...(attachments && { attachments }),
		...(cc && { cc }),
		...(bcc && { bcc }),
		...(replyTo && { replyTo }),
	};

	return await transporter.sendMail(mailOptions);
};

/**
 * Sends a password reset email with the reset link.
 * Refactored to use the generic sendEmail() function internally.
 * @param {string} toEmail - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} Nodemailer sendMail result info
 */
const sendPasswordResetEmail = async (toEmail, resetToken) => {
	const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
	const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

	const text = `You requested a password reset for your account.\n\nPlease click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

	const html = `
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
	`;

	return await sendEmail({
		to: toEmail,
		subject: 'Password Reset Request',
		text,
		html,
	});
};

module.exports = {
	createTransporter,
	sendEmail,
	sendPasswordResetEmail,
};
