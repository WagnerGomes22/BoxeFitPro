"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { auth } from "@/auth";

export type ClassWithDetails = {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  bookingsCount: number;
  instructorName: string;
  userBooked?: boolean;
  userBookingId?: string | null;
  type?: "CLASS" | "SPARRING";
};

// Busca aulas de um intervalo de datas (para preencher o calendário)
export async function getClassesByDateRange(startDate: Date, endDate: Date) {
  const session = await auth();
  const userId = session?.user?.id;

  const classes = await prisma.class.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      instructor: {
        select: { name: true },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const mappedClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    startTime: c.startTime,
    endTime: c.endTime,
    capacity: c.capacity,
    bookingsCount: c._count.bookings,
    instructorName: c.instructor.name,
    userBooked: false,
    type: "CLASS" as const,
  }));

  // Se tiver usuário logado, busca sparrings também para mostrar no calendário
  if (userId) {
    const sparrings = await prisma.sparringMatch.findMany({
        where: {
            OR: [{ studentAId: userId }, { studentBId: userId }],
            date: {
                gte: startDate,
                lte: endDate,
            },
            status: "SCHEDULED",
        },
        select: {
            id: true,
            date: true,
        }
    });

    const mappedSparrings = sparrings.map(s => ({
        id: s.id,
        name: "Sparring",
        startTime: s.date,
        endTime: new Date(s.date.getTime() + 60 * 60 * 1000), // Assumindo 1h
        capacity: 0,
        bookingsCount: 0,
        instructorName: "",
        userBooked: true,
        type: "SPARRING" as const,
    }));

    return [...mappedClasses, ...mappedSparrings].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  return mappedClasses;
}

// Busca aulas de um dia específico (para o TimeSlotPicker)
export async function getClassesForDay(date: Date) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const start = startOfDay(date);
  const end = endOfDay(date);

  // Reimplementando a busca para poder incluir a verificação de booking específico
  const classes = await prisma.class.findMany({
    where: {
      startTime: {
        gte: start,
        lte: end,
      },
    },
    include: {
      instructor: {
        select: { name: true },
      },
      _count: {
        select: {
          bookings: {
            where: {
              status: {
                not: "CANCELED",
              },
            },
          },
        },
      },
      // Se tiver userId, verifica se existe booking
      bookings: userId
        ? {
            where: {
              userId: userId,
              status: {
                not: "CANCELED",
              },
            },
            select: { id: true }, // Só precisamos saber se existe
          }
        : false,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const mappedClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    startTime: c.startTime,
    endTime: c.endTime,
    capacity: c.capacity,
    bookingsCount: c._count.bookings,
    instructorName: c.instructor.name,
    userBooked: userId ? c.bookings.length > 0 : false,
    userBookingId: userId && c.bookings.length > 0 ? c.bookings[0].id : null,
    type: "CLASS" as const,
  }));

  if (userId) {
      const sparrings = await prisma.sparringMatch.findMany({
          where: {
              OR: [{ studentAId: userId }, { studentBId: userId }],
              date: {
                  gte: start,
                  lte: end,
              },
              status: "SCHEDULED",
          },
          include: {
              studentA: { select: { name: true } },
              studentB: { select: { name: true } },
              instructor: { select: { name: true } },
          }
      });

      const mappedSparrings = sparrings.map(s => {
          const opponent = s.studentAId === userId ? s.studentB.name : s.studentA.name;
          return {
            id: s.id,
            name: `Sparring vs ${opponent}`,
            startTime: s.date,
            endTime: new Date(s.date.getTime() + 60 * 60 * 1000), // Assumindo 1h
            capacity: 2,
            bookingsCount: 2,
            instructorName: s.instructor?.name || "Instrutor",
            userBooked: true, // Sempre true para o aluno ver como agendado
            userBookingId: null,
            type: "SPARRING" as const,
          };
      });

      return [...mappedClasses, ...mappedSparrings].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  return mappedClasses;
}
