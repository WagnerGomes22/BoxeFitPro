"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUserDirectly(formData: FormData) {
  const session = await auth();

  // Apenas ADMIN pode criar usuários diretamente
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, message: "Acesso negado" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as "ADMIN" | "INSTRUCTOR" | "STUDENT";

  if (!name || !email || !role) {
    return { success: false, message: "Preencha todos os campos" };
  }

  // Verifica se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, message: "Este email já está cadastrado." };
  }

  try {
    // Senha padrão hashada
    const hashedPassword = await hash("123456", 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        // Opcional: Marcar como email verificado já que foi criado por admin
        emailVerified: new Date(),
      },
    });

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Usuário criado com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, message: "Erro ao criar usuário no banco de dados." };
  }
}
