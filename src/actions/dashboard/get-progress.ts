"use server";

import { prisma } from "@/lib/prisma";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auth } from "@/auth";

// Helper para inferir nível pelo nome (mesmo do get-dashboard)
function inferLevel(className: string): "Iniciante" | "Intermediário" | "Avançado" | "Todos" {
  const lower = className.toLowerCase();
  if (lower.includes("iniciante")) return "Iniciante";
  if (lower.includes("intermediário") || lower.includes("intermediario")) return "Intermediário";
  if (lower.includes("avançado") || lower.includes("avancado") || lower.includes("sparring")) return "Avançado";
  return "Todos";
}

export async function getProgressData() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const userId = session.user.id;
  const now = new Date();

  // 1. Buscar TODAS as aulas passadas para cálculo histórico preciso
  const allPastBookings = await prisma.booking.findMany({
    where: {
      userId: userId,
      class: {
        startTime: {
          lt: now,
        },
      },
      // Removido filtro de status para incluir CANCELADOS para o grid
    },
    select: {
      id: true,
      status: true,
      class: {
        select: {
          name: true,
          startTime: true,
          instructor: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: {
      class: {
        startTime: "desc", // Ordenação padrão para lista (mais recente primeiro)
      },
    },
  });

  // Filtrar apenas presenças (ATTENDED ou CONFIRMED no passado) para estatísticas
  // Ignora NO_SHOW e CANCELED
  const attendedBookings = allPastBookings.filter(b => 
    b.status === "ATTENDED" || (b.status === "CONFIRMED" && b.class.startTime < now)
  );

  // A. Calcular Maior Sequência (Longest Streak)
  // Requer ordenação cronológica (asc)
  const sortedForStreak = [...attendedBookings].sort((a, b) => 
    a.class.startTime.getTime() - b.class.startTime.getTime()
  );

  let longestStreak = 0;
  let currentStreak = 0;
  
  if (sortedForStreak.length > 0) {
    const uniqueDates = Array.from(new Set(
      sortedForStreak.map(b => format(b.class.startTime, "yyyy-MM-dd"))
    )); // Já está ordenado por causa do sort acima

    if (uniqueDates.length > 0) {
      currentStreak = 1;
      longestStreak = 1;
      
      let prevDate = new Date(uniqueDates[0]);
      prevDate.setHours(0, 0, 0, 0);

      for (let i = 1; i < uniqueDates.length; i++) {
        const currDateStr = uniqueDates[i];
        const currDate = new Date(currDateStr);
        currDate.setHours(0, 0, 0, 0);

        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        prevDate = currDate;
      }
    }
  }

  // B. Histórico Mensal (Últimos 12 meses)
  const monthlyHistoryData = [];
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, "yyyy-MM");
    const monthLabel = format(date, "MMM", { locale: ptBR }).toUpperCase();
    
    const count = attendedBookings.filter(b => 
      format(b.class.startTime, "yyyy-MM") === monthKey
    ).length;

    monthlyHistoryData.push({
      month: monthLabel,
      fullDate: monthKey,
      classes: count,
    });
  }

  // C. Lista Detalhada de Histórico (TODAS as aulas: Presenças, Faltas e Cancelamentos)
  const fullHistoryList = allPastBookings.map((booking) => ({
    id: booking.id,
    formattedDate: format(booking.class.startTime, "dd MMM", { locale: ptBR }).toUpperCase(),
    fullDate: booking.class.startTime.toISOString(), // Adicionado para o grid
    status: booking.status,
    class: {
      name: booking.class.name,
      level: inferLevel(booking.class.name),
      instructor: booking.class.instructor.name,
      time: format(booking.class.startTime, "HH:mm"),
    },
  }));

  // D. Métricas Gerais
  const totalClasses = attendedBookings.length;
  
  // Taxa de Presença Geral (Total Agendado vs Total Atendido)
  // Consideramos agendamentos válidos (não cancelados) para o denominador
  const validBookings = allPastBookings.filter(b => b.status !== "CANCELED");
  const totalScheduled = validBookings.length;
  
  const overallAttendanceRate = totalScheduled > 0 
    ? Math.round((totalClasses / totalScheduled) * 100) 
    : 100;

  return {
    monthlyHistory: monthlyHistoryData,
    fullHistory: fullHistoryList, // Nova propriedade
    longestStreak,
    totalClasses,
    overallAttendanceRate,
    lastRecordDate: longestStreak > 0 ? new Date() : null,
  };
}
