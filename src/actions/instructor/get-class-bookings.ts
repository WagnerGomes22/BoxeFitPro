'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function getClassBookings(classId: string) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.id) {
      return { error: 'Usuário não autenticado.' };
    }

    // Verificar Role
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
      return { error: 'Permissão negada.' };
    }

    // Buscar dados da aula e bookings
    // Busca inicial apenas para dados da aula
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        instructor: {
          select: { name: true, id: true },
        },
      }
    });

    if (!classInfo) {
      return { error: 'Aula não encontrada.' };
    }

    // Validação de Propriedade da Aula
    if (userRole !== 'ADMIN') {
      if (classInfo.instructorId !== session.user.id) {
        return { error: 'Você só pode visualizar a lista de presença das suas próprias aulas.' };
      }
    }

    // Busca separada para os bookings
    const bookings = await prisma.booking.findMany({
      where: {
        classId: classId,
        status: {
          not: BookingStatus.CANCELED,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        attendanceMarkedBy: {
           select: { name: true }
        }
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Calcular contadores
    const totalBookings = bookings.length;
    const presentCount = bookings.filter(b => b.status === BookingStatus.ATTENDED).length;
    const noShowCount = bookings.filter(b => b.status === BookingStatus.NO_SHOW).length;
    
    // Regra de Tempo: Aula terminou há mais de 24h?
    const now = new Date();
    const classEndTime = new Date(classInfo.endTime);
    const hoursSinceEnd = (now.getTime() - classEndTime.getTime()) / (1000 * 60 * 60);
    const isAttendanceLocked = hoursSinceEnd > 24;

    return {
      classData: {
        id: classInfo.id,
        name: classInfo.name,
        startTime: classInfo.startTime,
        endTime: classInfo.endTime,
        instructorName: classInfo.instructor.name,
        isAttendanceLocked,
      },
      bookings: bookings.map(booking => ({
        id: booking.id,
        userId: booking.user.id,
        name: booking.user.name || 'Sem nome',
        email: booking.user.email,
        image: booking.user.image,
        status: booking.status,
        attendedAt: booking.attendedAt,
        markedByName: booking.attendanceMarkedBy?.name
      })),
      stats: {
        total: totalBookings,
        present: presentCount,
        noShow: noShowCount,
      }
    };

  } catch (error) {
    console.error('Erro ao buscar lista de presença:', error);
    return { error: 'Erro ao carregar dados.' };
  }
}
