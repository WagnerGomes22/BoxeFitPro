
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Iniciando limpeza do banco de dados...");
  const fullClean = process.env.FULL_CLEAN === "true";

  try {
    console.log("Removendo assinaturas...");
    await prisma.subscription.deleteMany({});

    console.log("Removendo sparring matches...");
    await prisma.sparringMatch.deleteMany({});

    console.log("Removendo sparring requests...");
    await prisma.sparringRequest.deleteMany({});

    console.log("Removendo sparring profiles...");
    await prisma.sparringProfile.deleteMany({});

    console.log("Removendo agendamentos...");
    await prisma.booking.deleteMany({});

    console.log("Removendo aulas...");
    await prisma.class.deleteMany({});

    console.log("Removendo contatos de emergência...");
    await prisma.emergencyContact.deleteMany({});

    console.log("Removendo endereços...");
    await prisma.address.deleteMany({});

    console.log("Removendo tokens de reset de senha...");
    await prisma.passwordResetToken.deleteMany({});

    console.log("Removendo contas vinculadas e sessões...");
    if (fullClean) {
      await prisma.account.deleteMany({});
      await prisma.session.deleteMany({});
      console.log("Removendo todos os usuários...");
      await prisma.user.deleteMany({});
    } else {
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      const adminFromEmail = adminEmail
        ? await prisma.user.findUnique({ where: { email: adminEmail } })
        : null;

      const adminUser =
        adminFromEmail ||
        (await prisma.user.findFirst({
          where: { role: Role.ADMIN },
          orderBy: { createdAt: "asc" },
        }));

      if (!adminUser) {
        console.error("Nenhum usuário ADMIN encontrado. Abortando limpeza.");
        return;
      }

      await prisma.account.deleteMany({ where: { userId: { not: adminUser.id } } });
      await prisma.session.deleteMany({ where: { userId: { not: adminUser.id } } });

      console.log("Removendo usuários (mantendo apenas o admin)...");
      await prisma.user.deleteMany({ where: { id: { not: adminUser.id } } });
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: Role.ADMIN },
      });
    }

    console.log("✅ Limpeza concluída com sucesso!");

  } catch (error) {
    console.error("❌ Erro ao limpar o banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
