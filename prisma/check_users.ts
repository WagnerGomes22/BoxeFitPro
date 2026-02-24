
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStatus() {
  const users = await prisma.user.findMany({
    include: {
      subscriptions: true
    }
  });
  
  console.log("Users found:", JSON.stringify(users, null, 2));
}

checkStatus()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
