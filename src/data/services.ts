// src/data/services.ts
import { z } from "zod";

export type Service = {
  title: string;        // label visible
  description: string;  // resumen para card/listas
  bullets: string[];    // puntos de valor (detalle)
  emoji: string;        // puedes reemplazar por iconos luego
  slug: string;         // ID estable para URL/API (no cambiar una vez publicado)
};

export const services: Service[] = [
  {
    title: "Desinsectación",
    description:
      "Eliminación de insectos rastreros y voladores con geles, cebos y aspersión de baja toxicidad.",
    bullets: ["Cucarachas y hormigas", "Mosquitos y moscas", "Arañas y chinches"],
    emoji: "🐞",
    slug: "desinsectacion",
  },
  {
    title: "Desratización",
    description:
      "Control de roedores con estaciones seguras, trampeo y sellado de puntos críticos.",
    bullets: ["Monitoreo con placas", "Mapeo de riesgo", "Reporte técnico"],
    emoji: "🪤",
    slug: "desratizacion",
  },
  {
    title: "Sanitización / Desinfección",
    description: "Nebulización ULV y desinfección con productos certificados.",
    bullets: ["Protocolos MIP", "Ficha técnica y MSDS", "Certificación de servicio"],
    emoji: "🧴",
    slug: "sanitizacion",
  },
  {
    title: "Tratamiento antitermitas",
    description: "Barreras químicas y protección preventiva de madera en obra.",
    bullets: ["Inspección con sonda", "Garantía por escrito", "Plan de mantenimiento"],
    emoji: "🪵",
    slug: "antitermitas",
  },
  {
    title: "Limpieza de tanques",
    description: "Lavado y desinfección de tinacos y cisternas.",
    bullets: ["Análisis microbiológico", "Registro fotográfico", "Informe técnico"],
    emoji: "💧",
    slug: "tanques",
  },
  {
    title: "Control de palomas",
    description: "Picos, redes y geles repelentes para techos y cornisas.",
    bullets: ["Evaluación de riesgo", "Soluciones no letales", "Limpieza y desinfección"],
    emoji: "🕊️",
    slug: "palomas",
  },
] as const;

/* ===== Helpers reutilizables ===== */
export const SERVICE_SLUGS = services.map(s => s.slug) as readonly string[];
export const ServiceSlugEnum = z.enum(SERVICE_SLUGS as [string, ...string[]]);

export const SERVICE_BY_SLUG: Record<string, Service> =
  Object.fromEntries(services.map(s => [s.slug, s]));

export const getServiceBySlug = (slug?: string | null) =>
  slug ? SERVICE_BY_SLUG[slug] : undefined;

export const getServiceOptions = () =>
  services.map(s => ({ value: s.slug, label: s.title }));
