import type { APIRoute } from "astro";
import crypto from "crypto";
import { sendMail } from "../../lib/mailer.js";

const SECRET = process.env.CAPTCHA_SECRET || import.meta.env.CAPTCHA_SECRET || "dev-secret";

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
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const service = String(form.get("service") || "").trim();
    const message = String(form.get("message") || "").trim();
    const captcha = String(form.get("captcha") || "").trim();
    const honeypot = String(form.get("website") || "");

    if (honeypot) return new Response("OK", { status: 204 });
    if (!name || !email || !service || !captcha) return redirect("/cotizacion?e=f#quoteForm", 303);

    const token = cookies.get("captcha_token")?.value || "";
    if (!token || !verifyToken(captcha, token)) return redirect("/cotizacion?e=c#quoteForm", 303);

    const subject = `Nueva solicitud de cotización — ${service}`;
    const html = `
      <div style="font-family:ui-sans-serif,system-ui;line-height:1.5">
        <h2 style="margin:0 0 8px">Nueva solicitud de cotización</h2>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Servicio:</b> ${service}</p>
        ${message ? `<p><b>Mensaje:</b> ${message}</p>` : ""}
        <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb" />
        <small>${new Date().toLocaleString("es-DO")}</small>
      </div>
    `;

    await sendMail({ subject, html, replyTo: email });
    cookies.delete("captcha_token", { path: "/" });

    const params = new URLSearchParams({ name, service });
    return redirect(`/gracias?${params.toString()}`, 303);
  } catch (err: any) {
    console.error("Error en /api/cotizacion:", err);
    const hint = encodeURIComponent(err?.code || err?.name || err?.message || "mx");
    return redirect(`/cotizacion?e=mx&d=${hint}#quoteForm`, 303);
  }
};
