/**
 * Development-only test script for generic sendEmail function.
 * Usage: node scripts/test-email.js [recipient@example.com]
 */
require('dotenv').config();
const { sendEmail } = require('../services/emailService');

const targetEmail = process.argv[2] || process.env.SMTP_FROM || process.env.SMTP_USER;

if (!targetEmail) {
  console.error('Error: No target email specified. Provide an email argument or ensure SMTP_FROM/SMTP_USER is set in .env');
  process.exit(1);
}

async function runDevEmailTest() {
  console.log(`Sending test email to: ${targetEmail}...`);
  try {
    const result = await sendEmail({
      to: targetEmail,
      subject: 'Lost and Found - Email Service Test',
      text: 'This is a test email from the Lost-and-Found email service.',
      html: '<p>This is a test email from the Lost-and-Found email service.</p>',
    });

    console.log('✅ Email successfully sent and delivered to SMTP relay!');
    console.log('Message ID:', result.messageId);
    console.log('Accepted recipients:', result.accepted);
    console.log('SMTP Server Response:', result.response);
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    process.exit(1);
  }
}

runDevEmailTest();
