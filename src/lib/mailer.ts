// src/lib/mailer.ts
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { config } from "../config";

/** ------------- Tipos ------------- **/
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

/** ------------- Proveedor: Resend ------------- **/
async function sendViaResend(payload: SendPayload) {
  const resend = new Resend(config.email.resend.apiKey);

  const to = payload.to ?? config.contact.to;
  const from = payload.from ?? config.email.resend.from ?? config.contact.from;

  if (!to || !from) throw new Error("Faltan 'to' o 'from' para Resend.");

  // Nota: el SDK acepta 'reply_to' (snake_case) pero los tipos pueden pedir camelCase
  const result = await resend.emails.send({
    to,
    from,
    subject: payload.subject,
    html: payload.html,
    text: payload.text ?? "",
    replyTo: payload.replyTo,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { provider: "resend", id: result.data?.id ?? null };
}

/** ------------- Proveedor: SMTP (Nodemailer) ------------- **/
async function sendViaSmtp(payload: SendPayload) {
  const transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    auth: { user: config.email.smtp.user, pass: config.email.smtp.pass },
  });

  const to = payload.to ?? config.contact.to;
  const from = payload.from ?? config.email.smtp.from ?? config.contact.from;

  if (!to || !from) throw new Error("Faltan 'to' o 'from' para SMTP.");

  const info = await transporter.sendMail({
    to,
    from,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo, // nodemailer usa camelCase
  });

  return { provider: "smtp", id: info.messageId ?? null };
}

/** ------------- Facade principal ------------- **/
export async function sendMail(payload: SendPayload) {
  // 1) Intenta Resend si hay API key
  if (canUseResend()) {
    try {
      const r = await sendViaResend(payload);
      console.log("Provider used:", r.provider, r.id);
      return r;
    } catch (e) {
      console.error("Resend error, falling back to SMTP:", e);
    }
  }

  // 2) Fallback a SMTP si está configurado
  if (canUseSmtp()) {
    const r = await sendViaSmtp(payload);
    console.log("Provider used:", r.provider, r.id);
    return r;
  }

  // 3) Si no hay ninguno, error controlado
  throw new Error("No hay proveedor de correo disponible (Resend o SMTP).");
}
