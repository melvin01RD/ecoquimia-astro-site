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
    title: "Desinsectaci�n",
    description:
      "Eliminaci�n de insectos rastreros y voladores con geles, cebos y aspersi�n de baja toxicidad.",
    bullets: ["Cucarachas y hormigas", "Mosquitos y moscas", "Ara�as y chinches"],
    emoji: "??",
    slug: "desinsectacion",
  },
  {
    title: "Desratizaci�n",
    description:
      "Control de roedores con estaciones seguras, trampeo y sellado de puntos cr�ticos.",
    bullets: ["Monitoreo con placas", "Mapeo de riesgo", "Reporte t�cnico"],
    emoji: "??",
    slug: "desratizacion",
  },
  {
    title: "Sanitizaci�n / Desinfecci�n",
    description: "Nebulizaci�n ULV y desinfecci�n con productos certificados.",
    bullets: ["Protocolos MIP", "Ficha t�cnica y MSDS", "Certificaci�n de servicio"],
    emoji: "??",
    slug: "sanitizacion",
  },
  {
    title: "Tratamiento antitermitas",
    description: "Barreras qu�micas y protecci�n preventiva de madera en obra.",
    bullets: ["Inspecci�n con sonda", "Garant�a por escrito", "Plan de mantenimiento"],
    emoji: "??",
    slug: "antitermitas",
  },
  {
    title: "Limpieza de tanques",
    description: "Lavado y desinfecci�n de tinacos y cisternas.",
    bullets: ["An�lisis microbiol�gico", "Registro fotogr�fico", "Informe t�cnico"],
    emoji: "??",
    slug: "tanques",
  },
  {
    title: "Control de palomas",
    description: "Picos, redes y geles repelentes para techos y cornisas.",
    bullets: ["Evaluaci�n de riesgo", "Soluciones no letales", "Limpieza y desinfecci�n"],
    emoji: "???",
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