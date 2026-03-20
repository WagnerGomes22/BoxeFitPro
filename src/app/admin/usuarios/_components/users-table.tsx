"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, ShieldAlert, User, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/actions/admin/update-user-role";
import { useRouter } from "next/navigation";

type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";
type RoleFilter = "ALL" | UserRole;

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  _count: {
    bookings: number;
  };
}

interface UsersTableProps {
  users: UserRow[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const router = useRouter();

  const filteredUsers = users.filter((user) => {
    if (roleFilter === "ALL") return true;
    return user.role === roleFilter;
  });

  async function handleRoleChange(userId: string, newRole: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
    setLoadingId(userId);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success(`Usuário agora é ${newRole}`);
        router.refresh(); // Atualiza a página para refletir a mudança
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao atualizar permissão.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as RoleFilter)}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Todos os usuários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os usuários</SelectItem>
              <SelectItem value="STUDENT">Alunos</SelectItem>
              <SelectItem value="INSTRUCTOR">Instrutores</SelectItem>
              <SelectItem value="ADMIN">Administradores</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="text-center">Aulas</TableHead>
              <TableHead className="text-center">Permissão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum usuário encontrado com este filtro.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900">
                    {user.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-600">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-center text-zinc-600">
                    {user._count.bookings}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={
                          user.role === "ADMIN" ? "destructive" : 
                          user.role === "INSTRUCTOR" ? "default" : 
                          "secondary"
                      }
                      className="w-24 justify-center"
                    >
                      {user.role === "ADMIN"
                        ? "ADMIN"
                        : user.role === "INSTRUCTOR"
                          ? "INSTRUTOR"
                          : "ALUNO"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                  
                      {user.role !== "INSTRUCTOR" && (
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Tornar Instrutor"
                              disabled={loadingId === user.id}
                              onClick={() => handleRoleChange(user.id, "INSTRUCTOR")}
                              className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                              <User className="h-4 w-4" />
                          </Button>
                      )}
                      {user.role !== "ADMIN" && (
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Tornar Admin"
                              disabled={loadingId === user.id}
                              onClick={() => handleRoleChange(user.id, "ADMIN")}
                              className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                          >
                              <ShieldAlert className="h-4 w-4" />
                          </Button>
                      )}
                       {user.role !== "STUDENT" && (
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Remover Privilégios (Tornar Aluno)"
                              disabled={loadingId === user.id}
                              onClick={() => handleRoleChange(user.id, "STUDENT")}
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                          >
                              <Shield className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
