"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getUsers() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    // Apenas ADMIN pode ver usuários
    // throw new Error("Acesso negado");
    // Ou retornar vazio
    return [];
  }

  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  return users;
}
