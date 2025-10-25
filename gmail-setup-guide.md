# Gmail Setup Guide - Get Real Emails Working

## Step 1: Create Gmail App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Sign in with your Gmail account

2. **Enable 2-Step Verification**
   - Click "Security" in the left sidebar
   - Under "Signing in to Google", click "2-Step Verification"
   - Follow the setup process if not already enabled

3. **Generate App Password**
   - Still in Security settings
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" as the app
   - Generate password (you'll get a 16-character password like `abcd efgh ijkl mnop`)

## Step 2: Create Environment File

Create a file called `.env.local` in your project root with:

```env
# Gmail Configuration for sending emails
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# App URL (for reset links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-secret-key-here
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the app password from Step 1

## Step 3: Restart Development Server

```bash
npm run dev
```

## Step 4: Test

1. Go to your login page
2. Click "Forgot password?"
3. Enter your Gmail address
4. Check your Gmail inbox for the reset email!

## Troubleshooting

**If you still don't receive emails:**

1. **Check spam folder**
2. **Verify app password** - make sure it's 16 characters with no spaces
3. **Check console** - look for error messages
4. **Try different Gmail account** - some accounts have restrictions

**Console should show:**
```
✅ Password reset email sent to: your-email@gmail.com
```

**If you see errors:**
```
❌ Email sending failed: [error message]
```
Copy the error and check the troubleshooting section.

## Alternative: Use Console Links (Current Method)

If you can't set up Gmail, the current system will show reset links in your console. Just copy the URL and open it in your browser to reset your password.

---

**Need help?** The console will show detailed instructions if Gmail setup fails.







