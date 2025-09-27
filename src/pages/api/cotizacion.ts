// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const ORIGIN = process.env.PUBLIC_SITE_ORIGIN ?? "*";
const TO_EMAIL = process.env.CONTACT_TO ?? "contacto@ecoquimia.com";
const FROM_EMAIL =
  process.env.CONTACT_FROM ??
  `no-reply@${new URL(process.env.PUBLIC_SITE_URL || "http://localhost").hostname}`;

const schema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z.string().trim().email("Correo electrónico no válido"),
  service: z.string().trim().min(1, "Selecciona un servicio"),
  quantity: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || Number.isFinite(v), { message: "Cantidad inválida" }),
  message: z.string().trim().min(5, "Describe tu necesidad"),
  // honeypot del formulario de cotización
  website: z.string().optional(),
});

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
    const input = await parseBody(request);
    const data = schema.parse(input);

    // Honeypot
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

    return json({ ok: true, message: "¡Gracias! Te contactaremos pronto." }, 200);
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || "Error";
    return json({ ok: false, error: msg }, 400);
  }
};

// ---------- helpers ----------
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": ORIGIN,
      "Content-Type": "application/json; charset=utf-8",
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

function toHtml(text: string) {
  return `<pre style="font:14px ui-sans-serif,system-ui,Segoe UI,Roboto,Arial">${escapeHtml(text)}</pre>`;
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
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

  const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASS: pass } = process.env;
  if (host && port && user && pass) {
    const nm: any = await import("nodemailer");
    const secure = (process.env.SMTP_SECURE || "").toLowerCase() === "true" || Number(port) === 465;
    const transporter = nm.createTransport({
      host,
      port: Number(port),
      secure,
      auth: { user, pass },
      requireTLS: !secure,
      tls: { minVersion: "TLSv1.2", servername: host },
    });
    await transporter.sendMail({ to, from, subject, text, html });
    return;
  }

  console.warn("[cotizacion] Sin RESEND ni SMTP configurado: mensaje no enviado");
}
