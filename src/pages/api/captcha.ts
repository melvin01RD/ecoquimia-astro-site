export const runtime = 'node'; // importante en Vercel

import type { APIRoute } from "astro";
import svgCaptcha from "svg-captcha";
import { createHmac } from "node:crypto";

function hmac(text: string, secret: string) {
  return createHmac("sha256", secret).update(text, "utf8").digest("hex");
}

export const GET: APIRoute = async ({ cookies }) => {
  const secret = import.meta.env.CAPTCHA_SECRET;
  if (!secret) {
    // Respuesta SVG legible si falta la env (debug visual).
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60">
      <rect width="100%" height="100%" fill="#fee2e2"/>
      <text x="12" y="38" font-family="monospace" font-size="16" fill="#991b1b">
        Missing CAPTCHA_SECRET
      </text>
    </svg>`;
    return new Response(svg, {
      status: 500,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control":"no-store" },
    });
  }

  const captcha = svgCaptcha.create({
    size: 6,
    charPreset: "0123456789",
    color: false,           // texto negro fijo
    background: "#ffffff",  // fondo blanco puro
    noise: 2,
    width: 140,
    height: 44,
    fontSize: 46,
  });

  const mac = hmac(captcha.text, secret);

  cookies.set("captcha_token", mac, {
    path: "/",
    secure: import.meta.env.MODE === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 5,
  });

  return new Response(captcha.data, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
};

