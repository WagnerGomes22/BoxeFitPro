"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createClass(prevState: unknown, formData: FormData) {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    return { success: false, message: "Acesso negado." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const instructorId = formData.get("instructorId") as string;
  const date = formData.get("date") as string; // YYYY-MM-DD
  const startTimeStr = formData.get("startTime") as string; // HH:mm
  const endTimeStr = formData.get("endTime") as string; // HH:mm
  const capacity = parseInt(formData.get("capacity") as string, 10);

  // Validação básica
  if (!name || !instructorId || !date || !startTimeStr || !endTimeStr || !capacity) {
    return { success: false, message: "Preencha todos os campos obrigatórios." };
  }

  // Construir datas (assumindo timezone local ou UTC - cuidado aqui em produção)
  // Para simplificar, vou assumir que o servidor roda em UTC ou que o frontend manda UTC.
  // Mas como é input type="date" e "time", o navegador manda strings locais.
  // Vou construir a data combinando strings.
  const startDateTime = new Date(`${date}T${startTimeStr}:00`);
  const endDateTime = new Date(`${date}T${endTimeStr}:00`);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return { success: false, message: "Data ou hora inválida." };
  }

  if (startDateTime >= endDateTime) {
    return { success: false, message: "O horário de término deve ser após o início." };
  }

  try {
    await prisma.class.create({
      data: {
        name,
        description,
        instructorId,
        startTime: startDateTime,
        endTime: endDateTime,
        capacity,
      },
    });

    revalidatePath("/admin/aulas");
    revalidatePath("/dashboard/agendar"); // Atualizar calendário dos alunos
    return { success: true, message: "Aula criada com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar aula:", error);
    return { success: false, message: "Erro ao salvar aula no banco de dados." };
  }
}
