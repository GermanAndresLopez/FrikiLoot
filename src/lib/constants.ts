/** Constantes de dominio compartidas. */

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

export const SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "populares", label: "Más populares" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "in_stock", label: "Disponibles" },
] as const;

export const STORAGE_BUCKET = "product-images";

export const CART_STORAGE_KEY = "frikiloot-cart";
export const SESSION_STORAGE_KEY = "frikiloot-session-id";

/** Número de productos por página en el catálogo. */
export const PAGE_SIZE = 12;
