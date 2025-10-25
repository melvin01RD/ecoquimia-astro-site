/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;

  // Correos destino/remitente genéricos
  readonly CONTACT_FROM?: string;
  readonly CONTACT_TO?: string;

  // Resend
  readonly RESEND_API_KEY?: string;
  readonly RESEND_FROM_EMAIL?: string;  // 👈 lo usamos en mailer.ts

  // SMTP
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_SECURE?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly SMTP_FROM_EMAIL?: string;

  // Otros
  readonly CAPTCHA_SECRET?: string;
  readonly HONEYPOT_FIELD?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
