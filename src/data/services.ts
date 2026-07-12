// src/data/services.ts
import { z } from "zod";
import type { ImageMetadata } from "astro";

// Local service images (optimized at build time via astro:assets)
import desinsectacionImg from "../assets/servicios/desinsectacion.png";
import desratizacionImg from "../assets/servicios/desratizacion.png";
import sanitizacionImg from "../assets/servicios/sanitizacion-desinfeccion.png";
import antitermitasImg from "../assets/servicios/tratamiento-de-termitas-3.jpeg";
import tanquesImg from "../assets/servicios/limpieza-de-tanques.png";
import palomasImg from "../assets/servicios/control-palomas.png";

// imgSrc holds an imported ImageMetadata so it can be optimized with <Image />.
export type Service = {
  title: string;
  description: string;
  bullets: string[];
  slug: string;
  imgSrc?: ImageMetadata;
  imgAlt?: string;
};

export const services: Service[] = [
  {
    title: "Desinsectación",
    description: "Eliminación de insectos rastreros y voladores con geles, cebos y aspersión.",
    bullets: ["Cucarachas y hormigas", "Mosquitos y moscas", "Arañas y chinches"],
    slug: "desinsectacion",
    imgSrc: desinsectacionImg,
    imgAlt: "Desinsectación",
  },
  {
    title: "Desratización",
    description: "Control de roedores con estaciones seguras, trampeo y sellado de puntos críticos.",
    bullets: ["Monitoreo con placas", "Mapeo de riesgo", "Reporte técnico"],
    slug: "desratizacion",
    imgSrc: desratizacionImg,
    imgAlt: "Desratización",
  },
  {
    title: "Sanitización / Desinfección",
    description: "Nebulización ULV y desinfección con productos certificados.",
    bullets: ["Protocolos MIP", "Ficha técnica y MSDS", "Certificación de servicio"],
    slug: "sanitizacion",
    imgSrc: sanitizacionImg,
    imgAlt: "Sanitización",
  },
  {
    title: "Tratamiento antitermitas",
    description: "Barreras químicas y protección preventiva de madera en obra.",
    bullets: ["Inspección con sonda", "Garantía por escrito", "Plan de mantenimiento"],
    slug: "antitermitas",
    imgSrc: antitermitasImg,
    imgAlt: "Tratamiento de termitas",
  },
  {
    title: "Limpieza de tanques",
    description: "Lavado y desinfección de tinacos y cisternas.",
    bullets: ["Análisis microbiológico", "Registro fotográfico", "Informe técnico"],
    slug: "tanques",
    imgSrc: tanquesImg,
    imgAlt: "Limpieza de tanques",
  },
  {
    title: "Control de palomas",
    description: "Picos, redes y geles repelentes para techos y cornisas.",
    bullets: ["Evaluación de riesgo", "Soluciones no letales", "Limpieza y desinfección"],
    slug: "palomas",
    imgSrc: palomasImg,
    imgAlt: "Control de palomas",
  },
];

/* ===== Helpers (sin cambios) ===== */
export const SERVICE_SLUGS = services.map(s => s.slug) as readonly string[];
export const ServiceSlugEnum = z.enum(SERVICE_SLUGS as [string, ...string[]]);
export const SERVICE_BY_SLUG: Record<string, Service> = Object.fromEntries(services.map(s => [s.slug, s]));
export const getServiceBySlug = (slug?: string | null) => slug ? SERVICE_BY_SLUG[slug] : undefined;
export const getServiceOptions = () => services.map(s => ({ value: s.slug, label: s.title }));