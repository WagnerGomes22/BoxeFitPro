import { PrismaClient, Role } from "@prisma/client";
import { addDays, setHours, setMinutes, startOfToday, isSameMonth } from "date-fns";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type ClassType = {
  name: string;
  duration: number;
  description: string;
};

async function main() {
  console.log("🌱 Iniciando o seed...");

  const seedPassword = process.env.SEED_DEFAULT_PASSWORD;
  if (!seedPassword) {
    throw new Error("SEED_DEFAULT_PASSWORD não configurado");
  }
  const hashedPassword = await bcrypt.hash(seedPassword, 10);

  await upsertUser({
    name: "Admin BoxeFit",
    email: "admin@boxefit.com",
    password: hashedPassword,
    cpf: "000.111.222-33",
    phone: "(11) 90000-0000",
    birthDate: new Date("1980-01-01"),
    role: Role.ADMIN,
  });

  const instructor = await upsertUser({
    name: "Carlos Silva",
    email: "carlos.silva@boxefit.com",
    password: hashedPassword,
    cpf: "123.456.789-00",
    phone: "(11) 99999-9999",
    birthDate: new Date("1985-05-20"),
    role: Role.INSTRUCTOR,
  });

  await upsertUser({
    name: "João Boxeador",
    email: "aluno@boxefit.com",
    password: hashedPassword,
    cpf: "111.222.333-44",
    phone: "(11) 98888-7777",
    birthDate: new Date("1995-01-01"),
    role: Role.STUDENT,
  });

  await upsertUser({
    name: "Maria Sparring",
    email: "maria@boxefit.com",
    password: hashedPassword,
    cpf: "222.333.444-55",
    phone: "(11) 97777-6666",
    birthDate: new Date("1998-06-15"),
    role: Role.STUDENT,
  });

  await prisma.class.deleteMany({
    where: {
      instructorId: instructor.id,
    },
  });
  console.log("🧹 Aulas antigas limpas.");

  const today = startOfToday();
  const classesToCreate = [];

  const classTypes: ClassType[] = [
    { name: "Boxe Iniciante", duration: 60, description: "Fundamentos do boxe para quem está começando." },
    { name: "Boxe Técnico", duration: 90, description: "Foco em técnica, esquiva e movimentação." },
    { name: "Boxe Funcional", duration: 60, description: "Mistura de boxe com exercícios funcionais intensos." },
    { name: "Sparring (Boxe)", duration: 90, description: "Treino prático de combate (com proteção)." },
  ];

  let currentDate = today;

  while (isSameMonth(currentDate, today)) {
    const dayOfWeek = currentDate.getDay();

    if (dayOfWeek === 0) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Manhã
      classesToCreate.push(createClassData(currentDate, 7, 0, classTypes[2], instructor.id)); // Boxe Funcional
      classesToCreate.push(createClassData(currentDate, 8, 0, classTypes[2], instructor.id)); // Boxe Funcional
      
      // Noite
      classesToCreate.push(createClassData(currentDate, 18, 0, classTypes[0], instructor.id)); // Boxe Iniciante
      classesToCreate.push(createClassData(currentDate, 19, 0, classTypes[1], instructor.id)); // Boxe Técnico
      classesToCreate.push(createClassData(currentDate, 20, 0, classTypes[3], instructor.id)); // Sparring
    } 
    else if (dayOfWeek === 6) {
      classesToCreate.push(createClassData(currentDate, 9, 0, classTypes[1], instructor.id)); // Boxe Técnico
      classesToCreate.push(createClassData(currentDate, 10, 30, classTypes[3], instructor.id)); // Sparring
    }

    currentDate = addDays(currentDate, 1);
  }

  for (const classData of classesToCreate) {
    await prisma.class.create({ data: classData });
  }

  console.log(`✅ ${classesToCreate.length} aulas de Boxe criadas com sucesso!`);
}

async function upsertUser(data: {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  birthDate: Date;
  role: Role;
}) {
  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      password: data.password,
      cpf: data.cpf,
      phone: data.phone,
      birthDate: data.birthDate,
      role: data.role,
    },
    create: data,
  });
  return user;
}

function createClassData(date: Date, hour: number, minute: number, type: ClassType, instructorId: string) {
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
