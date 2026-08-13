export type CoverageClassification = "sector" | "space";

export type CoverageItem = {
  label: string;
  classification: CoverageClassification;
};

export const coverageItems: CoverageItem[] = [
  { label: "Interior", classification: "space" },
  { label: "Exterior", classification: "space" },
  { label: "Cocinas", classification: "space" },
  { label: "Parqueos", classification: "space" },
  { label: "Almacen", classification: "space" },
  { label: "Comedor", classification: "space" },
  { label: "Pasillos", classification: "space" },
  { label: "Hospitales", classification: "sector" },
  { label: "Condominios", classification: "sector" },
  { label: "Laboratorios", classification: "sector" },
  { label: "Habitaciones", classification: "space" },
  { label: "Super Mercados", classification: "sector" },
  { label: "Deposito de Basura", classification: "space" },
  { label: "Apartamentos", classification: "sector" },
  { label: "Casas", classification: "sector" },
  { label: "Hoteles", classification: "sector" },
  { label: "Oficinas", classification: "sector" },
  { label: "Restaurantes", classification: "sector" },
  { label: "Vehículos", classification: "space" },
  { label: "Área Común", classification: "space" },
  { label: "Industria Farmacéutica", classification: "sector" },
  { label: "Colegios", classification: "sector" },
  { label: "Plazas Comerciales", classification: "sector" },
  { label: "Edificios Empresariales", classification: "sector" },
  { label: "Cimientos de Construcción", classification: "space" },
];

export const sectors = coverageItems.filter((item) => item.classification === "sector");
export const attendedSpaces = coverageItems.filter((item) => item.classification === "space");
export const categories = coverageItems.map((item) => item.label) as readonly string[];

export default categories;
