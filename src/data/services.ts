export type Service = {
  title: string;
  description: string;
  bullets: string[];
  emoji: string;
  slug: string;
};

export const services: Service[] = [
  {
    title: "Desinsectación",
    description:
      "Eliminación de insectos rastreros y voladores con geles, cebos y aspersión de baja toxicidad.",
    bullets: [
      "Cucarachas y hormigas",
      "Mosquitos y moscas",
      "Arañas y chinches",
    ],
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
    bullets: [
      "Protocolos MIP",
      "Ficha técnica y MSDS",
      "Certificación de servicio",
    ],
    emoji: "🧴",
    slug: "sanitizacion",
  },
  {
    title: "Tratamiento antitermitas",
    description: "Barreras químicas y protección preventiva de madera en obra.",
    bullets: [
      "Inspección con sonda",
      "Garantía por escrito",
      "Plan de mantenimiento",
    ],
    emoji: "🪵",
    slug: "antitermitas",
  },
  {
    title: "Limpieza de tanques",
    description: "Lavado y desinfección de tinacos y cisternas.",
    bullets: [
      "Análisis microbiológico",
      "Registro fotográfico",
      "Informe técnico",
    ],
    emoji: "💧",
    slug: "tanques",
  },
  {
    title: "Control de palomas",
    description: "Picos, redes y geles repelentes para techos y cornisas.",
    bullets: [
      "Evaluación de riesgo",
      "Soluciones no letales",
      "Limpieza y desinfección",
    ],
    emoji: "🕊️",
    slug: "palomas",
  },
];
