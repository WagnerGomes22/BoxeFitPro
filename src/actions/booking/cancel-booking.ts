"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { differenceInHours } from "date-fns";
import { auth } from "@/auth";

export async function cancelBooking(bookingId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Você precisa estar logado." };
  }

  const userId = session.user.id;

  try {
    // 1. Buscar o agendamento
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { class: true },
    });

    if (!booking) {
      return { success: false, message: "Agendamento não encontrado." };
    }

    if (booking.userId !== userId) {
      return { success: false, message: "Você não tem permissão para cancelar este agendamento." };
    }

    // 2. Verificar regra de 2 horas
    const now = new Date();
    const hoursUntilClass = differenceInHours(booking.class.startTime, now);

    if (hoursUntilClass < 2) {
      return { 
        success: false, 
        message: "O cancelamento só é permitido com até 2 horas de antecedência." 
      };
    }

    // 3. Atualizar status para CANCELED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELED" },
    });

    // 4. Revalidar dados
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agendar");

    return { success: true, message: "Aula cancelada com sucesso." };

  } catch (error) {
    console.error("Erro ao cancelar aula:", error);
    return { success: false, message: "Erro ao processar cancelamento." };
  }
}
