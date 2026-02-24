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
};

// Busca aulas de um intervalo de datas (para preencher o calendário)
export async function getClassesByDateRange(startDate: Date, endDate: Date) {
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

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    startTime: c.startTime,
    endTime: c.endTime,
    capacity: c.capacity,
    bookingsCount: c._count.bookings,
    instructorName: c.instructor.name,
    userBooked: false,
  }));
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

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    startTime: c.startTime,
    endTime: c.endTime,
    capacity: c.capacity,
    bookingsCount: c._count.bookings,
    instructorName: c.instructor.name,
    userBooked: userId ? c.bookings.length > 0 : false,
    userBookingId: userId && c.bookings.length > 0 ? c.bookings[0].id : null,
  }));
}
