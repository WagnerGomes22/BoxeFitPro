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
import { Button } from "@/components/ui/button";
import { Edit2, Filter, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { DeleteClassButton } from "./delete-class-button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClassRow {
  id: string;
  name: string;
  startTime: Date | string;
  endTime: Date | string;
  capacity: number;
  instructorId: string;
  instructor: {
    name: string | null;
  };
  _count: {
    bookings: number;
  };
}

interface AdminClassTableProps {
  classes: ClassRow[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function AdminClassTable({ classes, currentUserId, currentUserRole }: AdminClassTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<ClassTypeFilter>("ALL");
  const now = new Date();

  const getClassType = (aula: ClassRow) => {
    const name = aula.name.toLowerCase();

    if (name.includes("sparring")) return "SPARRING";
    if (name.includes("escola de combate")) return "ESCOLA_COMBATE";
    if (name.includes("funcional")) return "FUNCIONAL";
    if (name.includes("técnico") || name.includes("tecnico")) return "TECNICO";
    if (name.includes("iniciante")) return "INICIANTE";
    return "OUTROS";
  };

  const getStatus = (aula: ClassRow) => {
    const start = new Date(aula.startTime);
    const end = new Date(aula.endTime);

    if (end < now) {
      return {
        key: "COMPLETED",
        label: "Concluída",
        className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
      };
    }

    if (start <= now && end >= now) {
      return {
        key: "ONGOING",
        label: "Em Andamento",
        className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 animate-pulse",
      };
    }

    return {
      key: "SCHEDULED",
      label: "Agendada",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
    };
  };

  const filteredClasses = classes.filter((aula) => {
    const matchesSearch =
      aula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aula.instructor.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== "ALL" && getStatus(aula).key !== statusFilter) return false;
    if (typeFilter !== "ALL" && getClassType(aula) !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aula ou instrutor..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-8 w-[220px]"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="SCHEDULED">Agendadas</SelectItem>
              <SelectItem value="ONGOING">Em andamento</SelectItem>
              <SelectItem value="COMPLETED">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ClassTypeFilter)}>
            <SelectTrigger className="w-[200px] h-8">
              <SelectValue placeholder="Todas as modalidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as modalidades</SelectItem>
              <SelectItem value="ESCOLA_COMBATE">Escola de Combate</SelectItem>
              <SelectItem value="TECNICO">Boxe Técnico</SelectItem>
              <SelectItem value="INICIANTE">Boxe Iniciante</SelectItem>
              <SelectItem value="FUNCIONAL">Funcional</SelectItem>
              <SelectItem value="SPARRING">Sparring</SelectItem>
              <SelectItem value="OUTROS">Outras</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          Mostrando {filteredClasses.length} de {classes.length} aulas
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Horário</TableHead>
              <TableHead>Aula</TableHead>
              <TableHead className="hidden md:table-cell">Instrutor</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Lotação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhuma aula encontrada com este filtro.
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((aula) => {
                const canManage = currentUserRole === "ADMIN" || (currentUserId && aula.instructorId === currentUserId);
                const status = getStatus(aula);

                return (
              <TableRow key={aula.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {format(new Date(aula.startTime), "HH:mm")}
                  <span className="text-zinc-400 mx-1">-</span>
                  {format(new Date(aula.endTime), "HH:mm")}
                </TableCell>
                <TableCell className="font-medium text-zinc-900">
                  {aula.name}
                </TableCell>
                <TableCell className="hidden md:table-cell text-zinc-600">
                  {aula.instructor.name}
                </TableCell>
                <TableCell className="hidden sm:table-cell capitalize text-zinc-600">
                  {format(new Date(aula.startTime), "dd MMM", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border ${status.className}`}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={aula._count.bookings >= aula.capacity ? "destructive" : "secondary"}>
                    {aula._count.bookings}/{aula.capacity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canManage && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-green-600 hover:bg-green-50">
                            <Link href={`/admin/aulas/${aula.id}/presenca`}>
                              <Users className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lista de Presença</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    )}

                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50">
                        <Link href={`/admin/aulas/${aula.id}`}>
                            <Edit2 className="h-4 w-4" />
                        </Link>
                    </Button>
                    
                    {canManage && (
                    <DeleteClassButton classId={aula.id} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type StatusFilter = "ALL" | "SCHEDULED" | "ONGOING" | "COMPLETED";
type ClassTypeFilter = "ALL" | "ESCOLA_COMBATE" | "TECNICO" | "INICIANTE" | "FUNCIONAL" | "SPARRING" | "OUTROS";
