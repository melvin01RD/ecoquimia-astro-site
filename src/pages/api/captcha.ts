import type { APIRoute } from "astro";
import svgCaptcha from "svg-captcha";
import { createHmac } from "node:crypto";

function hmac(text: string, secret: string) {
  return createHmac("sha256", secret).update(text, "utf8").digest("hex");
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

  const secret = import.meta.env.CAPTCHA_SECRET!;
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
      // 💪 evita que cualquier caché guarde la imagen
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
};
