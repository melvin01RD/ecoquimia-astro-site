import type { APIRoute } from "astro";
import { z } from "zod";

const env = import.meta.env;
const honeypotField = env.HONEYPOT_FIELD || "website";

// Esquema de validación (desconocidos se eliminan)
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
      `no-reply@${
        new URL(env.PUBLIC_SITE_URL || "http://example.com").hostname
      }`;

    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      text,
    });
    if (error) throw new Error(error.message || "Fallo al enviar con Resend");
    return;
  }

  // 2) SMTP (nodemailer)
  const host = env.SMTP_HOST;
  const port = env.SMTP_PORT;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;

  if (host && port && user && pass) {
    const nodemailer = await import("nodemailer");

    const secure =
      (env.SMTP_SECURE || "").toLowerCase() === "true" || Number(port) === 465;

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure, // true para 465, false para 587/25 (STARTTLS)
      auth: { user, pass },
      requireTLS: !secure, // obliga STARTTLS si secure=false
      tls: {
        minVersion: "TLSv1.2",
        servername: host, // SNI correcto
        // rejectUnauthorized: false, // SOLO pruebas con cert self-signed
      },
      logger: process.env.NODE_ENV !== "production",
      debug: process.env.NODE_ENV !== "production",
    });

    // En dev muestra si hay advertencias de conexión/login
    if (process.env.NODE_ENV !== "production") {
      try {
        await transporter.verify();
      } catch (e) {
        /* se verá en logger/debug */
      }
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
    dataRaw = await request.json();
  } catch {
    return json({ error: "Formato JSON inválido" }, 400);
  }

  // Honeypot: si el campo señuelo viene con valor -> bot
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
    return json({ error: issues.join(", ") }, 400);
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
    return json({
      message: "Gracias por contactarnos. Te responderemos pronto.",
    });
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
export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      // "Access-Control-Allow-Origin": "*" // descomenta si posteas desde otro dominio
    },
  });
