// src/pages/api/services.ts
import type { APIRoute } from "astro";
import { services } from "../../data/services";

export const prerender = false;

export const GET: APIRoute = async () => {
  // Serialize imgSrc as a plain URL string (imgSrc is ImageMetadata internally).
  const payload = services.map((s) => ({ ...s, imgSrc: s.imgSrc?.src }));
  return new Response(JSON.stringify({ services: payload }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=600", // 10 min
    },
  });
};

export const OPTIONS: APIRoute = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Allow: "GET, OPTIONS",
    },
  });
