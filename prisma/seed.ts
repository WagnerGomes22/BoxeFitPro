import { PrismaClient } from "@prisma/client";
import { addDays, setHours, setMinutes, startOfToday } from "date-fns";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed...");

  // 1. Criar ou Encontrar Professor
  const instructorEmail = "carlos.silva@boxefit.com";
  
  let instructor = await prisma.user.findUnique({
    where: { email: instructorEmail },
  });

  if (!instructor) {
    console.log("👤 Criando professor padrão...");
    instructor = await prisma.user.create({
      data: {
        name: "Carlos Silva",
        email: instructorEmail,
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        birthDate: new Date("1985-05-20"),
        role: "INSTRUCTOR",
      },
    });
  }

  // 2. Criar Usuário Aluno para Teste
  const studentEmail = "aluno@boxepass.com";
  const hashedPassword = await bcrypt.hash("123456", 10);

  let student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) {
    console.log("Criando aluno de teste (aluno@boxepass.com / 123456)...");
    student = await prisma.user.create({
      data: {
        name: "João Boxeador",
        email: studentEmail,
        password: hashedPassword,
        cpf: "111.222.333-44",
        phone: "(11) 98888-7777",
        birthDate: new Date("1995-01-01"),
        role: "STUDENT",
      },
    });
  } else {
    // Atualizar senha se já existir
    await prisma.user.update({
        where: { email: studentEmail },
        data: { password: hashedPassword }
    });
    console.log("Senha do aluno de teste atualizada.");
  }

  // 3. Limpar aulas futuras para evitar duplicidade no seed
  await prisma.class.deleteMany({
    where: {
      instructorId: instructor.id,
    },
  });
  console.log("🧹 Aulas antigas limpas.");

  // 4. Gerar Grade de Aulas (Boxe Apenas)
  const today = startOfToday();
  const classesToCreate = [];

  const classTypes = [
    { name: "Boxe Iniciante", duration: 60, description: "Fundamentos do boxe para quem está começando." },
    { name: "Boxe Técnico", duration: 90, description: "Foco em técnica, esquiva e movimentação." },
    { name: "Boxe Funcional", duration: 60, description: "Mistura de boxe com exercícios funcionais intensos." },
    { name: "Sparring (Boxe)", duration: 90, description: "Treino prático de combate (com proteção)." },
  ];

  // Gerar aulas para os próximos 30 dias
  for (let i = 0; i < 30; i++) {
    const currentDate = addDays(today, i);
    const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado

    // Pular Domingos (Academia fechada)
    if (dayOfWeek === 0) continue;

    // Horários de semana
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Manhã
      classesToCreate.push(createClassData(currentDate, 7, 0, classTypes[2], instructor.id)); // 07:00 Funcional
      classesToCreate.push(createClassData(currentDate, 8, 0, classTypes[0], instructor.id)); // 08:00 Iniciante
      
      // Noite
      classesToCreate.push(createClassData(currentDate, 18, 0, classTypes[0], instructor.id)); // 18:00 Iniciante
      classesToCreate.push(createClassData(currentDate, 19, 0, classTypes[1], instructor.id)); // 19:00 Técnico
      classesToCreate.push(createClassData(currentDate, 20, 0, classTypes[3], instructor.id)); // 20:00 Sparring
    } 
    // Sábados
    else if (dayOfWeek === 6) {
      classesToCreate.push(createClassData(currentDate, 9, 0, classTypes[2], instructor.id)); // 09:00 Funcional
      classesToCreate.push(createClassData(currentDate, 10, 30, classTypes[3], instructor.id)); // 10:30 Sparring
    }
  }

  // Inserir no banco
  for (const classData of classesToCreate) {
    await prisma.class.create({ data: classData });
  }

  console.log(`✅ ${classesToCreate.length} aulas de Boxe criadas com sucesso!`);
}

function createClassData(date: Date, hour: number, minute: number, type: any, instructorId: string) {
  const startTime = setMinutes(setHours(date, hour), minute);
  const endTime = setMinutes(startTime, startTime.getMinutes() + type.duration);

  return {
    name: type.name,
    description: type.description,
    startTime: startTime,
    endTime: endTime,
    capacity: 20,
    instructorId: instructorId,
  };
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
