import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@boxepass.com";
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
        role: Role.ADMIN, // Garante que se já existir, vira admin
        password: password
    },
    create: {
      email,
      name: "Administrador Sistema",
      password,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Usuário Admin configurado com sucesso!`);
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Senha: admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
