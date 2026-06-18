import sgMail from "@sendgrid/mail";

let configured = false;

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail(options: SendEmailOptions) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!configured) {
    sgMail.setApiKey(apiKey);
    configured = true;
  }

  const from =
    process.env.SENDGRID_FROM_EMAIL ||
    "Ascend Distributions <noreply@ascenddistributions.com>";

  const [response] = await sgMail.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  });

  return response;
}
