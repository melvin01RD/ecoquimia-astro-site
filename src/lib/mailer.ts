import { Resend } from "resend";
import nodemailer from "nodemailer";

const RESEND_API_KEY = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
const RESEND_FROM    = process.env.RESEND_FROM    || "Ecoquimia <onboarding@resend.dev>";

const CONTACT_FROM = process.env.CONTACT_FROM || import.meta.env.CONTACT_FROM; // SMTP from
const CONTACT_TO   = process.env.CONTACT_TO   || import.meta.env.CONTACT_TO;

const SMTP_HOST   = process.env.SMTP_HOST || "";
const SMTP_PORT   = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true") === "true";
const SMTP_USER   = process.env.SMTP_USER || "";
const SMTP_PASS   = process.env.SMTP_PASS || "";

function hasSmtp() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

async function sendViaResend({
  subject, html, text, to = CONTACT_TO!, from = RESEND_FROM, replyTo,
}: { subject: string; html: string; text?: string; to?: string; from?: string; replyTo?: string }) {
  if (!RESEND_API_KEY) throw Object.assign(new Error("RESEND_API_KEY missing"), { code: "RESEND_MISSING" });
  const resend = new Resend(RESEND_API_KEY);
  const res = await resend.emails.send({ from, to, subject, html, text, replyTo });
  if (res.error) {
    console.error("Resend error:", res.error);
    throw Object.assign(new Error(res.error.message || "Resend send failed"), { code: "RESEND_ERR" });
  }
  console.log("Resend send OK ->", { to, messageId: res.data?.id });
  return { id: res.data?.id || null, provider: "resend" as const };
}

async function sendViaSmtpOnce({
  subject, html, text, to = CONTACT_TO!, from = CONTACT_FROM || SMTP_USER,
  port, secure, replyTo,
}: { subject: string; html: string; text?: string; to?: string; from?: string; port: number; secure: boolean; replyTo?: string }) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure, // true=SSL(465), false=STARTTLS(587)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.verify().catch((e) => {
    console.error(`SMTP verify failed (${port}/${secure ? "SSL" : "STARTTLS"}):`, e);
    throw e;
  });

  const info = await transporter.sendMail({ from, to, subject, html, text, replyTo });
  console.log(`SMTP send OK (${port}/${secure ? "SSL" : "STARTTLS"}) ->`, {
    to, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected,
  });
  if (info.rejected?.length) {
    throw Object.assign(new Error(`SMTP rejected: ${info.rejected.join(",")}`), { code: "SMTP_REJECTED" });
  }
  return { id: info.messageId || null };
}

async function sendViaSmtp({
  subject, html, text, to, from, replyTo,
}: { subject: string; html: string; text?: string; to?: string; from?: string; replyTo?: string }) {
  // 1) 465/SSL (según ENV)
  try {
    const r = await sendViaSmtpOnce({ subject, html, text, to, from, replyTo, port: SMTP_PORT, secure: SMTP_SECURE });
    return { provider: "smtp" as const, ...r };
  } catch (e) {
    console.error("SMTP 465 failed, trying 587/STARTTLS ->", e);
  }
  // 2) 587/STARTTLS
  const r = await sendViaSmtpOnce({ subject, html, text, to, from, replyTo, port: 587, secure: false });
  return { provider: "smtp" as const, ...r };
}

export async function sendMail({
  subject, html, text, to, from, replyTo,
}: { subject: string; html: string; text?: string; to?: string; from?: string; replyTo?: string }) {
  console.log("sendMail called ->", { to: to || CONTACT_TO, from: from || RESEND_FROM, subject });

  // Preferimos Resend (entrega rápida)
  if (RESEND_API_KEY) {
    try {
      const r = await sendViaResend({ subject, html, text, to, from: RESEND_FROM, replyTo });
      console.log("Provider used:", r.provider, r.id);
      return r;
    } catch (e) {
      console.error("Resend error, falling back to SMTP:", e);
    }
  }

  if (hasSmtp()) {
    const r = await sendViaSmtp({ subject, html, text, to, from: CONTACT_FROM || SMTP_USER, replyTo });
    console.log("Provider used:", r.provider, r.id);
    return r;
  }

  throw new Error("No mail provider available (missing Resend and SMTP)");
}
