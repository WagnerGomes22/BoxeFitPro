import { getUsers } from "@/actions/admin/get-users";
import { UsersTable } from "./_components/users-table";
import { Users } from "lucide-react";
import { CreateUserButton } from "./_components/create-user-button";

export default async function AdminUsersPage() {
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
