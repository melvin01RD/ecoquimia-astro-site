export const categories = [
  "Apartamentos",
  "Casas",
  "Hoteles",
  "Oficinas",
  "Restaurantes",
  "Vehículos",
  "Área Común",
  "Industria Farmacéutica",
  "Colegios",
  "Plazas Comerciales",
  "Edificios Empresariales",
  "Cimientos de Construcción",
] as const;

export default categories;


// This file contains a list of categories that can be used in the application. The categories are defined as a constant array of strings, and the `as const` assertion ensures that the array is treated as a tuple of string literals, providing better type safety. The `export default` statement allows other parts of the application to import this list of categories easily.