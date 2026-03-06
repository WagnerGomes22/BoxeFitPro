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
    // Verificar se a aula existe e pertence ao instrutor (se não for admin)
    const classToDelete = await prisma.class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });

    if (!classToDelete) {
      return { success: false, message: "Aula não encontrada." };
    }

    if (session.user.role !== "ADMIN" && classToDelete.instructorId !== session.user.id) {
      return { success: false, message: "Você só pode cancelar suas próprias aulas." };
    }

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
