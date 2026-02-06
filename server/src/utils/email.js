const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Check if SMTP credentials exist
    const hasCredentials = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!hasCredentials) {
        console.log('⚠️  [Email Service] SMTP credentials missing. Logging email to console instead.');
        console.log(`📧  To: ${options.email}`);
        console.log(`📝  Subject: ${options.subject}`);
        console.log(`📄  Message: ${options.message}`);
        return;
    }

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // 3. Define Email Options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Neurona Team'} <${process.env.FROM_EMAIL || 'no-reply@neurona.ai'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML content
    };

    // 4. Send Email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅  [Email Service] Email sent: ${info.messageId}`);
    } catch (error) {
        console.error('❌  [Email Service] Error sending email:', error);
        // Fallback to console in case of SMTP connection error
        console.log(`📧  To: ${options.email}`);
        console.log(`📝  Subject: ${options.subject}`);
        console.log(`📄  Message: ${options.message}`);
    }
};

module.exports = sendEmail;
