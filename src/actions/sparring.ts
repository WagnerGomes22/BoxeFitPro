"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SparringIntensity, SparringRequestStatus, SparringMatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// --- Profile Actions ---

export async function getSparringProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const profile = await prisma.sparringProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  return profile;
}

export async function upsertSparringProfile(data: {
  weight: number;
  height: number;
  age: number;
  objective: string;
  intensity: SparringIntensity;
  acceptedTerms: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  // Validação: Apenas alunos podem criar perfil de sparring
  if (session.user.role !== "STUDENT") {
     throw new Error("Apenas alunos podem participar de sparrings.");
  }

  // Verifica se o usuário já tem perfil
  const existing = await prisma.sparringProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Se já existe e está 'isReady', mantém. Se não, o padrão é false até instrutor aprovar?
  // Regra: Se o usuário edita dados sensíveis (peso/idade), talvez devesse resetar o isReady?
  // Por enquanto vamos manter o isReady existente ou false se novo.

  const profile = await prisma.sparringProfile.upsert({
    where: { userId: session.user.id },
    update: {
      weight: data.weight,
      height: data.height,
      age: data.age,
      objective: data.objective,
      intensity: data.intensity,
      acceptedTerms: data.acceptedTerms,
      // Não atualizamos isReady, notes ou instructorId aqui (papel do instrutor)
    },
    create: {
      userId: session.user.id,
      weight: data.weight,
      height: data.height,
      age: data.age,
      objective: data.objective,
      intensity: data.intensity,
      acceptedTerms: data.acceptedTerms,
      isReady: false, // Começa não apto
    },
  });

  revalidatePath("/dashboard/sparring");
  revalidatePath("/dashboard/sparring/perfil");
  return profile;
}

// --- Partner Search ---

export async function findSparringPartners(filters?: {
  minWeight?: number;
  maxWeight?: number;
  intensity?: SparringIntensity;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Busca usuários que:
  // 1. Têm perfil de sparring
  // 2. Estão marcados como isReady = true
  // 3. Não são o próprio usuário
  // 4. Aceitaram os termos

  const whereClause: any = {
    isReady: true,
    acceptedTerms: true,
    userId: { not: session.user.id },
  };

  if (filters?.minWeight || filters?.maxWeight) {
    whereClause.weight = {};
    if (filters.minWeight) whereClause.weight.gte = filters.minWeight;
    if (filters.maxWeight) whereClause.weight.lte = filters.maxWeight;
  }

  if (filters?.intensity) {
    whereClause.intensity = filters.intensity;
  }

  const partners = await prisma.sparringProfile.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return partners;
}

// --- Requests ---

export async function sendSparringRequest(targetId: string, scheduledDate: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verifica se já existe solicitação pendente ou aceita para mesma data/alvo?
  // Simplificação: permite criar, mas ideal seria evitar spam.

  const request = await prisma.sparringRequest.create({
    data: {
      requesterId: session.user.id,
      targetId,
      scheduledDate,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/sparring/solicitacoes");
  return request;
}

export async function getSparringRequests() {
  const session = await auth();
  if (!session?.user?.id) return { received: [], sent: [] };

  const received = await prisma.sparringRequest.findMany({
    where: { targetId: session.user.id, status: "PENDING" },
    include: { requester: { select: { id: true, name: true, image: true, sparringProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const sent = await prisma.sparringRequest.findMany({
    where: { requesterId: session.user.id },
    include: { target: { select: { id: true, name: true, image: true, sparringProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return { received, sent };
}

export async function respondSparringRequest(requestId: string, action: "ACCEPT" | "REJECT" | "CANCEL") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const request = await prisma.sparringRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");

  // Validação de permissão
  if (action === "CANCEL") {
    if (request.requesterId !== session.user.id) throw new Error("Not authorized to cancel");
    
    await prisma.sparringRequest.update({
      where: { id: requestId },
      data: { status: "CANCELED" },
    });
  } else {
    // ACCEPT ou REJECT só pelo target
    if (request.targetId !== session.user.id) throw new Error("Not authorized to respond");

    if (action === "REJECT") {
      await prisma.sparringRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });
    } else if (action === "ACCEPT") {
      // Transação: Atualiza request e cria Match
      await prisma.$transaction([
        prisma.sparringRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" },
        }),
        prisma.sparringMatch.create({
          data: {
            date: request.scheduledDate,
            studentAId: request.requesterId,
            studentBId: request.targetId,
            status: "SCHEDULED",
            // intensity inicial pode ser undefined ou copiada do request se houvesse
          },
        }),
      ]);
    }
  }

  revalidatePath("/dashboard/sparring");
  revalidatePath("/dashboard/sparring/solicitacoes");
  revalidatePath("/dashboard/sparring/agendados");
}

// --- Matches ---

export async function getMySparringMatches() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const matches = await prisma.sparringMatch.findMany({
    where: {
      OR: [
        { studentAId: session.user.id },
        { studentBId: session.user.id },
      ],
    },
    include: {
      studentA: { select: { id: true, name: true, image: true } },
      studentB: { select: { id: true, name: true, image: true } },
      instructor: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  return matches;
}
