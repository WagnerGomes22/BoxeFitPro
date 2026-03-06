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
import { Edit2, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { DeleteClassButton } from "./delete-class-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminClassTableProps {
  classes: any[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function AdminClassTable({ classes, currentUserId, currentUserRole }: AdminClassTableProps) {
  return (
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
          {classes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhuma aula cadastrada.
              </TableCell>
            </TableRow>
          ) : (
            classes.map((aula: any) => {
              const canManage = currentUserRole === 'ADMIN' || (currentUserId && aula.instructorId === currentUserId);
              
              const now = new Date();
              const start = new Date(aula.startTime);
              const end = new Date(aula.endTime);
              let statusLabel = "Agendada";
              let statusClass = "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";

              if (end < now) {
                statusLabel = "Concluída";
                statusClass = "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border-zinc-200";
              } else if (start <= now && end >= now) {
                statusLabel = "Em Andamento";
                statusClass = "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 animate-pulse";
              }

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
                  <Badge variant="outline" className={`border ${statusClass}`}>
                    {statusLabel}
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
            )})
          )}
        </TableBody>
      </Table>
    </div>
  );
}
