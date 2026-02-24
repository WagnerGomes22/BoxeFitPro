"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function deleteClass(classId: string) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    return { success: false, message: "Acesso negado." };
  }

  try {
    // Verificar se tem bookings ativos?
    // O Prisma tem onDelete: Cascade nos Bookings? Sim, verifiquei antes.
    // Mas seria bom verificar se a aula já aconteceu (passado).
    // Para simplificar MVP: deleta tudo.

    await prisma.class.delete({
      where: { id: classId },
    });

    revalidatePath("/admin/aulas");
    revalidatePath("/dashboard/agendar");
    return { success: true, message: "Aula excluída com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir aula:", error);
    return { success: false, message: "Erro ao excluir aula." };
  }
}
