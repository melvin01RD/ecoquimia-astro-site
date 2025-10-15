// src/pages/api/cotizacion.ts
export const runtime = 'node';

import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';

function hmac(text: string, secret: string) {
  return createHmac('sha256', secret).update(text, 'utf8').digest('hex');
}

export const GET: APIRoute = async () =>
  new Response(null, { status: 405, headers: { Allow: 'POST' } });

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const ct = request.headers.get('content-type') || '';
  const form = ct.includes('form') ? await request.formData() : null;

  // Campos
  const name = form?.get('name')?.toString().trim() ?? '';
  const email = form?.get('email')?.toString().trim() ?? '';
  const service = form?.get('service')?.toString().trim() ?? '';
  const quantity = form?.get('quantity')?.toString().trim() ?? '';
  const message = form?.get('message')?.toString().trim() ?? '';
  const captchaRaw = form?.get('captcha')?.toString().trim() ?? '';
  const honeypot = form?.get('website')?.toString().trim() ?? '';

  // Honeypot ⇒ posible bot
  if (honeypot) {
    cookies.delete('captcha_token', { path: '/' });
    return redirect('/cotizacion?e=h#quoteForm', 303); // h = honeypot
  }

  // Captcha requerido
  if (!captchaRaw) {
    return redirect('/cotizacion?e=c#captcha', 303); // c = required
  }

  // Token firmado y secret
  const signed = cookies.get('captcha_token')?.value ?? '';
  const secret = import.meta.env.CAPTCHA_SECRET || '';
  if (!signed || !secret) {
    return redirect('/cotizacion?e=ce#captcha', 303); // ce = entorno/token
  }

  // Normaliza usuario y compara HMAC con timingSafeEqual
  const user = captchaRaw.replace(/\D+/g, '');
  if (user.length !== 6) {
    cookies.delete('captcha_token', { path: '/' });
    return redirect('/cotizacion?e=ci#captcha', 303); // ci = incorrect
  }

  const mac = hmac(user, secret);
  let ok = false;
  try {
    const a = Buffer.from(signed, 'hex');
    const b = Buffer.from(mac, 'hex');
    if (a.length === b.length) ok = timingSafeEqual(a, b);
  } catch { /* ignore */ }

  // Rota cookie SIEMPRE (evita reuso)
  cookies.delete('captcha_token', { path: '/' });

  if (!ok) {
    return redirect('/cotizacion?e=ci#captcha', 303); // incorrecto
  }

  // TODO: aquí ya puedes mandar el correo con Resend/SMTP usando name, email, service, quantity, message
  // await sendMail({name, email, service, quantity, message});

  // Éxito
  return redirect('/gracias', 303);
};
