"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, message: "Acesso negado" };
  }

  // Impede que o próprio admin remova seu acesso de admin
  if (userId === session.user.id && newRole !== "ADMIN") {
    return { success: false, message: "Você não pode remover seu próprio acesso de administrador." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Permissão atualizada com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar role:", error);
    return { success: false, message: "Erro ao atualizar permissão" };
  }
}
