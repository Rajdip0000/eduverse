# Email Verification Setup Guide

## Current Status (Development)

The OTP verification system is **fully functional** but currently uses **Ethereal Email** (a test email service). During development:

- ✅ OTP codes are **displayed on the verification page** 
- ✅ OTP codes are **logged to the server console**
- ✅ OTP codes are **included in the API response** (dev mode only)
- ✅ Users can copy-paste the OTP to test the flow

## How to Test in Development

1. **Sign up** with any email address
2. You'll be redirected to the **Verify Email** page
3. Look for the **yellow "Development Mode" box** showing your OTP
4. Or check your **terminal/console logs** for the OTP
5. Enter the 6-digit code to verify

Example console output:
```
=================================
📧 VERIFICATION EMAIL
=================================
Email: user@example.com
OTP Code: 123456
Expires: 11/19/2025, 10:30:00 AM
=================================
```

## Production Setup (Required for Real Emails)

### Option 1: Gmail SMTP (Recommended for Small Scale)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `lib/email.ts`**:
```typescript
const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // your-email@gmail.com
    pass: process.env.EMAIL_PASSWORD, // your-app-password
  },
});
```

4. **Add to `.env.local`**:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up** at https://sendgrid.com (Free tier: 100 emails/day)
2. **Create API Key** in Settings → API Keys
3. **Install package**:
```bash
npm install @sendgrid/mail
```

4. **Update `lib/email.ts`**:
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!, // Must be verified in SendGrid
      subject: 'Verify Your Email - EduVerse',
      html: `...your HTML template...`,
    })
    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error }
  }
}
```

5. **Add to `.env.local`**:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Option 3: Resend (Modern, Developer-Friendly)

1. **Sign up** at https://resend.com (Free tier: 3,000 emails/month)
2. **Get API Key** from dashboard
3. **Install package**:
```bash
npm install resend
```

4. **Update `lib/email.ts`**:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: 'EduVerse <onboarding@resend.dev>', // Or your domain
      to: email,
      subject: 'Verify Your Email - EduVerse',
      html: `...your HTML template...`,
    })
    return { success: true }
  } catch (error) {
    console.error('Resend error:', error)
    return { success: false, error }
  }
}
```

5. **Add to `.env.local`**:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

## Important Notes

### Security
- **Never commit** email credentials to Git
- Add `.env.local` to `.gitignore`
- Use environment variables on Vercel/production

### OTP Settings
- **Expiration**: 10 minutes (configurable in `api/auth/send-verification/route.ts`)
- **Length**: 6 digits (configurable in `generateOTP()` function)
- OTPs are stored in the `verification` table with expiration timestamps

### Vercel Deployment
Add environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `EMAIL_USER` and `EMAIL_PASSWORD` (or your provider's keys)
3. Redeploy the application

### Testing Email Templates
Use services like:
- **Mailtrap** (https://mailtrap.io) - Email testing sandbox
- **Email on Acid** - Template testing
- Send test emails to yourself

## Troubleshooting

### "Email send failed" Error
- Check email credentials are correct
- Verify SMTP settings (host, port)
- Check if Gmail blocks less secure apps
- Review server console logs for detailed errors

### OTP Not Working
- Verify OTP hasn't expired (10 min limit)
- Check database connection
- Ensure `verification` table exists (run migrations)
- Check if OTP matches exactly (case-sensitive)

### Production Issues
- Check Vercel environment variables are set
- Verify email service API limits
- Review Vercel function logs
- Ensure DATABASE_URL is correctly set

## Need Help?

Check the following files:
- `lib/email.ts` - Email sending logic
- `app/api/auth/send-verification/route.ts` - OTP generation
- `app/api/auth/verify-email/route.ts` - OTP validation
- `app/verify-email/page.tsx` - Verification UI

## Current Implementation

Using **Ethereal Email** credentials:
- Host: smtp.ethereal.email
- Port: 587
- User: maddison53@ethereal.email

**This is for TESTING ONLY!** Emails go to Ethereal's test inbox, not to real users.
