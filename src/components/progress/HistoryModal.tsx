"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HistoryModalProps {
  history: any[]; // The full history list
}

export function HistoryModal({ history }: HistoryModalProps) {
  
  const getStatusBadge = (booking: any) => {
    switch (booking.status) {
      case "ATTENDED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] uppercase">
            Presente
          </Badge>
        );
      case "CONFIRMED":
        // Prioriza fullDate para comparação precisa
        const bookingDate = new Date(booking.fullDate);
        const now = new Date();
        
        if (bookingDate < now) {
           return (
             <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 text-[10px] uppercase">
               Pendente
             </Badge>
           );
        }
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-[10px] uppercase">
            Agendado
          </Badge>
        );
      case "NO_SHOW":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-[10px] uppercase">
            Faltou
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant="outline" className="bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 text-[10px] uppercase">
            Cancelada
          </Badge>
        );
      default:
        return <Badge variant="outline">{booking.status}</Badge>;
    }
  };

  const getLevelColor = (level: string) => {
      const l = level?.toLowerCase() || "";
      if (l.includes("iniciante")) return "text-green-600 dark:text-green-400";
      if (l.includes("intermediário")) return "text-yellow-600 dark:text-yellow-400";
      if (l.includes("avançado")) return "text-red-600 dark:text-red-400";
      return "text-blue-600 dark:text-blue-400";
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-medium">
          <History className="w-3.5 h-3.5" />
          Ver Detalhes
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl w-full max-h-[80vh] flex flex-col p-0 overflow-hidden gap-0">
        <AlertDialogHeader className="p-4 border-b bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-500" />
                <AlertDialogTitle className="text-base font-bold">Histórico de Aulas</AlertDialogTitle>
             </div>
             <AlertDialogCancel className="border-none p-1.5 h-auto mt-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                <X className="w-4 h-4" />
                <span className="sr-only">Fechar</span>
             </AlertDialogCancel>
          </div>
          <AlertDialogDescription className="text-xs">
            Lista completa de todas as suas aulas, incluindo presenças, faltas e cancelamentos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex-1 overflow-auto bg-white dark:bg-neutral-950">
            {history.length > 0 ? (
                <Table>
                    <TableHeader className="bg-neutral-50 dark:bg-neutral-900 sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent border-b-neutral-200 dark:border-b-neutral-800">
                            <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider text-neutral-500 h-9 text-center">Data</TableHead>
                            <TableHead className="w-[80px] text-xs font-bold uppercase tracking-wider text-neutral-500 h-9 text-center">Hora</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-neutral-500 h-9">Aula</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-neutral-500 h-9 hidden sm:table-cell text-center">Professor</TableHead>
                            <TableHead className="w-[100px] text-center text-xs font-bold uppercase tracking-wider text-neutral-500 h-9">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((booking: any) => (
                            <TableRow key={booking.id} className="border-b-neutral-100 dark:border-b-neutral-900 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                                <TableCell className="font-mono text-xs font-medium text-neutral-600 dark:text-neutral-400 py-2.5 text-center">
                                    {booking.formattedDate}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-neutral-500 py-2.5 text-center">
                                    {booking.class.time}
                                </TableCell>
                                <TableCell className="py-2.5">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                            {booking.class.name}
                                        </span>
                                        <span className={cn("text-[10px] font-medium uppercase tracking-wide", getLevelColor(booking.class.level))}>
                                            {booking.class.level}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-neutral-600 dark:text-neutral-400 py-2.5 hidden sm:table-cell text-center">
                                    {booking.class.instructor}
                                </TableCell>
                                <TableCell className="text-center py-2.5">
                                    {getStatusBadge(booking)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-12 text-neutral-400 text-sm">
                    Nenhum registro encontrado.
                </div>
            )}
        </div>
        
        {/* Footer opcional, pode ser removido se o X for suficiente, mas ajuda na acessibilidade/UX */}
        <AlertDialogFooter className="p-3 border-t bg-neutral-50/30 dark:bg-neutral-900/30 sm:justify-end hidden sm:flex">
          <AlertDialogCancel className="h-8 text-xs">Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
