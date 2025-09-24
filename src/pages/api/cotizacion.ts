// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, service, quantity, message, ...rest } = data || {};

    const honeypotField = import.meta.env.HONEYPOT_FIELD || "website";
    if (rest[honeypotField]) {
      return new Response(JSON.stringify({ error: "Spam detectado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!name || !email || !service || !message) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos" }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // TODO: enviar correo o almacenar en DB
    console.log("Nueva cotización:", {
      name,
      email,
      service,
      quantity,
      message,
    });

    return new Response(
      JSON.stringify({ message: "¡Gracias! Te contactaremos pronto." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
