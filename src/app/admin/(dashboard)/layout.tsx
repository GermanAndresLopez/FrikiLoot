import { redirect } from "next/navigation";
import { getAdminUser } from "@/services/authService";
import { AdminNav } from "@/features/admin/AdminNav";

/** Layout protegido: exige sesión admin para todo el grupo (dashboard). */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-bg md:flex">
      <AdminNav email={user.email ?? ""} />
      <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-8">{children}</main>
    </div>
  );
}
