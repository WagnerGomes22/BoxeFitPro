'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateClass(classId: string, prevState: unknown, formData: FormData) {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    return { success: false, message: "Acesso negado." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const instructorId = formData.get("instructorId") as string;
  const date = formData.get("date") as string;
  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;
  const capacity = parseInt(formData.get("capacity") as string, 10);

  if (!name || !instructorId || !date || !startTimeStr || !endTimeStr || !capacity) {
    return { success: false, message: "Preencha todos os campos obrigatórios." };
  }

  // Validação de permissão (Instrutor só edita aula dele)
  if (session.user.role !== "ADMIN") {
     const existingClass = await prisma.class.findUnique({
        where: { id: classId },
        select: { instructorId: true }
     });
     
     if (!existingClass || existingClass.instructorId !== session.user.id) {
         return { success: false, message: "Você só pode editar suas próprias aulas." };
     }
  }

  const startDateTime = new Date(`${date}T${startTimeStr}:00`);
  const endDateTime = new Date(`${date}T${endTimeStr}:00`);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return { success: false, message: "Data ou hora inválida." };
  }

  if (startDateTime >= endDateTime) {
    return { success: false, message: "O horário de término deve ser após o início." };
  }

  try {
    await prisma.class.update({
      where: { id: classId },
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
    revalidatePath(`/admin/aulas/${classId}`);
    revalidatePath("/dashboard/agendar");
    
    return { success: true, message: "Aula atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);
    return { success: false, message: "Erro ao atualizar aula no banco de dados." };
  }
}
