
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Iniciando limpeza do banco de dados...");

  try {
    // 1. Limpar todas as inscrições (subscriptions)
    console.log("Removendo assinaturas...");
    await prisma.subscription.deleteMany({});

    // 2. Limpar todos os agendamentos (bookings)
    console.log("Removendo agendamentos...");
    await prisma.booking.deleteMany({});

    // 2.1 Limpar todas as aulas (classes) - ADICIONADO
    console.log("Removendo aulas...");
    await prisma.class.deleteMany({});

    // 3. Limpar contatos de emergência
    console.log("Removendo contatos de emergência...");
    await prisma.emergencyContact.deleteMany({});

    // 4. Limpar endereços
    console.log("Removendo endereços...");
    await prisma.address.deleteMany({});

    // 5. Limpar contas (NextAuth) e sessões se houver
    console.log("Removendo contas vinculadas e sessões...");
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});

    // 6. Limpar usuários (EXCETO O PROFESSOR E O ALUNO DE TESTE PADRÃO se quiser manter)
    // Se quiser apagar TUDO, basta remove o where.
    // Vou apagar tudo que NÃO seja o instrutor, para não quebrar as aulas.
    console.log("Removendo usuários (mantendo instrutor)...");
    
    // Primeiro identificamos o instrutor para não deletar
    const instructor = await prisma.user.findUnique({
        where: { email: "carlos.silva@boxefit.com" }
    });

    if (instructor) {
        await prisma.user.deleteMany({
            where: {
                id: {
                    not: instructor.id
                }
            }
        });
    } else {
        // Se não tem instrutor, deleta tudo
        await prisma.user.deleteMany({});
    }

    console.log("✅ Limpeza concluída com sucesso!");

  } catch (error) {
    console.error("❌ Erro ao limpar o banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
