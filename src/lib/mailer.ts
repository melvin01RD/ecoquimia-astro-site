// src/lib/mailer.ts
export const runtime = 'node';

import nodemailer from "nodemailer";

type Payload = {
  name: string;
  email: string;
  service: string;
  quantity?: string;
  message: string;
};

function htmlEscape(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as const)[c]!
  );
}

function renderHTML(p: Payload) {
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,'Noto Sans',sans-serif;line-height:1.5;color:#0a0a0a">
    <h2 style="margin:0 0 12px 0">Nueva solicitud de cotización</h2>
    <table style="border-collapse:collapse;width:100%;max-width:560px">
      <tbody>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;width:160px;background:#f9fafb"><strong>Nombre</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${htmlEscape(p.name)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><strong>Correo</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${htmlEscape(p.email)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><strong>Servicio</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${htmlEscape(p.service || "(no especificado)")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><strong>Cantidad</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${htmlEscape(p.quantity || "(no aplica)")}</td></tr>
      </tbody>
    </table>
    <h3 style="margin:16px 0 8px 0">Detalle</h3>
    <pre style="white-space:pre-wrap;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb">${htmlEscape(p.message || "")}</pre>
  </div>`;
}

function makeTransport({ host, port, secure }: { host: string; port: number; secure: boolean }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return nodemailer.createTransport({
    host,
    port,
    secure, // 465 = SSL, 587 = STARTTLS
    auth: user && pass ? { user, pass } : undefined,
    requireTLS: !secure,
    tls: { minVersion: "TLSv1.2", servername: host },
  });
}

export async function sendQuoteMail(p: Payload) {
  const {
    RESEND_API_KEY,
    RESEND_FROM_EMAIL,
    CONTACT_FROM,
    CONTACT_TO,
    SMTP_HOST = "smtp.gmail.com",
    SMTP_USER,
  } = process.env as Record<string, string | undefined>;

  const to = CONTACT_TO || SMTP_USER || "";
  const subject = `Nueva solicitud — ${p.service || "Servicio"}`;
  const text =
    `Nueva solicitud de cotización\n` +
    `Nombre: ${p.name}\n` +
    `Email: ${p.email}\n` +
    `Servicio: ${p.service || "(no especificado)"}\n` +
    `Cantidad: ${p.quantity || "(no aplica)"}\n\n` +
    `Detalle:\n${p.message || ""}`;

  // 1) Resend si hay API key
  if (RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);
      const from = RESEND_FROM_EMAIL || CONTACT_FROM || "no-reply@" + (new URL(process.env.PUBLIC_SITE_URL || "http://localhost")).hostname;
      const { error } = await resend.emails.send({ to, from, subject, text, html: renderHTML(p) });
      if (error) throw new Error(error.message || "Fallo al enviar con Resend");
      return { ok: true as const };
    } catch (err) {
      console.warn("[MAIL][RESEND] fallo, se intentará SMTP →", err);
      // continúa a SMTP
    }
  }

  // 2) SMTP con verificación 465 y fallback 587
  const fromHeader = CONTACT_FROM || (SMTP_USER ? `Ecoquimia <${SMTP_USER}>` : "Ecoquimia <no-reply@localhost>");

  // 2.1: 465 (SSL)
  try {
    let tx = makeTransport({ host: SMTP_HOST!, port: 465, secure: true });
    await tx.verify().catch(() => {});
    const info = await tx.sendMail({ from: fromHeader, to, replyTo: p.email || undefined, subject, text, html: renderHTML(p) });
    console.log("[MAIL][SMTP] enviado 465:", info.messageId);
    return { ok: true as const };
  } catch (err) {
    console.warn("[MAIL][SMTP] fallo 465/SSL, reintento en 587/STARTTLS →", err);
  }

  // 2.2: 587 (STARTTLS)
  try {
    let tx = makeTransport({ host: SMTP_HOST!, port: 587, secure: false });
    await tx.verify().catch(() => {});
    const info2 = await tx.sendMail({ from: fromHeader, to, replyTo: p.email || undefined, subject, text, html: renderHTML(p) });
    console.log("[MAIL][SMTP] enviado 587:", info2.messageId);
    return { ok: true as const };
  } catch (err2) {
    console.error("[MAIL][SMTP] error definitivo:", err2);
    return { ok: false as const, reason: "smtp_error", error: err2 };
  }
}

