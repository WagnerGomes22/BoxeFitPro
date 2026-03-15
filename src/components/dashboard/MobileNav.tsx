"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, Home, Calendar, Activity, User, LogOut, Dumbbell } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileNavProps {
  user?: {
    name?: string | null;
    image?: string | null;
    subscriptions?: Array<{
      planName: string;
    }>;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const planName = user?.subscriptions?.[0]?.planName || "Sem Plano";
  const initials = user?.name?.slice(0, 2).toUpperCase() || "??";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const links = [
    { href: "/dashboard", label: "MINHAS AULAS", icon: Home },
    { href: "/dashboard/agendar", label: "AGENDAR TREINO", icon: Calendar },
    { href: "/dashboard/sparring", label: "SPARRING", icon: Dumbbell },
    { href: "/dashboard/progresso", label: "MEU PROGRESSO", icon: Activity },
    { href: "/dashboard/perfil", label: "PERFIL", icon: User },
  ];

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-white dark:bg-neutral-950 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white italic">
          BoxeFit<span className="text-red-600"> Pro</span>
        </h1>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-neutral-950 border-r-neutral-800 text-white">
          <div className="flex flex-col h-full">
            {/* Brand Header */}
            <div className="p-8 pb-6">
              <h2 className="text-2xl font-black tracking-tighter text-white italic">
                BoxeFit<span className="text-red-600"> Pro</span>
              </h2>
            </div>

            <div className="px-4 pb-6 flex-1 flex flex-col gap-6">
              {/* User 'Tag' */}
              <div className="bg-neutral-900/50 p-4 border-l-2 border-red-600">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-none border border-neutral-800">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback className="bg-neutral-800 text-xs font-bold text-neutral-300 rounded-none font-mono">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate tracking-wide text-neutral-200 uppercase">
                      {user?.name || "USUÁRIO"}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate font-mono uppercase">
                      Plano {planName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {links.map((link) => {
                  const isActive =
                    link.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 transition-all group border-l-2",
                        isActive
                          ? "border-red-600 bg-neutral-900/30 text-white"
                          : "border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/20 hover:border-neutral-800"
                      )}
                    >
                      <link.icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-red-500" : "group-hover:text-neutral-300"
                        )}
                      />
                      <span className="text-xs font-bold tracking-widest">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-neutral-900 mt-auto">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 w-full text-neutral-500 hover:text-white hover:bg-neutral-900/50 transition-colors group"
              >
                <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" />
                <span className="text-xs font-bold tracking-widest">SAIR</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
