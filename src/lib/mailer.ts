import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export type SendPayload = {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
};

function normalizeFrom(raw: string): string {
  // Strip surrounding whitespace, newlines, and wrapping quotes from env vars
  const s = raw.trim().replace(/^["']|["']$/g, "").trim();
  // "Name <email>" — preserve both parts
  const named = s.match(/^(.+?)\s*<([^>]+)>$/);
  if (named) return `${named[1].trim()} <${named[2].trim()}>`;
  // "<email>" — bare angle brackets, strip them
  const bracketed = s.match(/^<([^>]+)>$/);
  if (bracketed) return bracketed[1].trim();
  // plain email
  return s;
}

export async function sendMail(payload: SendPayload) {
  if (!payload.from) {
    throw new Error("FROM missing");
  }

  const from = normalizeFrom(payload.from);

  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  });

  if (error) {
    console.error("[mailer] Resend error:", JSON.stringify(error), "| from:", from);
    throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
  }

  console.log("[mailer] Email enviado:", data?.id);
  return data;
}
