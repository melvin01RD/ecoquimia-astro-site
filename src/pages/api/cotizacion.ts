// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import nodemailer from "nodemailer";

export const prerender = false;

// ====== Config correo (ajusta si quieres) ======
const TO_EMAIL =
  process.env.TO_EMAIL ?? process.env.CONTACT_TO ?? "melvin01rd@gmail.com";
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  `no-reply@${new URL(process.env.PUBLIC_SITE_URL || "http://localhost").hostname}`;
const ORIGIN = process.env.PUBLIC_SITE_ORIGIN ?? "*";

// ====== Validaciones ======
const schema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  email: z.string().trim().email("Email inválido"),
  quantity: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || Number.isFinite(v), { message: "Cantidad inválida" }),
  service: z.string().trim().min(1, "El servicio es requerido"),
  message: z.string().trim().min(1, "El mensaje es requerido"),
  // honeypot
  website: z.string().optional(),
});

// ====== Handler ======
export const POST: APIRoute = async ({ request }) => {
  try {
    const input = await parseBody(request);
    const data = schema.parse(input);

    // Honeypot: si viene con contenido, respondemos OK y salimos
    if (data.website && data.website.trim() !== "") {
      return json({ ok: true, message: "Gracias" }, 200);
    }

    const subject = `Nueva cotización: ${data.service}`;
    const text =
      `Nombre: ${data.name}\n` +
      `Email: ${data.email}\n` +
      (data.quantity ? `Cantidad: ${data.quantity}\n` : "") +
      `Servicio: ${data.service}\n\n` +
      `Mensaje:\n${data.message}\n`;

    await sendMail({ to: TO_EMAIL, from: FROM_EMAIL, subject, text, html: toHtml(text) });

    const params = new URLSearchParams();
    if (data.name) params.set("name", String(data.name));
    if (data.service) params.set("service", String(data.service));
    const location = `/gracias${params.toString() ? `?${params.toString()}` : ""}`;

    if (expectsHtmlRedirect(request)) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: location,
          "Access-Control-Allow-Origin": ORIGIN,
        },
      });
    }

    return json(
      {
        ok: true,
        message: "¡Gracias! Te contactaremos pronto.",
        redirectTo: location,
      },
      200,
    );
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || "Error";
    return json({ ok: false, error: msg }, 400);
  }
};

// ====== Helpers ======
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ORIGIN,
    },
  });
}

async function parseBody(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return await req.json();
  const form = await req.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) out[k] = String(v);
  return out;
}

async function sendMail({
  to,
  from,
  subject,
  text,
  html,
}: {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ to, from, subject, text, html });
    if (error) throw new Error(error.message || "Fallo al enviar con Resend");
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[cotizacion] SMTP no configurado: se omite envío real");
    return;
  }

  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true para 465, false para otros
    auth: { user, pass },
    requireTLS: !secure,
    tls: { minVersion: "TLSv1.2", servername: host },
  });

  await transporter.sendMail({ to, from, subject, text, html });
}

function toHtml(text: string) {
  return `<pre style="font:14px ui-sans-serif,system-ui,Segoe UI,Roboto,Arial">${escapeHtml(text)}</pre>`;
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function expectsHtmlRedirect(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";
  return !contentType.includes("application/json") && accept.includes("text/html");
}
