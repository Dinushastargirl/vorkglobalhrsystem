import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:');
  users.forEach(u => console.log(`${u.name} - ${u.username} - ${u.uid} - ${u.email}`));

  const tasks = await prisma.task.findMany();
  console.log('\nTasks assignedTo:');
  tasks.forEach(t => console.log(`${t.title} -> ${t.assignedTo}`));
}

main().finally(() => prisma.$disconnect());
