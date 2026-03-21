import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const getArgValue = (key: string) => {
  const prefix = `--${key}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  if (raw) return raw.slice(prefix.length);
  const index = process.argv.indexOf(`--${key}`);
  if (index !== -1) return process.argv[index + 1];
  return undefined;
};

const generatePassword = () => randomBytes(16).toString("base64url");

async function main() {
  console.log("🔐 Iniciando reset de senha do admin...");

  const emailArg = getArgValue("email")?.toLowerCase();
  const passwordArg = getArgValue("password");
  const targetEmail = emailArg || process.env.ADMIN_EMAIL?.toLowerCase();

  let adminUser;
  if (targetEmail) {
    adminUser = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!adminUser) {
      console.error("Admin não encontrado para o e-mail informado.");
      return;
    }
    if (adminUser.role !== Role.ADMIN) {
      console.error("O usuário informado não possui role ADMIN.");
      return;
    }
  } else {
    adminUser = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
    });
    if (!adminUser) {
      console.error("Nenhum usuário ADMIN encontrado.");
      return;
    }
  }

  const newPassword = passwordArg || generatePassword();

  if (newPassword.length < 6) {
    console.error("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { email: adminUser.email },
    }),
  ]);

  console.log("✅ Senha atualizada com sucesso.");
  console.log(`Admin: ${adminUser.email}`);
  if (!passwordArg) {
    console.log(`Nova senha (guarde em local seguro): ${newPassword}`);
  } else {
    console.log("Senha definida a partir do parâmetro informado.");
  }
}

main()
  .catch((error) => {
    console.error("❌ Erro ao resetar senha do admin:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
