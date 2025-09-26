// src/pages/api/cotizacion.ts
import type { APIRoute } from "astro";

export const prerender = false;

type Cotizacion = {
  name: string;
  email: string;
  service: string;
  quantity?: string | number;
  message: string;
  // permitir campos extra (p. ej. honeypot)
  [k: string]: unknown;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function baseHeaders(origin?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

async function parseBody(request: Request): Promise<Cotizacion> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const raw = (await request.json()) as Record<string, unknown>;
    const payload: Cotizacion = {
      name: String(raw.name ?? "").trim(),
      email: String(raw.email ?? "").trim(),
      service: String(raw.service ?? "").trim(),
      quantity:
        typeof raw.quantity === "number"
          ? raw.quantity
          : String(raw.quantity ?? "").trim(),
      message: String(raw.message ?? "").trim(),
    };
    // añade cualquier otro campo (ej. honeypot)
    for (const [k, v] of Object.entries(raw)) {
      if (!(k in payload)) payload[k] = v;
    }
    return payload;
  }

  // Formularios HTML (multipart/x-www-form-urlencoded)
  const form = await request.formData();
  const payload: Cotizacion = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    service: String(form.get("service") ?? "").trim(),
    quantity: String(form.get("quantity") ?? "").trim(),
    message: String(form.get("message") ?? "").trim(),
  };
  form.forEach((v, k) => {
    if (!(k in payload)) payload[k] = typeof v === "string" ? v : "";
  });
  return payload;
}

function validate(data: Cotizacion) {
  const errors: Record<string, string> = {};
  if (!data.name) errors.name = "El nombre es requerido.";
  if (!data.email) errors.email = "El email es requerido.";
  else if (!isEmail(String(data.email))) errors.email = "Email inválido.";
  if (!data.service) errors.service = "Selecciona un servicio.";
  if (!data.message) errors.message = "Describe brevemente tu necesidad.";
  return errors;
}

export const OPTIONS: APIRoute = async ({ request }) => {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
  return new Response(null, { status: 204, headers });
};

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin") ?? "";
  try {
    const data = await parseBody(request);

    // Honeypot
    const honeypotField = import.meta.env.HONEYPOT_FIELD ?? "website";
    const hp = (data as Record<string, unknown>)[honeypotField];
    if (typeof hp === "string" && hp.trim() !== "") {
      return new Response(JSON.stringify({ error: "Spam detectado" }), {
        status: 400,
        headers: baseHeaders(origin),
      });
    }

    // Validaciones
    const errors = validate(data);
    if (Object.keys(errors).length) {
      return new Response(JSON.stringify({ error: "Validación", errors }), {
        status: 422,
        headers: baseHeaders(origin),
      });
    }

    // TODO: enviar correo o almacenar en DB
    // console.log("Nueva cotización:", {
    //   name: data.name, email: data.email, service: data.service,
    //   quantity: data.quantity, message: data.message
    // });

    return new Response(
      JSON.stringify({ message: "¡Gracias! Te contactaremos pronto." }),
      { status: 200, headers: baseHeaders(origin) },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "JSON/form inválido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: baseHeaders(origin),
    });
  }
};

// GET → 405 con Allow (elimina el warning del router)
export const GET: APIRoute = async ({ request }) => {
  const headers = baseHeaders(request.headers.get("origin") ?? undefined);
  headers["Allow"] = "POST, OPTIONS";
  return new Response(
    JSON.stringify({ message: "Usa POST en este endpoint." }),
    { status: 405, headers },
  );
};
