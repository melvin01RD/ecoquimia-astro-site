// src/pages/api/services.ts
import type { APIRoute } from "astro";

const services = [
  {
    id: 1,
    name: "Análisis químico",
    description: "Pruebas de laboratorio certificadas.",
  },
  {
    id: 2,
    name: "Consultoría ambiental",
    description: "Asesoría en normas ISO y cumplimiento.",
  },
];

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(services), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
