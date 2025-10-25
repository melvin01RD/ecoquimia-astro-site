import type { APIRoute } from "astro";
import svgCaptcha from "svg-captcha";

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

  // guarda el valor en texto plano (solo válido 5 min)
  cookies.set("captcha_token", captcha.text.toLowerCase(), {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 5, // 5 minutos
  });

  return new Response(captcha.data, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" },
  });
};
