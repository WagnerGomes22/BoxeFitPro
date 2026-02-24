import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { getProfile } from "@/actions/user/get-profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getProfile().catch(() => null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <MobileNav user={user} />
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {children}
        </div>
      </main>
    </div>
  );
}
