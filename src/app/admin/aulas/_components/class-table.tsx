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
import { Edit2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { DeleteClassButton } from "./delete-class-button";

interface AdminClassTableProps {
  classes: any[];
}

export function AdminClassTable({ classes }: AdminClassTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Horário</TableHead>
            <TableHead>Aula</TableHead>
            <TableHead className="hidden md:table-cell">Instrutor</TableHead>
            <TableHead className="hidden sm:table-cell">Data</TableHead>
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
            classes.map((aula) => (
              <TableRow key={aula.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {format(aula.startTime, "HH:mm")}
                  <span className="text-zinc-400 mx-1">-</span>
                  {format(aula.endTime, "HH:mm")}
                </TableCell>
                <TableCell className="font-medium text-zinc-900">
                  {aula.name}
                </TableCell>
                <TableCell className="hidden md:table-cell text-zinc-600">
                  {aula.instructor.name}
                </TableCell>
                <TableCell className="hidden sm:table-cell capitalize text-zinc-600">
                  {format(aula.startTime, "dd MMM", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={aula._count.bookings >= aula.capacity ? "destructive" : "secondary"}>
                    {aula._count.bookings}/{aula.capacity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50">
                        <Link href={`/admin/aulas/${aula.id}`}>
                            <Edit2 className="h-4 w-4" />
                        </Link>
                    </Button>
                    <DeleteClassButton classId={aula.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
