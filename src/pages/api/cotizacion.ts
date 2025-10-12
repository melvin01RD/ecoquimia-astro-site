import type { APIRoute } from "astro";
import { Resend } from "resend";

// Fuerza leer .env incluso si Vite no lo inyecta
import { config as loadEnv } from "dotenv";
loadEnv();

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey =
      (import.meta as any).env?.RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("[cotizacion] Falta RESEND_API_KEY | cwd=", process.cwd());
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(apiKey);

    const form = await request.formData();

    // Honeypot
    if ((form.get("website") as string)?.trim()) {
      return new Response(JSON.stringify({ error: "Bot detected" }), { status: 400 });
    }

    // TODO: verifica tu captcha aquí si aplica

    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const service = String(form.get("service") || "");
    const quantity = String(form.get("quantity") || "");
    const details = String(form.get("details") || "");

    const subject = `Nueva cotización: ${service || "sin servicio"}`;
    const html = `
      <h2>Solicitud de cotización</h2>
      <ul>
        <li><b>Nombre:</b> ${name || "(no enviado)"}</li>
        <li><b>Correo:</b> ${email || "(no enviado)"}</li>
        <li><b>Servicio:</b> ${service || "(no enviado)"}</li>
        <li><b>Cantidad:</b> ${quantity || "(no enviado)"}</li>
      </ul>
      <p><b>Detalles:</b></p>
      <pre style="white-space:pre-wrap">${details || "(sin detalles)"}</pre>
    `;

    const from =
      (import.meta as any).env?.CONTACT_FROM ||
      process.env.CONTACT_FROM ||
      "onboarding@resend.dev";

    const to =
      (import.meta as any).env?.CONTACT_TO ||
      process.env.CONTACT_TO ||
      "melvin01rd@gmail.com";

    const { data, error } = await resend.emails.send({
      from,
      to,
      reply_to: email || undefined,
      subject,
      html,
    });

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ ok: true, sentTo: to, id: data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[cotizacion] resend error:", err?.message || err);
    return new Response(
      JSON.stringify({ error: "Email failed", detail: err?.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
