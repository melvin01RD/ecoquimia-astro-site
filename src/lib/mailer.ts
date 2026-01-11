import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type SendPayload = {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
};

export async function sendMail(payload: SendPayload) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing");
  }

  if (!payload.from) {
    throw new Error("FROM missing");
  }

  // 🔒 LIMPIEZA DEFINITIVA
  const from = payload.from
    .replace(/^<|>$/g, "")
    .trim();

  return await resend.emails.send({
    from, // ← AQUÍ YA NO HAY FORMA DE QUE LLEGUEN <>
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  });
}
