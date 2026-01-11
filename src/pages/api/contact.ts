// src/pages/api/contact.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { config } from "../../config";
import { sendMail } from "../../lib/mailer";

export const prerender = false;

const schema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z.string().trim().email("Correo electrónico no válido"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(5, "El mensaje es obligatorio"),
  // honeypot del formulario de contacto
  company: z.string().optional(),
});

export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": config.site.origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Allow: "POST, OPTIONS",
    },
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    const input = await parseBody(request);
    const data = schema.parse(input);

    // Honeypot: si viene lleno, salimos como si todo ok
    if (data.company && data.company.trim() !== "") {
      return json({ ok: true, message: "Gracias" }, 200);
    }

    const subject = data.subject ? `Contacto: ${data.subject}` : "Nuevo mensaje de contacto";
    const text =
      `Nombre: ${data.name}\n` +
      `Email: ${data.email}\n` +
      (data.phone ? `Teléfono: ${data.phone}\n` : "") +
      (data.subject ? `Asunto: ${data.subject}\n` : "") +
      `\nMensaje:\n${data.message}\n`;

    await sendMail({
      to: config.contact.to,
      from: "noreply@ecoquimia.com",
      subject,
      text,
      html: toHtml(text)
    });

    return json({ ok: true, message: "¡Mensaje enviado! Te responderemos pronto." }, 200);
  } catch (err: unknown) {
    let msg = "Error al enviar el mensaje";
    if (err instanceof z.ZodError) {
      msg = err.issues[0].message;
    } else if (err instanceof Error) {
      msg = err.message;
    }
    return json({ ok: false, error: msg }, 400);
  }
};

// ---------- helpers ----------
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": config.site.origin,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function parseBody(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return await req.json();
  }
  // Soporte para <form> HTML
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

