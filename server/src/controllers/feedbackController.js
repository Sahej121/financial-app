const nodemailer = require('nodemailer');

// Email configuration (you should move this to environment variables)
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      feedbackType,
      service,
      rating,
      message,
      timestamp,
      source
    } = req.body;

    // Validate required fields
    if (!name || !email || !feedbackType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, feedback type, and message)'
      });
    }

    // Log feedback to console (in production, you'd save to database)
    console.log('=== NEW FEEDBACK RECEIVED ===');
    console.log('Timestamp:', timestamp || new Date().toISOString());
    console.log('Source:', source || 'Unknown');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone || 'Not provided');
    console.log('Feedback Type:', feedbackType);
    console.log('Related Service:', service || 'Not specified');
    console.log('Rating:', rating || 'Not provided');
    console.log('Message:', message);
    console.log('User Agent:', req.get('User-Agent'));
    console.log('IP Address:', req.ip || req.connection.remoteAddress);
    console.log('================================');

    // Prepare email content
    const emailSubject = `New Feedback: ${feedbackType.toUpperCase()} - ${name}`;
    const emailBody = `
      <h2>New Feedback Received</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Contact Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      </div>

      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Feedback Details</h3>
        <p><strong>Type:</strong> ${feedbackType}</p>
        <p><strong>Related Service:</strong> ${service || 'Not specified'}</p>
        <p><strong>Rating:</strong> ${rating ? `${rating}/5 stars` : 'Not provided'}</p>
        <p><strong>Source:</strong> ${source || 'Unknown'}</p>
      </div>

      <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Message</h3>
        <p style="line-height: 1.6;">${message}</p>
      </div>

      <div style="background: #f1f8e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Technical Details</h3>
        <p><strong>Timestamp:</strong> ${timestamp || new Date().toISOString()}</p>
        <p><strong>IP Address:</strong> ${req.ip || req.connection.remoteAddress}</p>
        <p><strong>User Agent:</strong> ${req.get('User-Agent')}</p>
      </div>

      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This feedback was submitted through the CreditLeliya FAQ page feedback form.
      </p>
    `;

    // Send email notification (optional - comment out if email not configured)
    try {
      await transporter.sendMail({
        from: `"CreditLeliya Feedback" <${emailConfig.auth.user}>`,
        to: process.env.FEEDBACK_EMAIL || 'admin@creditleliya.com',
        subject: emailSubject,
        html: emailBody
      });
      console.log('Feedback email notification sent successfully');
    } catch (emailError) {
      console.log('Email notification failed (this is optional):', emailError.message);
      // Don't fail the request if email fails
    }

    // Send auto-reply to user (optional)
    try {
      const userReplySubject = 'Thank you for your feedback - CreditLeliya';
      const userReplyBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1890ff;">Thank you for your feedback!</h2>
          
          <p>Dear ${name},</p>
          
          <p>We have received your feedback and truly appreciate you taking the time to share your thoughts with us.</p>
          
          <div style="background: #f8fbff; padding: 20px; border-left: 4px solid #1890ff; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1890ff;">Your Feedback Summary:</h3>
            <p><strong>Type:</strong> ${feedbackType}</p>
            <p><strong>Service:</strong> ${service || 'General'}</p>
            <p><strong>Rating:</strong> ${rating ? `${rating}/5 stars` : 'Not provided'}</p>
          </div>
          
          <p>Our team will review your feedback and get back to you within 24-48 hours if a response is needed.</p>
          
          <p>If you have any urgent concerns, please don't hesitate to contact us directly at:</p>
          <ul>
            <li>Email: support@creditleliya.com</li>
            <li>Phone: +91 98765 43210</li>
          </ul>
          
          <p>Thank you for helping us improve our services!</p>
          
          <p>Best regards,<br>
          The CreditLeliya Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"CreditLeliya Support" <${emailConfig.auth.user}>`,
        to: email,
        subject: userReplySubject,
        html: userReplyBody
      });
      console.log('Auto-reply sent to user successfully');
    } catch (emailError) {
      console.log('Auto-reply failed (this is optional):', emailError.message);
      // Don't fail the request if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We have received your message and will get back to you soon.',
      data: {
        feedbackId: `FB_${Date.now()}`,
        timestamp: timestamp || new Date().toISOString(),
        status: 'received'
      }
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error processing your feedback. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get feedback statistics (optional endpoint for admin dashboard)
exports.getFeedbackStats = async (req, res) => {
  try {
    // This would typically query a database
    // For now, returning mock statistics
    const stats = {
      totalFeedback: 156,
      avgRating: 4.2,
      feedbackByType: {
        suggestion: 45,
        compliment: 67,
        complaint: 23,
        'bug-report': 12,
        'feature-request': 9
      },
      recentFeedback: 12,
      responseRate: 98.5
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics'
    });
  }
}; 