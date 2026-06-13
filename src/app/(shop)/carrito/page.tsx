import type { Metadata } from "next";
import { CartView } from "@/features/cart/CartView";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default function CarritoPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Tu carrito</h1>
      <CartView />
    </div>
  );
}
