// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { ServiceSlugEnum, getServiceBySlug } from "../../data/services";
import nodemailer from "nodemailer";

export const prerender = false;

/** CORS (opcional; igual que contact.ts si lo usas) */
const ORIGIN = process.env.PUBLIC_SITE_ORIGIN ?? "*";

/** Destinos y remitente */
const TO_EMAIL =
  process.env.CONTACT_TO ?? process.env.TO_EMAIL ?? "contacto@ecoquimia.com";
const FROM_EMAIL =
  process.env.CONTACT_FROM ??
  process.env.FROM_EMAIL ??
  `no-reply@${new URL(process.env.PUBLIC_SITE_URL || "http://localhost").hostname}`;

/** Schema de validación: NOTA usa slug del servicio */
const schema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z.string().trim().email("Correo electrónico no válido"),
  service: ServiceSlugEnum, // <- slug válido del catálogo
  quantity: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isFinite(v) && v > 0), "Cantidad inválida"),
  message: z.string().trim().min(10, "Describe tu necesidad con más detalle"),
  website: z.string().max(0).optional(), // honeypot
});

/* =========================
   Handlers
   ========================= */
export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Allow: "POST, OPTIONS",
    },
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues.at(0)?.message ?? "Datos inválidos";
      return json({ error }, 400);
    }

    const { name, email, service, quantity, message } = parsed.data;
    const svc = getServiceBySlug(service)!; // existe por el enum
    const subject = `Nueva cotización: ${svc.title}`;
    const text = [
      `Servicio: ${svc.title} (${service})`,
      `Nombre: ${name}`,
      `Email: ${email}`,
      quantity ? `Cantidad: ${quantity}` : null,
      "",
      "Mensaje:",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    // Enviar email si hay SMTP; si no, no romper UX
    await sendMail({
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject,
      text,
      html: `<pre style="font:14px ui-sans-serif,system-ui,Segoe UI,Roboto,Arial">${escapeHtml(text)}</pre>`,
    });

    return json({ ok: true, redirectTo: "/gracias" }, 200);
  } catch (err) {
    console.error("[cotizacion] error", err);
    return json({ error: "Error interno" }, 500);
  }
};

function json(payload: any, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ORIGIN,
      "Cache-Control": "no-store",
    },
  });
}

/* =========================
   SMTP helper (simple)
   ========================= */
type MailInput = { to: string; from: string; subject: string; text: string; html: string };
async function sendMail({ to, from, subject, text, html }: MailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  if (!host || !user || !pass) {
    console.warn("[cotizacion] SMTP no configurado; simulando envío.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: !secure,
    tls: { minVersion: "TLSv1.2", servername: host },
  });

  await transporter.sendMail({ to, from, subject, text, html });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
