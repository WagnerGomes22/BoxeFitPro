'use server';

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getAdminDashboardData() {
  try {
    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);

    // =================================================================
    // 1. MÉTRICAS PRINCIPAIS
    // =================================================================

    // Aulas Hoje
    const classesToday = await prisma.class.count({
      where: {
        startTime: {
          gte: startToday,
          lte: endToday,
        },
      },
    });

    // Alunos Ativos (com assinatura ativa)
    const activeStudents = await prisma.user.count({
      where: {
        role: "STUDENT",
        subscriptions: {
          some: {
            status: "ACTIVE",
          },
        },
      },
    });

    // Receita Mensal Estimada (Baseada em Assinaturas Ativas)
    // Preços hardcoded baseados no componente Planos.tsx (idealmente estariam no banco)
    const PLAN_PRICES: Record<string, number> = {
      "Básico": 69.90,
      "Premium": 109.90,
      "VIP": 179.90,
      // Fallback para variações de string
      "Basico": 69.90,
      "Basic": 69.90,
    };

    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      select: { planName: true, createdAt: true },
    });

    const monthlyRevenue = activeSubscriptions.reduce((acc, sub) => {
      const price = PLAN_PRICES[sub.planName] || 0;
      return acc + price;
    }, 0);

    // Taxa de Ocupação (Últimos 7 dias)
    const startLast7Days = subDays(today, 7);
    const recentClasses = await prisma.class.findMany({
      where: {
        startTime: {
          gte: startLast7Days,
          lte: today,
        },
      },
      include: {
        _count: {
          select: { bookings: { where: { status: { not: "CANCELED" } } } },
        },
      },
    });

    let totalCapacity = 0;
    let totalBookings = 0;

    recentClasses.forEach((cls) => {
      totalCapacity += cls.capacity;
      totalBookings += cls._count.bookings;
    });

    const occupancyRate = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0;

    // =================================================================
    // 2. GRÁFICOS ESTRATÉGICOS
    // =================================================================

    // Gráfico de Linha - Receita Mensal (Evolução últimos 6 meses - Simulado via MRR acumulado)
    // Como não temos histórico de pagamentos, vamos simular o crescimento baseando-se na data de criação das assinaturas ativas.
    // Isso mostra "Novas Receitas Recorrentes" acumuladas.
    const revenueHistory = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i);
      const monthKey = format(date, "MMM", { locale: ptBR });
      
      // Filtrar assinaturas criadas até o fim deste mês específico
      // Nota: Isso é uma aproximação de MRR.
      const subsUntilMonth = activeSubscriptions.filter(
        (sub) => sub.createdAt <= endOfMonth(date)
      );

      const revenue = subsUntilMonth.reduce((acc, sub) => {
        return acc + (PLAN_PRICES[sub.planName] || 0);
      }, 0);

      revenueHistory.push({ name: monthKey, value: revenue });
    }

    // Gráfico de Barra - Agendamentos por Dia da Semana
    // Analisar últimos 30 dias
    const startLast30Days = subDays(today, 30);
    const bookingsLast30Days = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startLast30Days },
        status: { not: "CANCELED" },
      },
      select: { class: { select: { startTime: true } } },
    });

    const bookingsByDay = [0, 0, 0, 0, 0, 0, 0]; // Dom a Sab
    bookingsLast30Days.forEach((b) => {
      const dayIndex = getDay(b.class.startTime);
      bookingsByDay[dayIndex]++;
    });

    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const bookingsByDayChart = daysOfWeek.map((day, index) => ({
      name: day,
      value: bookingsByDay[index],
    }));

    // Gráfico de Pizza - Aulas por Modalidade
    // Analisar todas as aulas cadastradas (ou restrito a um período se preferir)
    const allClasses = await prisma.class.findMany({
      where: { startTime: { gte: startLast30Days } }, // Últimos 30 dias para ser relevante
      select: { name: true },
    });

    const modalitiesCount: Record<string, number> = {};
    allClasses.forEach((cls) => {
      // Normalização das modalidades conforme regra de negócio
      const lowerName = cls.name.toLowerCase();
      let modality = "Escola de Boxe"; // Padrão agora é Escola de Boxe

      if (lowerName.includes("sparring")) {
        modality = "Sparring";
      } else if (lowerName.includes("funcional")) {
        modality = "Funcional";
      }
      
  
      modalitiesCount[modality] = (modalitiesCount[modality] || 0) + 1;
    });

    const modalitiesChart = Object.entries(modalitiesCount).map(([name, value]) => ({
      name,
      value,
    }));

    // =================================================================
    // 3. OPERACIONAL DO DIA
    // =================================================================

    // Aulas do Dia
    const nextClassesToday = await prisma.class.findMany({
      where: {
        startTime: {
          gte: startToday,
          lte: endToday,
        },
      },
      orderBy: { startTime: "asc" },
      include: {
        instructor: { select: { name: true } },
        _count: {
          select: { bookings: { where: { status: { not: "CANCELED" } } } },
        },
      },
    });

    const now = new Date();
    const sortedClassesToday = [...nextClassesToday].sort((a, b) => {
      if (b._count.bookings !== a._count.bookings) {
        return b._count.bookings - a._count.bookings;
      }
      return a.startTime.getTime() - b.startTime.getTime();
    });

    const operationalClasses = sortedClassesToday.map((c) => {
      let status = "SCHEDULED";
      if (c.endTime < now) {
        status = "COMPLETED";
      } else if (c.startTime <= now && c.endTime >= now) {
        status = "ONGOING";
      }

      return {
        id: c.id,
        time: format(c.startTime, "HH:mm"),
        name: c.name,
        instructor: c.instructor.name ?? "Instrutor",
        bookings: c._count.bookings,
        capacity: c.capacity,
        occupancy: Math.round((c._count.bookings / c.capacity) * 100),
        status,
      };
    });

    const alerts: { type: "warning" | "danger" | "info" | "success"; message: string }[] = [];

    // 1. Planos próximos do vencimento (próximos 7 dias)
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          gte: today,
          lte: subDays(today, -7), // Data futura (today + 7 dias... subDays negativo adiciona)
        },
      },
      include: { user: { select: { name: true } } },
    });

    expiringSubscriptions.forEach(sub => {
      alerts.push({
        type: "warning",
        message: `Plano de ${sub.user.name} vence em breve (${format(sub.currentPeriodEnd!, "dd/MM")})`,
      });
    });

   
    const overdueSubscriptions = await prisma.subscription.findMany({
      where: { status: "PAST_DUE" },
      include: { user: { select: { name: true } } },
    });

    overdueSubscriptions.forEach(sub => {
      alerts.push({
        type: "danger",
        message: `Pagamento pendente: ${sub.user.name}`,
      });
    });

 
    operationalClasses.forEach(cls => {
      if (cls.occupancy >= 80 && cls.occupancy < 100) {
        alerts.push({
          type: "info",
          message: `Turma de ${cls.name} (${cls.time}) quase cheia (${cls.bookings}/${cls.capacity})`,
        });
      } else if (cls.occupancy >= 100) {
        alerts.push({
          type: "success",
          message: `Turma de ${cls.name} (${cls.time}) LOTADA`,
        });
      }
    });

 
    operationalClasses.forEach(cls => {
      if (cls.bookings === 0) {
        alerts.push({
          type: "warning",
          message: `Turma de ${cls.name} (${cls.time}) sem inscritos`,
        });
      }
    });

    return {
      metrics: {
        classesToday,
        activeStudents,
        monthlyRevenue,
        occupancyRate: Math.round(occupancyRate),
      },
      charts: {
        revenueHistory,
        bookingsByDay: bookingsByDayChart,
        modalities: modalitiesChart,
      },
      operational: {
        nextClasses: operationalClasses,
        alerts,
      },
    };

  } catch (error) {
    console.error("Erro ao carregar dashboard admin:", error);
    return null;
  }
}
