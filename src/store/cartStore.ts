"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/lib/constants";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  quantity: number;
  /** Stock disponible al momento de agregar — para validar topes. */
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string | null) => void;
  setQuantity: (productId: string, size: string | null, quantity: number) => void;
  clear: () => void;
}

/** Clave única por producto + talla. */
const keyOf = (productId: string, size: string | null) => `${productId}::${size ?? ""}`;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const k = keyOf(item.productId, item.size);
          const existing = state.items.find((i) => keyOf(i.productId, i.size) === k);
          if (existing) {
            return {
              items: state.items.map((i) =>
                keyOf(i.productId, i.size) === k
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
          };
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter((i) => keyOf(i.productId, i.size) !== keyOf(productId, size)),
        })),

      setQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              keyOf(i.productId, i.size) === keyOf(productId, size)
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: CART_STORAGE_KEY }
  )
);

/** Selectores derivados (evitan re-render innecesario). */
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

export const useCartTotal = () =>
  useCartStore((s) => s.items.reduce((acc, i) => acc + i.price * i.quantity, 0));
