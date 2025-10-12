import type { APIRoute } from "astro";
import svgCaptcha from "svg-captcha";

// ⬇️ Opciones base (numérico puro)
const CAPTCHA_LENGTH = 6;
const BASE_OPTIONS = {
  size: CAPTCHA_LENGTH,          // longitud del código
  charPreset: "0123456789",      // SOLO NÚMEROS
  noise: 3,                      // líneas de ruido
  color: true,
  background: "#f9fafb",
  width: 120,
  height: 40,
  // inverse: false, fontSize: 56, // (opcional) ajusta a gusto
};

// Cabeceras anti-caché y endurecimiento
const SVG_HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

// ⚠️ Usa tu firma actual. No cambiamos la interfaz para no romper nada.
import { sign } from "../../lib/captcha-sign"; // <-- ajusta esta ruta si la tienes en otro lado

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // Permitir override seguro por query (ancho/alto), con límites razonables
    const w = clamp(int(url.searchParams.get("w")), 100, 240) ?? BASE_OPTIONS.width!;
    const h = clamp(int(url.searchParams.get("h")), 32, 120) ?? BASE_OPTIONS.height!;
    const noise = clamp(int(url.searchParams.get("noise")), 0, 5) ?? BASE_OPTIONS.noise!;

    const options = { ...BASE_OPTIONS, width: w, height: h, noise };

    // Generar captcha numérico
    const captcha = svgCaptcha.create(options);

    // Firmar el texto (tal como ya usas) y guardar cookie
    const token = sign(captcha.text); // <- mantiene compatibilidad
    cookies.set("captcha_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // en localhost permite HTTP
      maxAge: 60 * 5, // 5 minutos
    });

    return new Response(captcha.data, { status: 200, headers: SVG_HEADERS });
  } catch (err) {
    // Fallo controlado: evita romper la UI
    const msg = process.env.NODE_ENV === "production" ? "captcha error" : String(err);
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="40"><text x="10" y="25" fill="red">Error: ${escapeHTML(
        msg
      )}</text></svg>`,
      { status: 500, headers: SVG_HEADERS }
    );
  }
};

// ===== utilidades locales =====
function int(v: string | null): number | undefined {
  if (v == null) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}
function clamp(n: number | undefined, min: number, max: number) {
  if (n == null) return undefined;
  return Math.min(Math.max(n, min), max);
}
function escapeHTML(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[c]!));
}
