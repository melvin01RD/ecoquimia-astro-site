import { z } from "zod";
import {
  PHONE_E164,
  PHONE_DISPLAY,
  BUSINESS_HOURS,
  EMAIL_COMMERCIAL,
} from "./config/business";

const envSchema = z.object({
  PUBLIC_SITE_ORIGIN: z.string().default("*"),
  PUBLIC_SITE_URL: z.string().default("http://localhost"),
  CONTACT_TO: z.string().email().default(EMAIL_COMMERCIAL),
  CONTACT_FROM: z.string().default(EMAIL_COMMERCIAL),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z.coerce.boolean().default(true),
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
    // Digits only (no leading +), used to build wa.me/tel links.
    phone: PHONE_E164.replace(/^\+/, ""),
    phoneDisplay: PHONE_DISPLAY,
    to: env.CONTACT_TO,
    from: env.CONTACT_FROM,
    address: "Santo Domingo, RD",
    hours: BUSINESS_HOURS,
    whatsappText: "Hola, me gustaría cotizar un servicio de control de plagas",
  },

  email: {
    resend: {
      apiKey: env.RESEND_API_KEY,
      from: env.RESEND_FROM_EMAIL,
    },
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from: env.SMTP_FROM_EMAIL,
    },
  },
};
