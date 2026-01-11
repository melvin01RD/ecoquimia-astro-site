import { Resend } from "resend";
import nodemailer from "nodemailer";
import { config } from "../config";

export type SendPayload = {
  to?: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];
};

function canUseResend() {
  return Boolean(config.email.resend.apiKey);
}

function canUseSmtp() {
  return Boolean(config.email.smtp.host && config.email.smtp.user && config.email.smtp.pass);
}

async function sendViaResend(payload: SendPayload) {
  const resend = new Resend(config.email.resend.apiKey);

  const to = payload.to ?? config.contact.to;
  const from = payload.from ?? config.email.resend.from ?? config.contact.to;

  if (!to || !from) throw new Error("Missing 'to' or 'from' for Resend.");

  const result = await resend.emails.send({
    to,
    from,
    subject: payload.subject,
    html: payload.html,
    text: payload.text ?? "",
    replyTo: payload.replyTo,
  } as any);

  if ((result as any).error) {
    throw new Error((result as any).error.message);
  }

  return { provider: "resend", id: (result as any).data?.id ?? null };
}

async function sendViaSmtp(payload: SendPayload) {
  const transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    auth: { user: config.email.smtp.user, pass: config.email.smtp.pass },
  });

  const to = payload.to ?? config.contact.to;
  const from = payload.from ?? config.email.smtp.from ?? config.contact.to;

  if (!to || !from) throw new Error("Missing 'to' or 'from' for SMTP.");

  const info = await transporter.sendMail({
    to,
    from,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  });

  return { provider: "smtp", id: (info as any).messageId ?? null };
}


export async function sendMail(payload: SendPayload) {
  const errors: unknown[] = [];

  // 1️⃣ INTENTAR RESEND PRIMERO
  if (canUseResend()) {
    try {
      return await sendViaResend(payload);
    } catch (err) {
      console.error("[mailer] Resend failed:", err);
      errors.push(err);
    }
  }

  // 2️⃣ SMTP SOLO COMO FALLBACK
  if (canUseSmtp()) {
    try {
      return await sendViaSmtp(payload);
    } catch (err) {
      console.error("[mailer] SMTP failed:", err);
      errors.push(err);
    }
  }

  // 3️⃣ SI TODO FALLA
  throw new Error(
    "All mail providers failed: " +
      errors.map((e) => String(e)).join(" | ")
  );
}
