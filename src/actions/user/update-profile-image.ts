"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(imageUrl: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath("/dashboard/perfil");
    revalidatePath("/dashboard", "layout");
    return { success: true, message: "Foto de perfil atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar imagem:", error);
    return { success: false, message: "Erro ao atualizar a foto de perfil." };
  }
}
