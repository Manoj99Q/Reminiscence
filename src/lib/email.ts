// Email service for sending password reset links
// Currently using console logging - ready for real email service

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('='.repeat(70));
    console.log('📧 PASSWORD RESET EMAIL');
    console.log('='.repeat(70));
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    // Extract the reset URL from the HTML
    const resetUrlMatch = options.html.match(/href="([^"]*)"/);
    const resetUrl = resetUrlMatch ? resetUrlMatch[1] : 'Not found';
    
    console.log('Reset URL:', resetUrl);
    console.log('='.repeat(70));
    console.log('🔗 COPY THIS URL AND OPEN IN YOUR BROWSER TO RESET PASSWORD:');
    console.log('');
    console.log(resetUrl);
    console.log('');
    console.log('='.repeat(70));
    console.log('📝 TO RECEIVE REAL EMAILS (instead of console links):');
    console.log('');
    console.log('1. Install nodemailer: npm install nodemailer');
    console.log('2. Create .env.local file in project root with:');
    console.log('   GMAIL_USER=your-email@gmail.com');
    console.log('   GMAIL_APP_PASSWORD=your-16-char-app-password');
    console.log('');
    console.log('3. Get Gmail App Password:');
    console.log('   - Go to https://myaccount.google.com/');
    console.log('   - Enable 2-Step Verification');
    console.log('   - Create App Password for Mail');
    console.log('');
    console.log('4. Restart your development server');
    console.log('');
    console.log('📖 Full guide: gmail-setup-guide.md');
    console.log('='.repeat(70));
    
    return true; // Return true to simulate successful email sending
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}

export function generatePasswordResetEmail(email: string, resetUrl: string): EmailOptions {
  return {
    to: email,
    subject: 'Reset your Reminiscence password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; margin-bottom: 10px;">Reminiscence</h1>
            <p style="color: #666; font-size: 14px;">Your personal memory keeper</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #000; margin-bottom: 20px;">Reset your password</h2>
            <p style="margin-bottom: 20px;">
              We received a request to reset your password for your Reminiscence account.
            </p>
            <p style="margin-bottom: 30px;">
              Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" 
                 style="background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #0066cc; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p>© 2024 Reminiscence. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Reset your Reminiscence password
      
      We received a request to reset your password for your Reminiscence account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      © 2024 Reminiscence. All rights reserved.
    `
  };
}
