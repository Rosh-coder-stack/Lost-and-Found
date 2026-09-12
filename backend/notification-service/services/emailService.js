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

/**
 * Sends a notification email to the item reporter when a new ownership claim is submitted.
 *
 * @param {Object} claimData - Claim event details
 * @param {string} claimData.recipientEmail - Item reporter's email address
 * @param {string} [claimData.recipientName] - Item reporter's name
 * @param {string} [claimData.claimantName] - Claimant's name
 * @param {string} [claimData.itemTitle] - Title of the reported item
 * @param {string} [claimData.itemType] - Type of item ('found' or 'lost')
 * @param {string} [claimData.proofPreview] - Preview of the submitted proof
 * @param {string|Date} [claimData.submittedAt] - Timestamp when claim was submitted
 * @returns {Promise<Object>} Nodemailer sendMail result info
 */
const sendClaimSubmittedEmail = async ({
	recipientEmail,
	recipientName = 'Item Reporter',
	claimantName = 'A user',
	itemTitle = 'your reported item',
	itemType = 'found',
	proofPreview = 'No additional details provided.',
	submittedAt = new Date(),
}) => {
	const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
	const dashboardUrl = `${frontendUrl}/dashboard`;
	const formattedDate = new Date(submittedAt).toLocaleString('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short',
	});

	const subject = `New Ownership Claim Submitted: "${itemTitle}"`;

	const text = `Hello ${recipientName},\n\n` +
		`${claimantName} has submitted an ownership claim for your reported ${itemType} item: "${itemTitle}".\n\n` +
		`Submitted At: ${formattedDate}\n\n` +
		`Proof of Ownership Submitted:\n"${proofPreview}"\n\n` +
		`Please log in to your dashboard to review this claim, ask follow-up questions, or verify ownership:\n` +
		`${dashboardUrl}\n\n` +
		`Best regards,\nLost and Found Support Team\n`;

	const html = `
		<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
			<h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">New Claim Verification Request</h2>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
			<p style="color: #475569; font-size: 16px; line-height: 1.6;">
				<strong>${claimantName}</strong> has submitted an ownership claim for your reported ${itemType} item: <strong style="color: #4f46e5;">${itemTitle}</strong>.
			</p>
			<div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 6px;">
				<p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;"><strong>Submitted:</strong> ${formattedDate}</p>
				<p style="margin: 0 0 4px 0; font-size: 14px; color: #334155;"><strong>Proof of Ownership:</strong></p>
				<p style="margin: 0; font-size: 15px; color: #1e293b; font-style: italic; white-space: pre-wrap;">"${proofPreview}"</p>
			</div>
			<p style="color: #475569; font-size: 15px; line-height: 1.6;">
				Please review the proof details. You can ask follow-up questions or approve the claim directly in your dashboard:
			</p>
			<div style="text-align: center; margin: 28px 0;">
				<a href="${dashboardUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Review Claim in Dashboard</a>
			</div>
			<p style="color: #64748b; font-size: 13px; line-height: 1.6;">If the button above doesn't work, visit: <a href="${dashboardUrl}" style="color: #4f46e5;">${dashboardUrl}</a></p>
			<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
			<p style="color: #94a3b8; font-size: 12px; text-align: center;">Lost & Found Platform Notification Service</p>
		</div>
	`;

	return await sendEmail({
		to: recipientEmail,
		subject,
		text,
		html,
	});
};

module.exports = {
	createTransporter,
	sendEmail,
	sendPasswordResetEmail,
	sendClaimSubmittedEmail,
};
