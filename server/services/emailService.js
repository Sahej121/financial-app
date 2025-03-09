const transporter = require('../config/emailConfig');
const emailTemplates = require('../utils/emailTemplates');

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
}

module.exports = EmailService; 