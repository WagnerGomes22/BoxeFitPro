import { auth } from "@/auth";
import { SidebarAdmin } from "@/components/admin/SidebarAdmin";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect("/login");
  }

  // Proteção simples por Role
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <SidebarAdmin user={session.user} />
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {children}
        </div>
      </main>
    </div>
  );
}
