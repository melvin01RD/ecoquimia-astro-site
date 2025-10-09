// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import nodemailer from "nodemailer";

export const prerender = false;

// ====== Config correo (ajusta si quieres) ======
const TO_EMAIL = process.env.TO_EMAIL || "destinatario@ejemplo.com";
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  `no-reply@${new URL(process.env.PUBLIC_SITE_URL || "http://localhost").hostname}`;

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
export const POST: APIRoute = async ({ request, redirect }) => {
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

    // Redirección vs JSON según el tipo de submit
    const ct = request.headers.get("content-type") ?? "";
    const accept = request.headers.get("accept") ?? "";
    const isNativeForm = !ct.includes("application/json") && accept.includes("text/html");

    const params = new URLSearchParams();
if (data.name) params.set("name", String(data.name));
if (data.service) params.set("service", String(data.service));

// SIEMPRE JSON: el cliente decide navegar
return json({
  ok: true,
  message: "¡Gracias! Te contactaremos pronto.",
  redirectTo: `/gracias?${params.toString()}`,
});


    // Submit con fetch/AJAX -> JSON con URL de destino
    return json({
      ok: true,
      message: "¡Gracias! Te contactaremos pronto.",
      redirectTo: `/gracias?${params.toString()}`,
    });
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || "Error";
    return json({ ok: false, error: msg }, 400);
  }
};

// ====== Helpers ======
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
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
