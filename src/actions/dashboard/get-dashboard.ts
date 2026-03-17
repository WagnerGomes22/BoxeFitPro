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

  // 2.1 Buscar próximos sparrings (Futuros e agendados)
  const upcomingSparringsRaw = await prisma.sparringMatch.findMany({
    where: {
      OR: [
        { studentAId: userId },
        { studentBId: userId },
      ],
      status: "SCHEDULED",
      date: {
        gte: now,
      },
    },
    include: {
      studentA: { select: { name: true } },
      studentB: { select: { name: true } },
      instructor: { select: { name: true } },
    },
    orderBy: {
      date: "asc",
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

  
  const totalPastScheduled = pastBookingsRaw.filter(b => b.status !== "CANCELED").length;
  
  const attendedCount = pastBookingsRaw.filter(b => b.status === "ATTENDED").length;

  const attendanceRate = totalPastScheduled > 0 
    ? Math.round((attendedCount / totalPastScheduled) * 100) 
    : 100; 

  
  let streak = 0;
  if (attendedCount > 0) {
    const attendedDates = pastBookingsRaw
      .filter(b => b.status === "ATTENDED")
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
            // Parse manual para evitar problemas de fuso horário onde o Date() pode voltar um dia
            const [year, month, day] = lastClassDate.split('-').map(Number);
            let currentDate = new Date(year, month - 1, day);
            currentDate.setHours(0, 0, 0, 0);
            
            for (let i = 1; i < uniqueDates.length; i++) {
                const prevDateStr = uniqueDates[i];
                const [pYear, pMonth, pDay] = prevDateStr.split('-').map(Number);
                const prevDate = new Date(pYear, pMonth - 1, pDay);
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


  const upcomingClassesMapped = upcomingBookingsRaw.map((booking) => ({
    id: booking.id,
    dateObj: booking.class.startTime, 
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

  const upcomingSparringsMapped = upcomingSparringsRaw.map((match) => {
    const opponentName = match.studentAId === userId ? match.studentB.name : match.studentA.name;
    return {
      id: match.id,
      dateObj: match.date, // Auxiliar para ordenação
      formattedDate: format(match.date, "dd MMM", { locale: ptBR }).toUpperCase(),
      class: {
        name: `Sparring vs ${opponentName}`,
        level: "Avançado" as const,
        instructor: match.instructor?.name || "A definir",
        time: format(match.date, "HH:mm"),
        capacity: 2,
        _count: {
          bookings: 2,
        },
      },
    };
  });

  // Mesclar e ordenar por data
  const upcomingClasses = [...upcomingClassesMapped, ...upcomingSparringsMapped]
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .slice(0, 5) 
    .map(({ dateObj, ...rest }) => rest); 

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
