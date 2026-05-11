import { Resend } from "resend";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Resend API key. Set RESEND_API_KEY in your environment.");
  }
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  resetToken: string
) {
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
  const resend = getResendClient();

  await resend.emails.send({
    from: "ALM Voting System <onboarding@resend.dev>",
    to: email,
    subject: "Reset Your ALM Voting System Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background-color: #1a2744; padding: 40px 30px; text-align: center;">
              <h1 style="color: #c9a84c; margin: 0; font-size: 28px; letter-spacing: 2px;">ALM</h1>
              <p style="color: white; margin: 8px 0 0; font-size: 14px;">Association of Liberians in Musanze</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1a2744; margin: 0 0 16px;">Password Reset Request</h2>
              <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">Hello ${fullName},</p>
              <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">We received a request to reset your password for your ALM Voting System account. Click the button below to create a new password.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background-color: #c9a84c; color: #1a2744; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Reset My Password</a>
              </div>
              <div style="background-color: #fff8e6; border-left: 4px solid #c9a84c; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="color: #555; margin: 0; font-size: 14px;">⏰ This link expires in <strong>1 hour</strong>.<br/>🔒 If you did not request this, ignore this email — your password will not change.</p>
              </div>
              <p style="color: #888; font-size: 12px; margin: 24px 0 0;">If the button does not work, copy and paste this link:<br/><a href="${resetUrl}" style="color: #1a2744; word-break: break-all;">${resetUrl}</a></p>
            </div>
            <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Association of Liberians in Musanze. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
