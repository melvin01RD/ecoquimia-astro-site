// /src/lib/mailer.ts
import type { Options as SMTPTransportOptions } from "nodemailer/lib/smtp-transport";
import nodemailer from "nodemailer";
import { Resend } from "resend";

type SendPayload = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

function hasResend() {
  return !!import.meta.env.RESEND_API_KEY;
}

async function sendWithResend(p: SendPayload) {
  const resend = new Resend(import.meta.env.RESEND_API_KEY as string);
  const { data, error } = await resend.emails.send({
    from: p.from,
    to: Array.isArray(p.to) ? p.to : [p.to],
    subject: p.subject,
    html: p.html,
    text: p.text,
    reply_to: p.replyTo,
  });
  if (error || !data?.id) throw new Error(`Resend error: ${String(error)}`);
  return { id: data.id };
}

async function sendWithSMTP(p: SendPayload) {
  const host = import.meta.env.SMTP_HOST as string;
  const port = Number(import.meta.env.SMTP_PORT || 465);
  const secure = String(import.meta.env.SMTP_SECURE || "true") === "true";
  const user = import.meta.env.SMTP_USER as string;
  const pass = import.meta.env.SMTP_PASS as string;

  if (!host || !user || !pass) {
    throw new Error("SMTP env missing (SMTP_HOST/SMTP_USER/SMTP_PASS).");
  }

  const transportOptions: SMTPTransportOptions = {
    host, port, secure,
    auth: { user, pass },
  };

  const transporter = nodemailer.createTransport(transportOptions);

  const info = await transporter.sendMail({
    from: p.from,
    to: p.to,
    subject: p.subject,
    html: p.html,
    text: p.text,
    replyTo: p.replyTo,
  });

  if (!info?.messageId) throw new Error("SMTP send failed (no messageId)");
  return { id: info.messageId };
}

export async function sendMail(payload: SendPayload) {
  try {
    if (hasResend()) {
      return await sendWithResend(payload);
    }
    return await sendWithSMTP(payload);
  } catch (err) {
    return { error: String(err) };
  }
}
