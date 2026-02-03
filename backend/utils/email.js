//backend/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Optional: verify transporter on startup (logs an error if SMTP creds wrong)
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP transporter verify failed:', err);
  } else {
    console.log('SMTP transporter ready');
  }
});

// Approval Email
async function sendApprovalEmail(toEmail, name, token) {
  const signupLink = `http://localhost:3000/signup?token=${token}`;

  const mailOptions = {
    from: `"Your Agency" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: ' Your Influencer Request is Approved',
    html: `
      <p>Hello ${name},</p>
      <p>Your request has been approved! Click the link below to complete your signup:</p>
      <a href="${signupLink}">Click here to Complete Signup Process.</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Approval email sent:', info.messageId);
  return info; // return info so caller can inspect or log
}

// Rejection Email
async function sendRejectionEmail(toEmail, name) {
  const mailOptions = {
    from: `"Your Agency" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your Influencer Request was Rejected',
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for applying. Unfortunately, your request has NOT been approved at this time.</p>
      <p>You may try again in the future.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Rejection email sent:', info.messageId);
  return info;
}

module.exports = { sendApprovalEmail, sendRejectionEmail };
