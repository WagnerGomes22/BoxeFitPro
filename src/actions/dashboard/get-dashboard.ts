"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auth } from "@/auth";

// Helper para inferir nível pelo nome
function inferLevel(className: string): "Iniciante" | "Intermediário" | "Avançado" | "Todos" {
  const lower = className.toLowerCase();
  if (lower.includes("iniciante")) return "Iniciante";
  if (lower.includes("intermediário") || lower.includes("intermediario")) return "Intermediário";
  if (lower.includes("avançado") || lower.includes("avancado") || lower.includes("sparring")) return "Avançado";
  return "Todos";
}

export async function getDashboardData() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const userId = session.user.id;
  const now = new Date();
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);

  // 1. Buscar métricas do mês
  const monthlyBookingsCount = await prisma.booking.count({
    where: {
      userId: userId,
      status: { not: "CANCELED" },
      class: {
        startTime: {
          gte: startMonth,
          lte: endMonth,
        },
      },
    },
  });

  // 2. Buscar próximas aulas (Futuras e confirmadas)
  const upcomingBookingsRaw = await prisma.booking.findMany({
    where: {
      userId: userId,
      status: "CONFIRMED",
      class: {
        startTime: {
          gte: now,
        },
      },
    },
    include: {
      class: {
        include: {
          instructor: {
            select: { name: true },
          },
          _count: {
            select: { bookings: true }
          }
        },
      },
    },
    orderBy: {
      class: {
        startTime: "asc",
      },
    },
    take: 5,
  });

  // 3. Buscar histórico recente (Passadas) para lista e cálculos
  const pastBookingsRaw = await prisma.booking.findMany({
    where: {
      userId: userId,
      class: {
        startTime: {
          lt: now,
        },
      },
      status: {
        not: "CANCELED",
      },
    },
    include: {
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
        startTime: "desc",
      },
    },
    // Removido o take: 5 para calcular estatísticas com todo o histórico recente
    // Em produção com muitos dados, isso deve ser otimizado com agregações do banco
  });

  // 4. Calcular Estatísticas
  // A. Taxa de Presença (Attendance Rate)
  // Consideramos: ATTENDED e CONFIRMED (passado) como presença. NO_SHOW como falta.
  const totalPastScheduled = pastBookingsRaw.filter(b => b.status !== "CANCELED").length;
  const attendedCount = pastBookingsRaw.filter(b => 
    b.status === "ATTENDED" || (b.status === "CONFIRMED" && b.class.startTime < now)
  ).length;

  const attendanceRate = totalPastScheduled > 0 
    ? Math.round((attendedCount / totalPastScheduled) * 100) 
    : 100; // Começa com 100%

  // B. Sequência Atual (Streak)
  // Conta dias consecutivos com aulas assistidas, de hoje para trás
  let streak = 0;
  if (attendedCount > 0) {
    const attendedDates = pastBookingsRaw
      .filter(b => b.status === "ATTENDED" || (b.status === "CONFIRMED" && b.class.startTime < now))
      .map(b => format(b.class.startTime, "yyyy-MM-dd"));
    
    const uniqueDates = Array.from(new Set(attendedDates)).sort().reverse();
    
    if (uniqueDates.length > 0) {
        // Verificar se a última aula foi hoje ou ontem para manter a sequência
        const todayStr = format(now, "yyyy-MM-dd");
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = format(yesterdayDate, "yyyy-MM-dd");
        
        const lastClassDate = uniqueDates[0];
        
        // Se a última aula foi hoje ou ontem, a sequência está ativa
        if (lastClassDate === todayStr || lastClassDate === yesterdayStr) {
            streak = 1;
            let currentDate = new Date(lastClassDate);
            // Ajustar fuso horário para garantir comparação correta de dias (zerar horas)
            currentDate.setHours(0, 0, 0, 0);
            
            for (let i = 1; i < uniqueDates.length; i++) {
                const prevDateStr = uniqueDates[i];
                const prevDate = new Date(prevDateStr);
                prevDate.setHours(0, 0, 0, 0); // Zerar horas para comparação de dias inteiros

                // Diferença em dias
                const diffTime = currentDate.getTime() - prevDate.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) {
                    streak++;
                    currentDate = prevDate;
                } else {
                    break;
                }
            }
        }
    }
  }

  // 5. Transformar dados para o formato da UI
  const upcomingClasses = upcomingBookingsRaw.map((booking) => ({
    id: booking.id,
    formattedDate: format(booking.class.startTime, "dd MMM", { locale: ptBR }).toUpperCase(),
    class: {
      name: booking.class.name,
      level: inferLevel(booking.class.name),
      instructor: booking.class.instructor.name,
      time: format(booking.class.startTime, "HH:mm"),
      capacity: booking.class.capacity,
      _count: {
        bookings: booking.class._count.bookings,
      },
    },
  }));

  const pastClasses = pastBookingsRaw.slice(0, 5).map((booking) => ({ // Apenas as 5 últimas para a lista
    id: booking.id,
    formattedDate: format(booking.class.startTime, "dd MMM", { locale: ptBR }).toUpperCase(),
    status: booking.status,
    class: {
      name: booking.class.name,
      level: inferLevel(booking.class.name),
      instructor: booking.class.instructor.name,
      time: format(booking.class.startTime, "HH:mm"),
    },
  }));

  return {
    metrics: {
      classesThisMonth: monthlyBookingsCount,
      upcomingClasses: upcomingClasses.length,
      attendanceRate,
      streak,
    },
    upcomingClasses,
    pastClasses,
  };
}
