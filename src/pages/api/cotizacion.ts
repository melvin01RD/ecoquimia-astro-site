// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";

// === REEMPLAZA ESTO con tu verificación real usando el mismo método de captcha.ts ===
async function verifyCaptcha(cookies: any, code: string): Promise<boolean> {
  try {
    const token = cookies.get("captcha_token")?.value || "";
    if (!token || !code) return false;
    // EJEMPLO: si en captcha.ts haces sign(captchaText), aquí haces unsign(token) y comparas:
    // const real = unsign(token); // <-- pega tu función real
    // return real && real.trim() === code.trim();

    // Mientras pegas tu lógica, deja pasar sólo formato correcto:
    return /^\d{6}$/.test(code.trim());
  } catch {
    return false;
  }
}
function wantsJSON(request: Request) {
  const h = request.headers.get("accept") || "";
  return h.includes("application/json");
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const fd = await request.formData();
  const name     = (fd.get("name")     || "").toString().trim();
  const email    = (fd.get("email")    || "").toString().trim();
  const service  = (fd.get("service")  || "").toString().trim();
  const quantity = (fd.get("quantity") || "").toString().trim();
  const message  = (fd.get("message")  || "").toString().trim();
  const captcha  = (fd.get("captcha")  || "").toString().trim();
  const honey    = (fd.get("website")  || "").toString().trim(); // honeypot

  // 1) Honeypot
  if (honey) {
    const payload = { error: "Solicitud inválida." };
    return wantsJSON(request)
      ? new Response(JSON.stringify(payload), { status: 400, headers: { "content-type": "application/json; charset=utf-8" } })
      : new Response("Bad Request", { status: 400 });
  }

  // 2) Validaciones mínimas
  if (!name || !email || !service || !message) {
    const payload = { error: "Completa los campos requeridos." };
    return wantsJSON(request)
      ? new Response(JSON.stringify(payload), { status: 400, headers: { "content-type": "application/json; charset=utf-8" } })
      : new Response("Bad Request", { status: 400 });
  }

  // 3) CAPTCHA
  const okCaptcha = await verifyCaptcha(cookies, captcha);
  if (!okCaptcha) {
    const payload = { error: "Código de verificación inválido." };
    return wantsJSON(request)
      ? new Response(JSON.stringify(payload), { status: 400, headers: { "content-type": "application/json; charset=utf-8" } })
      : new Response("Bad Request", { status: 400 });
  }

  // 4) Aquí va tu envío de correo / Resend / Odoo, etc. (opcional)
  // try {
  //   ...
  // } catch (err) {
  //   console.error(err);
  //   // Puedes devolver 200 igual si prefieres no bloquear la UX.
  // }

  // 5) Redirige a /gracias (303) con query params útiles
  const thankUrl = new URL("/gracias", request.url);
  if (name) thankUrl.searchParams.set("name", name);
  if (service) thankUrl.searchParams.set("service", service);

  if (wantsJSON(request)) {
    return new Response(JSON.stringify({ redirectTo: `${thankUrl.pathname}${thankUrl.search}` }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return Response.redirect(thankUrl, 303);
};
