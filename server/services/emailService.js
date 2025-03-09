const nodemailer = require('nodemailer');
const emailTemplates = require('../utils/emailTemplates');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

class EmailService {
  static async sendEmail(to, template) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: template.subject,
        html: template.html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendConsultationConfirmation(consultation) {
    const template = emailTemplates.consultationConfirmationTemplate(consultation);
    await this.sendEmail(consultation.email, template);
  }

  static async sendAnalystNotification(consultation) {
    const template = emailTemplates.analystNotificationTemplate(consultation);
    await this.sendEmail(consultation.consultationSlot.analyst.email, template);
  }

  static async sendConsultationReminder(consultation) {
    const template = emailTemplates.reminderTemplate(consultation);
    await this.sendEmail(consultation.email, template);
  }

  static async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1890ff; text-align: center;">Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #1890ff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService; 