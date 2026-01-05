// src/data/services.ts
import { z } from "zod";

// Agregamos imgSrc y imgAlt al tipo
export type Service = {
  title: string;
  description: string;
  bullets: string[];
  emoji: string;
  slug: string;
  imgSrc?: string;
  imgAlt?: string;
};

// Rutas a los archivos que están en public/img/servicios
export const services: Service[] = [
  {
    title: "Desinsectación",
    description: "Eliminación de insectos rastreros y voladores con geles, cebos y aspersión.",
    bullets: ["Cucarachas y hormigas", "Mosquitos y moscas", "Arañas y chinches"],
    emoji: "🐞",
    slug: "desinsectacion",
    imgSrc: "/img/servicios/desinsectacion.png",
    imgAlt: "Desinsectación",
  },
  {
    title: "Desratización",
    description: "Control de roedores con estaciones seguras, trampeo y sellado de puntos críticos.",
    bullets: ["Monitoreo con placas", "Mapeo de riesgo", "Reporte técnico"],
    emoji: "🪤",
    slug: "desratizacion",
    imgSrc: "/img/servicios/Desratización.png",
    imgAlt: "Desratización",
  },
  {
    title: "Sanitización / Desinfección",
    description: "Nebulización ULV y desinfección con productos certificados.",
    bullets: ["Protocolos MIP", "Ficha técnica y MSDS", "Certificación de servicio"],
    emoji: "🧴",
    slug: "sanitizacion",
    imgSrc: "/img/servicios/Sanitización-Desinfección.png",
    imgAlt: "Sanitización",
  },
  {
    title: "Tratamiento antitermitas",
    description: "Barreras químicas y protección preventiva de madera en obra.",
    bullets: ["Inspección con sonda", "Garantía por escrito", "Plan de mantenimiento"],
    emoji: "🪵",
    slug: "antitermitas",
    imgSrc: "/img/servicios/tratamiento-de-termitas -3.jpeg",
    imgAlt: "Tratamiento de termitas",
  },
  {
    title: "Limpieza de tanques",
    description: "Lavado y desinfección de tinacos y cisternas.",
    bullets: ["Análisis microbiológico", "Registro fotográfico", "Informe técnico"],
    emoji: "💧",
    slug: "tanques",
    imgSrc: "/img/servicios/Limpieza-de-tanques.png",
    imgAlt: "Limpieza de tanques",
  },
  {
    title: "Control de palomas",
    description: "Picos, redes y geles repelentes para techos y cornisas.",
    bullets: ["Evaluación de riesgo", "Soluciones no letales", "Limpieza y desinfección"],
    emoji: "🕊️",
    slug: "palomas",
    imgSrc: "/img/servicios/control-palomas.png",
    imgAlt: "Control de palomas",
  },
] as const;

/* ===== Helpers (sin cambios) ===== */
export const SERVICE_SLUGS = services.map(s => s.slug) as readonly string[];
export const ServiceSlugEnum = z.enum(SERVICE_SLUGS as [string, ...string[]]);
export const SERVICE_BY_SLUG: Record<string, Service> = Object.fromEntries(services.map(s => [s.slug, s]));
export const getServiceBySlug = (slug?: string | null) => slug ? SERVICE_BY_SLUG[slug] : undefined;
export const getServiceOptions = () => services.map(s => ({ value: s.slug, label: s.title }));