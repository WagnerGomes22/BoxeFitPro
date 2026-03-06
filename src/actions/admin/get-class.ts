'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getClass(classId: string) {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    return null;
  }

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      instructor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return classData;
}
