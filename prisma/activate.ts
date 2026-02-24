
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function activateSubscription() {
  const userEmail = "igor@gmail.com";
  
  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!user) {
    console.log("Usuário não encontrado.");
    return;
  }

  // Pegar a última assinatura
  const lastSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  if (lastSubscription) {
    await prisma.subscription.update({
        where: { id: lastSubscription.id },
        data: { status: "ACTIVE" }
    });
    console.log(`Assinatura ${lastSubscription.id} ativada com sucesso!`);
  } else {
    console.log("Nenhuma assinatura encontrada.");
  }
}

activateSubscription()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
