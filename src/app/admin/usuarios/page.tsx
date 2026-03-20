import { getUsers } from "@/actions/admin/get-users";
import { UsersTable } from "./_components/users-table";
import { Users } from "lucide-react";
import { CreateUserButton } from "./_components/create-user-button";
import { auth } from "@/auth";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Acesso restrito</h1>
          <p className="text-sm text-zinc-600">Apenas pessoas autorizadas conseguem acessar esta área.</p>
        </div>
      </div>
    );
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Gestão de Usuários
          </h1>
          <p className="text-zinc-500">Visualize e gerencie os alunos e instrutores.</p>
        </div>
        <CreateUserButton />
      </div>

      <UsersTable users={users} />
    </div>
  );
}
