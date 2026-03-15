'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateAttendance(
  bookingId: string, 
  status: BookingStatus
) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.id) {
      return { error: 'Usuário não autenticado.' };
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR') {
      return { error: 'Permissão negada.' };
    }

    // Buscar o booking para validações
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        class: true
      }
    });

    if (!booking) {
      return { error: 'Agendamento não encontrado.' };
    }

    // Validação de Propriedade da Aula
    if (userRole !== 'ADMIN') {
      if (booking.class.instructorId !== userId) {
        return { error: 'Você só pode gerenciar a presença das suas próprias aulas.' };
      }
    }

    // Regra de Tempo: Aula terminou há mais de 24h?
    const now = new Date();
    const classEndTime = new Date(booking.class.endTime);
    const hoursSinceEnd = (now.getTime() - classEndTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceEnd > 24) {
      return { error: 'Período de chamada encerrado (aula finalizada há mais de 24h).' };
    }

    // Preparar dados de atualização
    const updateData: Prisma.BookingUpdateInput = {
      status,
    };

    // Se estiver marcando presença ou falta (finalizando), preenche auditoria
    if (status === BookingStatus.ATTENDED || status === BookingStatus.NO_SHOW) {
      updateData.attendedAt = new Date();
      updateData.attendanceMarkedById = userId;
    } else {
      // Se estiver resetando para CONFIRMED, limpa auditoria
      updateData.attendedAt = null;
      updateData.attendanceMarkedById = null;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    revalidatePath(`/admin/aulas/${booking.classId}/presenca`);
    revalidatePath(`/admin/aulas`); // Para atualizar contadores na lista geral se houver

    return { success: 'Presença atualizada com sucesso.' };

  } catch (error) {
    console.error('Erro ao atualizar presença:', error);
    return { error: 'Erro ao atualizar presença.' };
  }
}
