# Email Setup Instructions

## Quick Fix: Use Gmail SMTP

### Step 1: Create Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. Under "2-Step Verification", click "App passwords"
5. Select "Mail" as the app and generate a password
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Add Environment Variables

Create a `.env.local` file in your project root with:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# App URL (for reset links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-jwt-secret-key
```

### Step 3: Restart Your Development Server

```bash
npm run dev
```

## Alternative Email Services

### Option 1: SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get your API key
3. Install: `npm install @sendgrid/mail`
4. Update `src/lib/email.ts`:

```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: options.to,
  from: process.env.FROM_EMAIL,
  subject: options.subject,
  html: options.html,
});
```

### Option 2: AWS SES

1. Set up AWS SES
2. Install: `npm install aws-sdk`
3. Configure with AWS credentials

### Option 3: Nodemailer with Custom SMTP

Use any SMTP provider (Gmail, Outlook, custom server, etc.)

## Current Status

- ✅ Email service working (console logging for development)
- ✅ Forgot password feature fully functional
- ✅ Reset links displayed in console
- ✅ Ready for production email services
- ⚠️  Currently using development mode (console logging)

## Testing

1. Try the forgot password feature
2. Check your **console/terminal** for the reset link
3. Copy the reset URL and open it in your browser
4. Reset your password using the form

## Development Mode

Currently, the email service logs reset links to the console instead of sending real emails. This is perfect for development and testing. You'll see output like:

```
============================================================
📧 PASSWORD RESET EMAIL (Development Mode)
============================================================
To: your-email@gmail.com
Subject: Reset your Reminiscence password
Reset URL: http://localhost:3000/reset-password?token=abc123...
============================================================
🔗 COPY THIS URL AND OPEN IN YOUR BROWSER TO RESET PASSWORD:
http://localhost:3000/reset-password?token=abc123...
============================================================
```
