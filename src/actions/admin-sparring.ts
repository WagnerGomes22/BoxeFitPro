"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SparringIntensity, SparringMatchStatus } from "@prisma/client";

// --- Admin Actions ---

export async function getAllSparringProfiles() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    throw new Error("Unauthorized");
  }

  return await prisma.sparringProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateSparringStatus(profileId: string, isReady: boolean) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    throw new Error("Unauthorized");
  }

  await prisma.sparringProfile.update({
    where: { id: profileId },
    data: {
      isReady,
      instructorId: session.user.id, // Registra quem aprovou/reprovou
    },
  });

  revalidatePath("/admin/sparring");
}

export async function createAdminSparringMatch(data: {
  date: Date;
  studentAId: string;
  studentBId: string;
  intensity?: SparringIntensity;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    throw new Error("Unauthorized");
  }

  if (data.studentAId === data.studentBId) {
    throw new Error("Não é possível criar um sparring com o mesmo aluno.");
  }

  await prisma.sparringMatch.create({
    data: {
      date: data.date,
      studentAId: data.studentAId,
      studentBId: data.studentBId,
      status: "SCHEDULED",
      intensity: data.intensity,
      notes: data.notes,
      instructorId: session.user.id,
    },
  });

  revalidatePath("/admin/sparring");
  revalidatePath("/dashboard/sparring/agendados"); // Atualiza para os alunos
}

export async function getAdminSparringMatches() {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      throw new Error("Unauthorized");
    }
  
    return await prisma.sparringMatch.findMany({
      include: {
        studentA: { select: { id: true, name: true, image: true } },
        studentB: { select: { id: true, name: true, image: true } },
        instructor: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
}

export async function updateMatchStatus(matchId: string, status: SparringMatchStatus, result?: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      throw new Error("Unauthorized");
    }
  
    await prisma.sparringMatch.update({
      where: { id: matchId },
      data: {
        status,
        result,
      },
    });
  
    revalidatePath("/admin/sparring");
}
