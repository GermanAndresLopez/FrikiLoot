import { ShopHeader } from "@/components/ShopHeader";
import { BottomNav } from "@/components/BottomNav";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShopHeader />
      <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-24 pt-4 md:pb-10">{children}</div>
      <BottomNav />
    </>
  );
}
