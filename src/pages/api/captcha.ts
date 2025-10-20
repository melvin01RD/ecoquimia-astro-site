import type { APIRoute } from "astro";
import svgCaptcha from "svg-captcha";
import crypto from "crypto";

const SECRET = process.env.CAPTCHA_SECRET || import.meta.env.CAPTCHA_SECRET || "dev-secret";

// 🔐 Firma correcta: valor.HMAC
function sign(value: string) {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${mac}`;
}

export const GET: APIRoute = async ({ cookies }) => {
  const captcha = svgCaptcha.create({
    size: 6,
    charPreset: "0123456789",
    noise: 3,
    color: true,
    background: "#f9fafb",
    width: 120,
    height: 40,
  });

  const token = sign(captcha.text);

  cookies.set("captcha_token", token, {
    path: "/",
    // ⚙️ Importante: en localhost no usar secure=true
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 5, // 5 minutos
  });

  return new Response(captcha.data, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
};
