import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || "Ascend Distributions <noreply@ascenddistributions.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Ascend Distributions",
    html: emailLayout(`
      <h1 style="color: #fff; font-size: 28px; margin-bottom: 16px;">Welcome, ${name}!</h1>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        You're now part of Ascend Distributions — the premium music distribution platform by Ascend Systems LLC.
        Upload once, release everywhere, and keep more of your royalties.
      </p>
      <a href="${APP_URL}/dashboard/upload" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Upload Your First Release
      </a>
    `),
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${APP_URL}/verify?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your email — Ascend Distributions",
    html: emailLayout(`
      <h1 style="color: #fff; font-size: 28px; margin-bottom: 16px;">Verify Your Email</h1>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Click the button below to verify your email address and activate your account.
      </p>
      <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Verify Email
      </a>
      <p style="color: #71717a; font-size: 14px; margin-top: 24px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your password — Ascend Distributions",
    html: emailLayout(`
      <h1 style="color: #fff; font-size: 28px; margin-bottom: 16px;">Reset Your Password</h1>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        We received a request to reset your password. Click the button below to choose a new one.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Reset Password
      </a>
      <p style="color: #71717a; font-size: 14px; margin-top: 24px;">
        This link expires in 1 hour. If you didn't request a reset, ignore this email.
      </p>
    `),
  });
}

export async function sendReleaseApprovedEmail(to: string, releaseTitle: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Release Approved: ${releaseTitle}`,
    html: emailLayout(`
      <h1 style="color: #fff; font-size: 28px; margin-bottom: 16px;">Release Approved!</h1>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Great news! Your release <strong style="color: #fff;">"${releaseTitle}"</strong> has been approved and is being distributed to all platforms.
      </p>
      <a href="${APP_URL}/dashboard/releases" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        View Release
      </a>
    `),
  });
}

export async function sendReleaseRejectedEmail(
  to: string,
  releaseTitle: string,
  reason: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Release Needs Changes: ${releaseTitle}`,
    html: emailLayout(`
      <h1 style="color: #fff; font-size: 28px; margin-bottom: 16px;">Release Needs Changes</h1>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        Your release <strong style="color: #fff;">"${releaseTitle}"</strong> requires changes before it can be distributed.
      </p>
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #fca5a5; font-size: 14px; margin: 0;"><strong>Reason:</strong> ${reason}</p>
      </div>
      <a href="${APP_URL}/dashboard/releases" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Edit Release
      </a>
    `),
  });
}

export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  const supportEmail = process.env.CONTACT_EMAIL || "support@ascenddistributions.com";
  return resend.emails.send({
    from: FROM,
    to: supportEmail,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: emailLayout(`
      <h1 style="color: #fff; font-size: 24px; margin-bottom: 16px;">New Contact Message</h1>
      <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 8px;"><strong style="color: #fff;">From:</strong> ${name} (${email})</p>
      <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 16px;"><strong style="color: #fff;">Subject:</strong> ${subject}</p>
      <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px;">
        <p style="color: #d4d4d8; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    `),
  });
}

export async function sendPayoutSentEmail(to: string, amount: string, method: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Payout Sent: ${amount}`,
    html: emailLayout(`
      <h1 style="color: #fff; font-size: 28px; margin-bottom: 16px;">Payout Sent!</h1>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Your payout of <strong style="color: #fff;">${amount}</strong> has been sent via ${method}.
        It may take 1-3 business days to appear in your account.
      </p>
      <a href="${APP_URL}/dashboard/payouts" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        View Payouts
      </a>
    `),
  });
}

function emailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin: 0; padding: 0; background-color: #000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #8B5CF6, #3B82F6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Ascend Distributions
            </span>
            <p style="color: #71717a; font-size: 12px; margin-top: 4px;">by Ascend Systems LLC</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; backdrop-filter: blur(10px);">
            ${content}
          </div>
          <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 32px;">
            &copy; ${new Date().getFullYear()} Ascend Systems LLC. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}
