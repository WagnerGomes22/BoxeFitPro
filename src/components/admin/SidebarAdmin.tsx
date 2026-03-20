"use client";

import Link from "next/link";
import { LayoutDashboard, CalendarDays, LogOut, ExternalLink, Users, Dumbbell } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarAdminProps {
  user: {
    name?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function SidebarAdmin({ user }: SidebarAdminProps) {
  const pathname = usePathname();
  const initials = user?.name?.slice(0, 2).toUpperCase() || "AD";
  const roleLabel =
    user?.role === "ADMIN"
      ? "ADMIN"
      : user?.role === "INSTRUCTOR"
        ? "INSTRUTOR"
        : user?.role === "STUDENT"
          ? "ALUNO"
          : "STAFF";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const links = [
    { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
    { href: "/admin/aulas", label: "GESTÃO DE AULAS", icon: CalendarDays },
    { href: "/admin/usuarios", label: "USUÁRIOS", icon: Users },
    { href: "/admin/sparring", label: "SPARRING", icon: Dumbbell },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-zinc-950 text-white flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-zinc-900 z-50">
      {/* Brand Header */}
      <div className="p-8 pb-10">
        <h1 className="text-2xl font-black tracking-tighter text-white italic">
          BOXE<span className="text-blue-600">_ADMIN</span>
        </h1>
        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
          Bem vindo ao painel administrativo
        </p>
      </div>

      <div className="px-4 pb-6 flex-1 flex flex-col gap-8">
       
        <div className="bg-zinc-900/50 p-4 border-l-2 border-blue-600">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-none border border-zinc-800">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="bg-zinc-800 text-xs font-bold text-zinc-300 rounded-none font-mono">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate tracking-wide text-zinc-200 uppercase">
                {user?.name || "ADMINISTRADOR"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate font-mono uppercase">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = link.href === "/admin" 
                ? pathname === "/admin" 
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 transition-all group border-l-2",
                  isActive
                    ? "border-blue-600 bg-zinc-900/30 text-white"
                    : "border-transparent text-zinc-500 hover:text-white hover:bg-zinc-900/20 hover:border-zinc-800"
                )}
              >
                <link.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-500" : "group-hover:text-zinc-300")} />
                <span className="text-xs font-bold tracking-widest">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-900 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-colors group"
        >
            <ExternalLink className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-bold tracking-widest">IR PARA O APP</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-colors group"
        >
            <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" />
            <span className="text-xs font-bold tracking-widest">SAIR</span>
        </button>
      </div>
    </aside>
  );
}
