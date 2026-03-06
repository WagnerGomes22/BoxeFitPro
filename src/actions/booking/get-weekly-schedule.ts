'use server';

import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WeeklyClass {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  instructorName: string;
  capacity: number;
  bookingsCount: number;
  isFull: boolean;
}

export interface DaySchedule {
  date: Date;
  dayName: string; // "Segunda-feira", "Terça-feira"...
  dayNumber: string; // "25"
  classes: WeeklyClass[];
}

export async function getWeeklySchedule(referenceDate: Date = new Date()) {
  try {
    // Definir início e fim da semana (Domingo a Sábado)
    const start = startOfWeek(referenceDate, { weekStartsOn: 0 }); // 0 = Domingo
    const end = endOfWeek(referenceDate, { weekStartsOn: 0 });

    // Buscar aulas no intervalo
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
              where: { status: { not: 'CANCELED' } }
            } 
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Estruturar retorno por dia da semana (7 dias)
    const schedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(start, i);
      const dayClasses = classes.filter(c => 
        format(c.startTime, 'yyyy-MM-dd') === format(currentDay, 'yyyy-MM-dd')
      );

      schedule.push({
        date: currentDay,
        dayName: format(currentDay, 'EEEE', { locale: ptBR }),
        dayNumber: format(currentDay, 'dd', { locale: ptBR }),
        classes: dayClasses.map(c => ({
          id: c.id,
          name: c.name,
          startTime: c.startTime,
          endTime: c.endTime,
          instructorName: c.instructor.name || 'Instrutor',
          capacity: c.capacity,
          bookingsCount: c._count.bookings,
          isFull: c._count.bookings >= c.capacity,
        })),
      });
    }

    return { schedule, startDate: start, endDate: end };

  } catch (error) {
    console.error('Erro ao buscar grade semanal:', error);
    return { error: 'Erro ao carregar a grade de horários.' };
  }
}
