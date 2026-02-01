const nodemailer = require('nodemailer');

const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

const transporter = nodemailer.createTransport(emailConfig);

/**
 * Send an email
 */
exports.sendEmail = async ({ to, subject, html }) => {
    // Check if mock email is enabled
    if (process.env.MOCK_EMAIL === 'true') {
        console.log('--- MOCK EMAIL START ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('Body:', html);
        console.log('--- MOCK EMAIL END ---');
        return { messageId: 'mock-id-' + Date.now() };
    }

    try {
        const info = await transporter.sendMail({
            from: `"CreditLeliya Support" <${emailConfig.auth.user}>`,
            to,
            subject,
            html
        });
        console.log(`[MailService] Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[MailService] Error sending email:', error);
        // In testing, we don't want to crash the flow if mail fails
        return { messageId: 'failed-id-' + Date.now(), error: true };
    }
};

/**
 * Send OTP for Login or Sign Up
 */
exports.sendOTP = async (email, otp) => {
    const subject = 'Your CreditLeliya OTP Code';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1890ff; text-align: center;">CreditLeliya Verification</h2>
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for authenticating with CreditLeliya is:</p>
      <div style="background-color: #f0f2f5; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">© 2024 CreditLeliya Financial Services. All rights reserved.</p>
    </div>
  `;
    return exports.sendEmail({ to: email, subject, html });
};

/**
 * Send Password Reset Link
 */
exports.sendResetLink = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request - CreditLeliya';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1890ff; text-align: center;">CreditLeliya Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1890ff; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #1890ff;">${resetUrl}</p>
      <p>This link will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">© 2024 CreditLeliya Financial Services. All rights reserved.</p>
    </div>
  `;
    return exports.sendEmail({ to: email, subject, html });
};
