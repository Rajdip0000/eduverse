import {createTransport} from 'nodemailer'


// Create a test account or replace with real credentials.
const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "9c01cc001@smtp-brevo.com",
    pass: "tBb9SNZzDTMfVrjR",
  },
});


export async function sendVerificationEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
    from: 'rajdipghosh24680@gmail.com',
    to: email,
    subject: "Hello ✔",
    text: "Hello world?", // plain‑text body
    html: `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #06070a, #0b1220); color: #e6eef8;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(15, 23, 36, 0.6); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <div style="background: linear-gradient(to bottom right, #BE27F5, #A820D9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                    EduVerse
                  </div>
                  <p style="color: #9aa4b2; font-size: 14px; margin: 0;">LearnSphere</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px;">
                  <h2 style="color: #e6eef8; font-size: 24px; margin: 0 0 20px;">Verify Your Email</h2>
                  <p style="color: #9aa4b2; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                    Thank you for signing up! Please use the following verification code to complete your registration:
                  </p>
                  
                  <div style="background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(190, 39, 245, 0.3); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #BE27F5; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </div>
                  
                  <p style="color: #9aa4b2; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    This code will expire in <strong style="color: #e6eef8;">10 minutes</strong>.
                  </p>
                  
                  <p style="color: #9aa4b2; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    If you didn't request this verification, please ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                  <p style="color: #9aa4b2; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} EduVerse - Built for lifelong learners
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>`, // HTML body
  })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
    from: 'rajdipghosh24680@gmail.com',
    to: email,
    subject: "Hello ✔",
    text: "Hello world?", // plain‑text body
    html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #06070a, #0b1220); color: #e6eef8;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(15, 23, 36, 0.6); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <div style="background: linear-gradient(to bottom right, #BE27F5, #A820D9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                    EduVerse
                  </div>
                  <p style="color: #9aa4b2; font-size: 14px; margin: 0;">LearnSphere</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px;">
                  <h2 style="color: #e6eef8; font-size: 24px; margin: 0 0 20px;">Reset Your Password</h2>
                  <p style="color: #9aa4b2; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                    We received a request to reset your password. Use the following code to proceed:
                  </p>
                  
                  <div style="background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(190, 39, 245, 0.3); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #BE27F5; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </div>
                  
                  <p style="color: #9aa4b2; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    This code will expire in <strong style="color: #e6eef8;">10 minutes</strong>.
                  </p>
                  
                  <p style="color: #9aa4b2; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                  <p style="color: #9aa4b2; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} EduVerse - Built for lifelong learners
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `, // HTML body
  })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}
