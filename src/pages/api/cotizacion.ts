import type { APIRoute } from "astro";
import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "node:crypto";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// HMAC(hex)
function hmac(text: string, secret: string) {
  return createHmac("sha256", secret).update(text, "utf8").digest("hex");
}
// Comparación segura de hex strings
function safeEqualHex(aHex: string, bHex: string) {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]!));
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const fd = await request.formData();

    // 1) CAPTCHA
    const input = String(fd.get("captcha") || "");
    const cookieMac = cookies.get("captcha_token")?.value || "";
    const secret = import.meta.env.CAPTCHA_SECRET || "";
    const mac = hmac(input, secret);

    if (!cookieMac || !safeEqualHex(cookieMac, mac)) {
      return new Response(JSON.stringify({ error: "Captcha inválido" }), { status: 400 });
    }

    // 2) Datos del formulario
    const name = String(fd.get("name") ?? fd.get("nombre") ?? "");
    const email = String(fd.get("email") ?? fd.get("correo") ?? "");
    const service = String(fd.get("service") ?? fd.get("tipoServicio") ?? "");
    const quantity = String(fd.get("quantity") ?? fd.get("cantidad") ?? "");
    const details = String(fd.get("details") ?? fd.get("descripcion") ?? fd.get("message") ?? "");

    // 3) Email via Resend
    const to = import.meta.env.CONTACT_TO!;
    const from = import.meta.env.CONTACT_FROM!;
    const subject = `Nueva cotización${service ? `: ${service}` : ""}`;

    const { data, error } = await resend.emails.send({
      from,
      to,
      reply_to: email || undefined,
      subject,
      text: [
        `Nombre: ${name}`,
        `Correo: ${email}`,
        `Servicio: ${service}`,
        `Cantidad: ${quantity || "N/A"}`,
        `Detalles:`,
        details,
      ].join("\n"),
      html: `
        <h2>Nueva cotización</h2>
        <p><b>Nombre:</b> ${escapeHtml(name)}</p>
        <p><b>Correo:</b> ${escapeHtml(email)}</p>
        <p><b>Servicio:</b> ${escapeHtml(service)}</p>
        <p><b>Cantidad:</b> ${escapeHtml(quantity || "N/A")}</p>
        <p><b>Detalles:</b><br/>${escapeHtml(details).replace(/\n/g,"<br/>")}</p>
      `,
    });

    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({ ok: true, id: data?.id ?? null }), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Email failed", reason: String(err?.message || err) }),
      { status: 500 }
    );
  }
};
