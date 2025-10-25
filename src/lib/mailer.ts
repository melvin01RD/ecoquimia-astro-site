// src/lib/mailer.ts
import { Resend } from "resend";
import nodemailer from "nodemailer";

/** ------------- ENV ------------- **/
const RESEND_API_KEY =
  process.env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;

const CONTACT_TO =
  process.env.CONTACT_TO ?? import.meta.env.CONTACT_TO;

const CONTACT_FROM =
  process.env.CONTACT_FROM ?? import.meta.env.CONTACT_FROM;

// Si usas un remitente específico para Resend (dominio verificado o onboarding@resend.dev)
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? import.meta.env.RESEND_FROM_EMAIL ?? CONTACT_FROM;

// SMTP config (fallback)
const SMTP_HOST = process.env.SMTP_HOST ?? import.meta.env.SMTP_HOST ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? import.meta.env.SMTP_PORT ?? 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? import.meta.env.SMTP_SECURE ?? "true") === "true";
const SMTP_USER = process.env.SMTP_USER ?? import.meta.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? import.meta.env.SMTP_PASS ?? "";
const SMTP_FROM_EMAIL =
  process.env.SMTP_FROM_EMAIL ?? import.meta.env.SMTP_FROM_EMAIL ?? CONTACT_FROM;

/** ------------- Tipos ------------- **/
export type SendPayload = {
  to?: string | string[];       // si no lo pasas, usa CONTACT_TO
  from?: string;                // si no lo pasas, usa RESEND_FROM_EMAIL / SMTP_FROM_EMAIL
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];  // “Responder a”
};

function canUseResend() {
  return Boolean(RESEND_API_KEY);
}

function canUseSmtp() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

/** ------------- Proveedor: Resend ------------- **/
async function sendViaResend(payload: SendPayload) {
  const resend = new Resend(RESEND_API_KEY as string);

  const to = payload.to ?? CONTACT_TO;
  const from = payload.from ?? RESEND_FROM_EMAIL;

  if (!to || !from) throw new Error("Faltan 'to' o 'from' para Resend.");

  // Nota: el SDK acepta 'reply_to' (snake_case)
const result = await (resend.emails as any).send({
  to,
  from,
  subject: payload.subject,
  html: payload.html,
  text: payload.text,
  reply_to: payload.replyTo,
});

  return { provider: "resend", id: (result as any)?.id ?? null };
}

/** ------------- Proveedor: SMTP (Nodemailer) ------------- **/
async function sendViaSmtp(payload: SendPayload) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const to = payload.to ?? CONTACT_TO;
  const from = payload.from ?? SMTP_FROM_EMAIL ?? SMTP_USER;

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
