const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} token - Password reset token
 */
exports.sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/reset-password/${token}`;
    
    // Create test transporter (for development)
    // In production, you would replace this with your actual email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal_password'
      }
    });

    // Define email options
    const mailOptions = {
      from: `"Prestigio Motors" <${process.env.EMAIL_FROM || 'support@prestigiomotors.com'}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${resetUrl}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      html: `
        <div style="max-width:600px; margin:auto; font-family:Arial, sans-serif; color:#333;">
          <div style="background:#000; padding:20px; text-align:center;">
            <h1 style="color:#fff; margin:0;">Prestigio Motors</h1>
          </div>
          <div style="padding:20px; border:1px solid #ddd; border-top:none;">
            <h2>Password Reset Request</h2>
            <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the button below to complete the process:</p>
            <div style="text-align:center; margin:30px 0;">
              <a href="${resetUrl}" style="background:#cd9c5e; color:#fff; padding:12px 30px; text-decoration:none; border-radius:4px; display:inline-block; font-weight:bold;">Reset Password</a>
            </div>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <hr style="border:1px solid #eee; margin:30px 0;">
            <p style="font-size:12px; color:#777; text-align:center;">
              &copy; ${new Date().getFullYear()} Prestigio Motors. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
}; 