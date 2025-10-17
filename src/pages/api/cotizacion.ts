// src/pages/api/cotizacion.ts
export const runtime = 'node';

import type { APIRoute } from "astro";
import { sendQuoteMail } from "../../lib/mailer";
import { createHmac } from "node:crypto";

function hmac(text: string, secret: string) {
  return createHmac("sha256", secret).update(text, "utf8").digest("hex");
}
function wantsJSON(req: Request) {
  const accept = req.headers.get("accept") || "";
  return accept.includes("application/json");
}
async function verifyCaptcha(cookies: any, code: string): Promise<boolean> {
  try {
    const token = cookies.get("captcha_token")?.value || "";
    const secret = import.meta.env.CAPTCHA_SECRET as string | undefined;
    if (!token || !secret || !code) return false;
    const expected = hmac(code.trim(), secret);
    return token === expected;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/x-www-form-urlencoded") && !ct.includes("multipart/form-data")) {
    return new Response("Unsupported Media Type", { status: 415 });
  }

  const fd = await request.formData();
  const name     = (fd.get("name")     || "").toString().trim();
  const email    = (fd.get("email")    || "").toString().trim();
  const service  = (fd.get("service")  || "").toString().trim();
  const quantity = (fd.get("quantity") || "").toString().trim();
  const message  = (fd.get("message")  || "").toString().trim();
  const captcha  = (fd.get("captcha")  || "").toString().trim();
  const honey    = (fd.get("website")  || "").toString().trim();

  if (honey) return new Response("Bad Request", { status: 400 });
  if (!name || !email || !service || !message) return new Response("Bad Request", { status: 400 });

  const okCaptcha = await verifyCaptcha(cookies, captcha);
  if (!okCaptcha) {
    const u = new URL("/cotizacion", request.url);
    u.searchParams.set("e", "c");
    u.hash = "quoteForm";
    return Response.redirect(u, 303);
  }

  console.log("[MAIL] intentando envío…");
  const mailRes = await sendQuoteMail({ name, email, service, quantity, message });

  if (!mailRes.ok) {
    console.error("[MAIL] fallo de envío:", mailRes);
    const u = new URL("/cotizacion", request.url);
    u.searchParams.set("e", "mx");
    u.hash = "quoteForm";
    return Response.redirect(u, 303);
  }

  const thanks = new URL("/gracias", request.url);
  if (name) thanks.searchParams.set("name", name);
  if (service) thanks.searchParams.set("service", service);
  return Response.redirect(thanks, 303);
};

