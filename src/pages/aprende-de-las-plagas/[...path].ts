import type { APIRoute } from "astro";

export const prerender = false;

// An SSR rest endpoint covers the retired root and every descendant on Vercel.
export const ALL: APIRoute = ({ request }) =>
  new Response(request.method === "HEAD" ? null : "Contenido retirado permanentemente.\n", {
    status: 410,
    statusText: "Gone",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
