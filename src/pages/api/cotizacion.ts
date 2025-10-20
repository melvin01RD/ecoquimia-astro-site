// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";
import crypto from "crypto";
import sendMail from "../../lib/mailer";

const SECRET =
  process.env.CAPTCHA_SECRET ||
  import.meta.env.CAPTCHA_SECRET ||
  "dev-secret";

/** Verifica token HMAC del captcha almacenado en cookie */
function verifyToken(text: string, token: string) {
  const [value, mac] = token.split(".");
  if (!value || !mac) return false;
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");

  try {
    const okMac = crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
    const okVal = value.toLowerCase() === text.toLowerCase();
    return okMac && okVal;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const data = await request.formData();

    const name     = String(data.get("name")     || "").trim();
    const email    = String(data.get("email")    || "").trim();
    const service  = String(data.get("service")  || "").trim();
    const message  = String(data.get("message")  || "").trim();
    const quantity = String(data.get("quantity") || "").trim();
    const captcha  = String(data.get("captcha")  || "").trim();

    // Honeypot (el input se llama "website" en tu .astro)
    const honeypot = String(data.get("website") || "");
    if (honeypot) return new Response("OK", { status: 204 });

    // Requeridos mínimos
    if (!name || !email || !service || !captcha) {
      return redirect("/cotizacion?e=f#quoteForm", 303);
    }

    // CAPTCHA
    const token = cookies.get("captcha_token")?.value || "";
    if (!token || !verifyToken(captcha, token)) {
      return redirect("/cotizacion?e=c#quoteForm", 303);
    }

    // Email HTML
    const subject = `Nueva solicitud de cotización — ${service}`;
    const html = `
      <div style="font-family:ui-sans-serif,system-ui;line-height:1.5">
        <h2 style="margin:0 0 8px">Nueva solicitud de cotización</h2>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Servicio:</b> ${service}</p>
        ${quantity ? `<p><b>Cantidad:</b> ${quantity}</p>` : ""}
        ${message ? `<p><b>Mensaje:</b> ${message}</p>` : ""}
        <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb" />
        <small>Ecoquimia · ${new Date().toLocaleString("es-DO")}</small>
      </div>
    `;

    await sendMail({ subject, html });

    // Limpia cookie y redirige a /gracias con params
    cookies.delete("captcha_token", { path: "/" });
    const params = new URLSearchParams({ name, service });
    return redirect(`/gracias?${params.toString()}`, 303);
  } catch (err) {
    console.error("Error en /api/cotizacion:", err);
    // Tu UI usa e=mx para error de envío de correo
    return redirect("/cotizacion?e=mx#quoteForm", 303);
  }
};
