"use server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getInstructors() {
  return await prisma.user.findMany({
    where: { 
        OR: [
            { role: Role.INSTRUCTOR },
            { role: Role.ADMIN } // Admin também pode dar aula
        ]
    },
    select: { id: true, name: true, email: true }
  });
}
