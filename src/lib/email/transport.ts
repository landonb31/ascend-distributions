import { Resend } from "resend";

let resend: Resend | null = null;

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail(options: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Ascend Distributions <noreply@ascenddistributions.com>";

  return resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  });
}
