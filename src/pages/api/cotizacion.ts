
export const runtime = "node";
export const prerender = false;


import type { APIRoute } from "astro";
import { sendMail } from "../../lib/mailer";
import crypto from "node:crypto";

export const prerender = false;
export const runtime = "node"; // MUY IMPORTANTE para Resend/SMTP

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}
function signCaptchaText(text: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(text).digest("hex");
}

export const POST: APIRoute = async (ctx) => {
  try {
    const { request, cookies, redirect } = ctx;
    const data = await request.formData();

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const service = String(data.get("service") || "").trim();
    const quantity = String(data.get("quantity") || "").trim();
    const message = String(data.get("message") || "").trim();
    const captcha = String(data.get("captcha") || "").trim();
    const honeypot = String(data.get("website") || "").trim(); // honeypot

    // Honeypot
    if (honeypot) return redirect("/cotizacion?e=f#quoteForm", 303);

    // Requeridos
    if (!name || !email || !service || !message) {
      return redirect("/cotizacion?e=f#quoteForm", 303);
    }
const token = cookies.get("captcha_token")?.value?.toLowerCase() || "";
if (!captcha || !token || captcha.toLowerCase() !== token) {
  console.warn("[captcha] incorrecto o expirado");
  return redirect("/cotizacion?e=c#quoteForm", 303);
}



    // ENV correo
    const CONTACT_FROM = import.meta.env.CONTACT_FROM as string | undefined;
    const CONTACT_TO = import.meta.env.CONTACT_TO as string | undefined;
    if (!CONTACT_FROM || !CONTACT_TO) {
      console.error("[mail] Falta CONTACT_FROM/CONTACT_TO");
      return redirect("/cotizacion?e=mx&d=EnvMissing#quoteForm", 303);
    }

    const subject = `Nueva cotización — ${service} (${name})`;
    const html = `
      <h2>Solicitud de cotización</h2>
      <ul>
        <li><b>Nombre:</b> ${name}</li>
        <li><b>Correo:</b> ${email}</li>
        <li><b>Servicio:</b> ${service}</li>
        ${quantity ? `<li><b>Cantidad:</b> ${quantity}</li>` : ""}
      </ul>
      <p><b>Mensaje:</b></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;
    const text =
      `Solicitud de cotización\n\n` +
      `Nombre: ${name}\n` +
      `Correo: ${email}\n` +
      `Servicio: ${service}\n` +
      (quantity ? `Cantidad: ${quantity}\n` : "") +
      `\nMensaje:\n${message}\n`;

    const res = await sendMail({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      subject,
      html,
      text,
      replyTo: email,
    });

    if ((res as any).error) {
      console.error("[mail] Error:", (res as any).error);
      return redirect("/cotizacion?e=mx&d=SendFail#quoteForm", 303);
    }

    cookies.delete("captcha_token", { path: "/" });
    const qp = new URLSearchParams({ name, service });
    return redirect(`/gracias?${qp.toString()}`, 303);
  } catch (err) {
    console.error("[cotizacion] Excepción:", err);
    return ctx.redirect("/cotizacion?e=mx&d=Error#quoteForm", 303);
  }
};
