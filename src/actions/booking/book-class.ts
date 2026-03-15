"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export type BookingResult = {
  success: boolean;
  message: string;
};

export async function bookClass(classId: string): Promise<BookingResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Você precisa estar logado para agendar." };
  }

  const userId = session.user.id;

  try {
    // 0. Verificar Role (Bloqueio de Admin/Instructor)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') {
        return { success: false, message: "Administradores e Instrutores não podem agendar aulas." };
    }

    // 1. Buscar a aula e verificar capacidade
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
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
      },
    });

    if (!classData) {
      return { success: false, message: "Aula não encontrada." };
    }

    const isSparringClass = classData.name.toLowerCase().includes("sparring");

    if (isSparringClass) {
      const sparringProfile = await prisma.sparringProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!sparringProfile) {
        return {
          success: false,
          message: "Para participar de sparring, crie seu perfil na sessão de Sparring primeiro.",
        };
      }
    }

    // 2. Verificar se está cheia
    if (classData._count.bookings >= classData.capacity) {
      return { success: false, message: "Esta aula está lotada." };
    }

    // 3. Verificar se já agendou
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_classId: {
          userId: userId,
          classId: classId,
        },
      },
    });

    if (existingBooking) {
        // Se cancelado, permitir reagendar (opcional, aqui vou bloquear pra simplificar ou reativar)
        if (existingBooking.status === 'CANCELED') {
            await prisma.booking.update({
                where: { id: existingBooking.id },
                data: { status: 'CONFIRMED' }
            });
            revalidatePath("/dashboard/agendar");
            revalidatePath("/dashboard");
            return { success: true, message: "Agendamento reativado com sucesso!" };
        }
        return { success: false, message: "Você já está agendado nesta aula." };
    }

    // 4. Criar agendamento
    await prisma.booking.create({
      data: {
        userId: userId,
        classId: classId,
        status: "CONFIRMED",
      },
    });

    // 5. Revalidar caches para atualizar a UI imediatamente
    revalidatePath("/dashboard/agendar");
    revalidatePath("/dashboard");

    return { success: true, message: "Agendamento realizado com sucesso!" };

  } catch (error) {
    console.error("Erro ao agendar aula:", error);
    return { success: false, message: "Ocorreu um erro ao processar o agendamento." };
  }
}
