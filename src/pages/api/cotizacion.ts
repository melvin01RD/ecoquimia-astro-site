// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";
import { z } from "zod";

const env = import.meta.env;

const CotizacionSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z.string().email({ message: "Correo electrónico no válido" }),
  service: z.string().min(1, { message: "El servicio es obligatorio" }),
  quantity: z.string().optional(),
  message: z.string().min(1, { message: "El mensaje es obligatorio" }),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

// --- sendEmail local (igual que en contact.ts) ---
async function sendEmail({ subject, text }: { subject: string; text: string }) {
  const to = env.CONTACT_TO_EMAIL;
  if (!to) throw new Error("CONTACT_TO_EMAIL no está definido");

  // Resend
  if (env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);
    const fromAddress =
      env.RESEND_FROM_EMAIL ||
      `no-reply@${new URL(env.PUBLIC_SITE_URL || "http://example.com").hostname}`;

    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      text,
    });
    if (error) throw new Error(error.message || "Fallo al enviar con Resend");
    return;
  }

  // SMTP
  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
    const nodemailer = (await import("nodemailer")).default;
    const secure =
      (env.SMTP_SECURE || "").toLowerCase() === "true" ||
      Number(env.SMTP_PORT) === 465;

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      requireTLS: !secure,
    });

    const fromAddress = env.SMTP_FROM_EMAIL || env.SMTP_USER;
    await transporter.sendMail({ from: fromAddress, to, subject, text });
    return;
  }

  throw new Error("No hay proveedor de email configurado");
}

// --- POST /api/cotizacion ---
export const POST: APIRoute = async ({ request }) => {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Formato JSON inválido" }, 400);
  }

  const parsed = CotizacionSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message);
    return json({ error: issues.join(", ") }, 400);
  }

  const { name, email, service, quantity, message } = parsed.data;
  const subject = `Nueva solicitud de cotización - ${service}`;
  const text =
    `Nombre: ${name}\n` +
    `Email: ${email}\n` +
    `Servicio: ${service}\n` +
    `Cantidad: ${quantity || "N/A"}\n\n` +
    `Mensaje:\n${message}`;

  try {
    await sendEmail({ subject, text });
    return json({
      message: "Tu solicitud de cotización fue enviada. Te contactaremos pronto.",
    });
  } catch (err: any) {
    return json({ error: err?.message || "No se pudo enviar la cotización" }, 500);
  }
};

// Métodos no permitidos
const methodNotAllowed: APIRoute = async () =>
  new Response(null, { status: 405, headers: { Allow: "POST" } });

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const PATCH = methodNotAllowed;
