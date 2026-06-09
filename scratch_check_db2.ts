import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const attendance = await prisma.attendanceRecord.findMany();
  console.log('Attendance Records:');
  const counts: Record<string, number> = {};
  attendance.forEach(a => {
    counts[a.userId] = (counts[a.userId] || 0) + 1;
  });
  console.log(counts);
  console.log('Sample Attendance:', attendance.slice(0, 5));

  const tasks = await prisma.task.findMany();
  const taskCounts: Record<string, number> = {};
  tasks.forEach(t => {
    taskCounts[t.assignedTo] = (taskCounts[t.assignedTo] || 0) + 1;
  });
  console.log('\nTasks counts by assignedTo:', taskCounts);

  const performance = await prisma.performanceRecord.findMany();
  const perfCounts: Record<string, number> = {};
  performance.forEach(p => {
    perfCounts[p.userId] = (perfCounts[p.userId] || 0) + 1;
  });
  console.log('\nPerformance counts by userId:', perfCounts);

  const users = await prisma.user.findMany();
  console.log('\nUsers:');
  users.forEach(u => console.log(`${u.name} (${u.username}): ${u.uid}`));
}

main().finally(() => prisma.$disconnect());
