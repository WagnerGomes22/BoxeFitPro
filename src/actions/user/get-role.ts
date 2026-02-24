"use server";

import { prisma } from "@/lib/prisma";

export async function getUserRole(email: string) {
  try {
    if (!email) return null;

    console.log(`[SERVER] Buscando role para: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    
    console.log(`[SERVER] Role encontrada para ${email}: ${user?.role}`);

    return user?.role;
  } catch (error) {
    console.error("Erro ao buscar role:", error);
    return null;
  }
}
