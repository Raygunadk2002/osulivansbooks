/**
 * Email service for sending member credentials and notifications
 */

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Generate HTML email template for new member credentials
 */
export function generateWelcomeEmailTemplate(
  displayName: string,
  email: string,
  password: string,
  houseName: string = "O'Sullivan House"
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${houseName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .credentials-box {
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .credential-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .credential-item:last-child {
          border-bottom: none;
        }
        .credential-label {
          font-weight: 600;
          color: #475569;
        }
        .credential-value {
          font-family: 'Monaco', 'Menlo', monospace;
          background: white;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
        }
        .password {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #92400e;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .warning {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${houseName}</div>
          <p>Welcome to our shared holiday home!</p>
        </div>
        
        <h2>Hello ${displayName}!</h2>
        
        <p>Welcome to ${houseName}! You've been added as a member and can now access our booking system.</p>
        
        <div class="credentials-box">
          <h3 style="margin-top: 0; color: #1e293b;">Your Login Credentials</h3>
          <div class="credential-item">
            <span class="credential-label">Email:</span>
            <span class="credential-value">${email}</span>
          </div>
          <div class="credential-item">
            <span class="credential-label">Password:</span>
            <span class="credential-value password">${password}</span>
          </div>
        </div>
        
        <div class="warning">
          <strong>Important:</strong> Please save this password securely. You can change it after your first login.
        </div>
        
        <p>You can now:</p>
        <ul>
          <li>View the house calendar and availability</li>
          <li>Request bookings for your stay</li>
          <li>View house notices and announcements</li>
          <li>Access your booking history</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
            Access Your Account
          </a>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact the admin team.</p>
        
        <div class="footer">
          <p>Best regards,<br>The ${houseName} Team</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version of the email
 */
export function generateWelcomeEmailText(
  displayName: string,
  email: string,
  password: string,
  houseName: string = "O'Sullivan House"
): string {
  return `
Welcome to ${houseName}!

Hello ${displayName},

Welcome to ${houseName}! You've been added as a member and can now access our booking system.

Your Login Credentials:
Email: ${email}
Password: ${password}

IMPORTANT: Please save this password securely. You can change it after your first login.

You can now:
- View the house calendar and availability
- Request bookings for your stay
- View house notices and announcements
- Access your booking history

Access your account at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

If you have any questions or need assistance, please don't hesitate to contact the admin team.

Best regards,
The ${houseName} Team

This is an automated message. Please do not reply to this email.
  `.trim();
}

/**
 * Send email using a service (placeholder for actual email service integration)
 * In production, you would integrate with services like:
 * - SendGrid
 * - AWS SES
 * - Resend
 * - Nodemailer with SMTP
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // For development, we'll just log the email
    console.log('📧 Email would be sent:', {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html.substring(0, 200) + '...',
    });
    
    // In production, replace this with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailData);
    
    // For now, simulate success
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send welcome email to new member
 */
export async function sendWelcomeEmail(
  displayName: string,
  email: string,
  password: string,
  houseName: string = "O'Sullivan House"
): Promise<{ success: boolean; error?: string }> {
  const subject = `Welcome to ${houseName} - Your Account Details`;
  const html = generateWelcomeEmailTemplate(displayName, email, password, houseName);
  const text = generateWelcomeEmailText(displayName, email, password, houseName);
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
