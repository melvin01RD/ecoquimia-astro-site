// src/pages/api/contact.ts
import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const env = import.meta.env;
const honeypotField = env.HONEYPOT_FIELD || "website";

const ContactSchema = z
  .object({
    name: z.string().trim().min(1, { message: "El nombre es obligatorio" }),
    email: z.string().trim().email({ message: "Correo electrónico no válido" }),
    phone: z.string().optional(),
    message: z.string().trim().min(1, { message: "El mensaje es obligatorio" }),
  })
  .strip();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function parseBody(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return await req.json();
  }
  // fallback: formularios HTML (multipart o x-www-form-urlencoded)
  const form = await req.formData();
  const obj: Record<string, unknown> = {};
  form.forEach((v, k) => (obj[k] = typeof v === "string" ? v : ""));
  return obj;
}

/**
 * Envía email con Resend (si hay API key) o cae a SMTP (nodemailer).
 */
async function sendEmail({ subject, text }: { subject: string; text: string }) {
  const to = env.CONTACT_TO_EMAIL;
  if (!to) throw new Error("CONTACT_TO_EMAIL no está definido");

  // 1) Resend
  const resendApiKey = env.RESEND_API_KEY;
  if (resendApiKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);
    const fromAddress =
      env.RESEND_FROM_EMAIL ||
      `no-reply@${new URL(env.PUBLIC_SITE_URL || "http://example.com").hostname}`;

    const { error } = await resend.emails.send({ from: fromAddress, to, subject, text });
    if (error) throw new Error(error.message || "Fallo al enviar con Resend");
    return;
  }

  // 2) SMTP (nodemailer)
  const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASS: pass } = env;
  if (host && port && user && pass) {
    const nodemailer = await import("nodemailer");
    const secure = (env.SMTP_SECURE || "").toLowerCase() === "true" || Number(port) === 465;
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure,
      auth: { user, pass },
      requireTLS: !secure,
      tls: { minVersion: "TLSv1.2", servername: host },
      logger: process.env.NODE_ENV !== "production",
      debug: process.env.NODE_ENV !== "production",
    });
    if (process.env.NODE_ENV !== "production") {
      try { await transporter.verify(); } catch {}
    }
    const fromAddress = env.SMTP_FROM_EMAIL || user;
    await transporter.sendMail({ from: fromAddress, to, subject, text });
    return;
  }

  throw new Error("No hay proveedor de email configurado");
}

/** POST /api/contact */
export const POST: APIRoute = async ({ request }) => {
  let dataRaw: unknown;
  try {
    dataRaw = await parseBody(request);
  } catch {
    return json({ error: "Formato de cuerpo inválido" }, 400);
  }

  // Honeypot
  if (
    dataRaw &&
    typeof dataRaw === "object" &&
    typeof (dataRaw as any)[honeypotField] === "string" &&
    ((dataRaw as any)[honeypotField] as string).trim() !== ""
  ) {
    return json({ error: "Solicitud inválida" }, 400);
  }

  const parsed = ContactSchema.safeParse(dataRaw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message);
    return json({ error: issues.join(", ") }, 422);
  }

  const { name, email, phone, message } = parsed.data;
  const subject = "Nuevo mensaje de contacto desde Ecoquimia";
  const text =
    `Nombre: ${name}\n` +
    `Email: ${email}\n` +
    `Teléfono: ${phone || "N/A"}\n\n` +
    `Mensaje:\n${message}`;

  try {
    await sendEmail({ subject, text });
    return json({ message: "Gracias por contactarnos. Te responderemos pronto." });
  } catch (err: any) {
    return json({ error: err?.message || "No se pudo enviar el mensaje" }, 500);
  }
};

// 405 para métodos no permitidos
const methodNotAllowed: APIRoute = async () =>
  new Response(null, {
    status: 405,
    headers: {
      Allow: "POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const PATCH = methodNotAllowed;

// OPTIONS para preflight (si envías desde otro origen)
export const OPTIONS: APIRoute = async ({ request }) =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      // "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
    },
  });
