import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminClasses } from "@/actions/admin/get-classes";
import { AdminClassTable } from "./_components/class-table";
import { auth } from "@/auth";

export default async function AdminClassesPage() {
  const session = await auth();
  const classes = await getAdminClasses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Gestão de Aulas</h1>
          <p className="text-zinc-500">Visualize e gerencie a grade de horários.</p>
        </div>
        <Button asChild>
          <Link href="/admin/aulas/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova Aula
          </Link>
        </Button>
      </div>

      <AdminClassTable 
        classes={classes} 
        currentUserId={session?.user?.id}
        currentUserRole={session?.user?.role}
      />
    </div>
  );
}
