const moment = require('moment');

exports.consultationConfirmationTemplate = (consultation) => {
  return {
    subject: 'Financial Consultation Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center;">Consultation Confirmation</h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p>Dear ${consultation.name},</p>
          
          <p>Your financial consultation has been successfully scheduled. Here are the details:</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
            <p><strong>Date:</strong> ${moment(consultation.consultationSlot.date).format('MMMM DD, YYYY')}</p>
            <p><strong>Time:</strong> ${consultation.consultationSlot.time}</p>
            <p><strong>Type:</strong> ${consultation.planningType} Planning</p>
            <p><strong>Analyst:</strong> ${consultation.consultationSlot.analyst.name}</p>
          </div>
          
          <h3 style="color: #2c3e50;">Required Documents</h3>
          <p>We have received the following documents:</p>
          <ul>
            ${consultation.documents.map(doc => `
              <li>${doc.filename}</li>
            `).join('')}
          </ul>
          
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Please be available 5 minutes before the scheduled time</li>
              <li>Keep all your documents ready for discussion</li>
              <li>Prepare any questions you may have about your financial planning</li>
            </ul>
          </div>
          
          <p style="margin-top: 20px;">
            Need to reschedule? Please contact us at least 24 hours before your appointment.
          </p>
        </div>
        
        <div style="text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 20px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };
};

exports.analystNotificationTemplate = (consultation) => {
  return {
    subject: 'New Consultation Assignment',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center;">New Consultation Assignment</h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p>Hello ${consultation.consultationSlot.analyst.name},</p>
          
          <p>You have been assigned a new financial consultation. Here are the details:</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
            <p><strong>Client:</strong> ${consultation.name}</p>
            <p><strong>Date:</strong> ${moment(consultation.consultationSlot.date).format('MMMM DD, YYYY')}</p>
            <p><strong>Time:</strong> ${consultation.consultationSlot.time}</p>
            <p><strong>Type:</strong> ${consultation.planningType} Planning</p>
            <p><strong>Client Email:</strong> ${consultation.email}</p>
            <p><strong>Client Phone:</strong> ${consultation.phone}</p>
          </div>
          
          <p>The client has submitted the following documents:</p>
          <ul>
            ${consultation.documents.map(doc => `
              <li><a href="${process.env.BASE_URL}/uploads/${doc.path}">${doc.filename}</a></li>
            `).join('')}
          </ul>
          
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p>Please review the documents before the consultation.</p>
          </div>
        </div>
      </div>
    `
  };
};

exports.reminderTemplate = (consultation) => {
  return {
    subject: 'Upcoming Financial Consultation Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center;">Consultation Reminder</h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p>Dear ${consultation.name},</p>
          
          <p>This is a reminder about your upcoming financial consultation:</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
            <p><strong>Date:</strong> ${moment(consultation.consultationSlot.date).format('MMMM DD, YYYY')}</p>
            <p><strong>Time:</strong> ${consultation.consultationSlot.time}</p>
            <p><strong>Type:</strong> ${consultation.planningType} Planning</p>
          </div>
          
          <p>Please ensure you have all necessary documents ready for the consultation.</p>
        </div>
      </div>
    `
  };
}; 