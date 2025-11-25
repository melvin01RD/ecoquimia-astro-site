import { z } from "zod";

const envSchema = z.object({
  PUBLIC_SITE_ORIGIN: z.string().default("*"),
  PUBLIC_SITE_URL: z.string().default("http://localhost"),
  CONTACT_TO: z.string().email().default("contacto@ecoquimia.com"),
  CONTACT_FROM: z.string().default("no-reply@ecoquimia.com"),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z.enum(["true", "false"]).default("true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().optional(),
});

// Helper to get env vars from process.env or import.meta.env
const getEnv = (key: string) => {
  // @ts-ignore
  return import.meta.env[key] ?? process.env[key];
};

const rawEnv = Object.fromEntries(
  Object.keys(envSchema.shape).map((key) => [key, getEnv(key)])
);

const env = envSchema.parse(rawEnv);

export const config = {
  site: {
    origin: env.PUBLIC_SITE_ORIGIN,
    url: env.PUBLIC_SITE_URL,
  },
  contact: {
    to: env.CONTACT_TO,
    from: env.CONTACT_FROM,
    phone: "18096172105",
    phoneDisplay: "+1 (809) 617-2105",
    whatsappText: "Hola, quiero una cotización de control de plagas.",
    address: "Santo Domingo, RD",
    hours: "L–V 8:30 am–5:00 pm · Sáb. 9:00 am–1:00 pm",
  },
  email: {
    resend: {
      apiKey: env.RESEND_API_KEY,
      from: env.RESEND_FROM_EMAIL,
    },
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE === "true",
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from: env.SMTP_FROM_EMAIL,
    },
  },
};
