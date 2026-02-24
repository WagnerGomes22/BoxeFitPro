
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      addresses: {
        where: { active: true },
        take: 1,
      },
      subscriptions: {
        where: { 
          status: { in: ["ACTIVE", "PENDING"] } 
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      emergencyContacts: {
        take: 1,
      }
    },
  });

  return user;
}
