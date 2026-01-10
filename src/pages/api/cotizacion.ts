import type { APIRoute } from "astro";
import { sendMail } from "../../lib/mailer";
import { config } from "../../config";

export const prerender = false;
export const runtime = "node";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const data = await request.formData();

  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const telefono = String(data.get("telefono") || "").trim();
  const service = String(data.get("service") || "").trim();
  const quantity = String(data.get("quantity") || "").trim();
  const message = String(data.get("message") || "").trim();
  const captcha = String(data.get("captcha") || "").trim();
  const honeypot = String(data.get("website") || "").trim();

  // Honeypot
  if (honeypot) return redirect("/cotizacion?e=f#quoteForm", 303);

  // Campos requeridos
  if (!name || !email || !telefono || !service || !message) {
    return redirect("/cotizacion?e=f#quoteForm", 303);
  }

  const token = cookies.get("captcha_token")?.value?.toLowerCase() || "";
  if (!captcha || !token || captcha.toLowerCase() !== token) {
    console.warn("[captcha] incorrecto o expirado");
    return redirect("/cotizacion?e=c#quoteForm", 303);
  }

  const subject = `Nueva cotización — ${service} (${name})`;
  const html = `
    <h2>Solicitud de cotización</h2>
    <ul>
      <li><b>Nombre:</b> ${name}</li>
      <li><b>Correo:</b> ${email}</li>
      <li><b>Teléfono:</b> ${telefono}</li>
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
    `Teléfono: ${telefono}\n` +
    `Servicio: ${service}\n` +
    (quantity ? `Cantidad: ${quantity}\n` : "") +
    `\nMensaje:\n${message}\n`;

  try {
    const from =
      config.email.resend.from ??
      config.email.smtp.from;

    if (!from) {
      return redirect("/cotizacion?e=mx&d=NoFrom#quoteForm", 303);
    }

    await sendMail({
      from,
      to: config.contact.to,
      subject,
      html,
      text,
      replyTo: email,
    });

    cookies.delete("captcha_token", { path: "/" });
    const qp = new URLSearchParams({ name, service });
    return redirect(`/gracias?${qp.toString()}`, 303);

  } catch (err) {
    console.error("[mail] Error real:", err);
    return redirect("/cotizacion?e=mx&d=MailError#quoteForm", 303);
  }
};
