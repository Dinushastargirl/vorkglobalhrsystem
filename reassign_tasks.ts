import { prisma } from './api/utils/prisma.js';

async function reassign() {
  const users = await prisma.user.findMany();
  const dinusha = users.find(u => u.username === 'dinusha');
  const nisal = users.find(u => u.username === 'nisal');
  const janani = users.find(u => u.username === 'janani');
  const jayaminda = users.find(u => u.username === 'jayaminda');

  console.log('Reassigning tasks...');

  if (dinusha) {
    await prisma.task.updateMany({
      where: { title: { in: ['AI Business Insights Platform', 'Pickher – Business Growth & Acquisition Strategy'] } },
      data: { assignedTo: dinusha.uid }
    });
  }

  if (janani) {
    await prisma.task.updateMany({
      where: { title: { in: ['Queue Management System', 'Pickher – Content Strategy'] } },
      data: { assignedTo: janani.uid }
    });
  }

  if (nisal) {
    await prisma.task.updateMany({
      where: { title: { in: ['POS System', 'Pickher – Passenger Application & Dashboard'] } },
      data: { assignedTo: nisal.uid }
    });
  }

  if (jayaminda) {
    await prisma.task.updateMany({
      where: { title: { in: ['CRM & Lead Management System', 'Pickher – UI/UX + Driver Application (Design)', 'Pickher – UI/UX + Driver Application (Dev)'] } },
      data: { assignedTo: jayaminda.uid }
    });
  }

  console.log('Task reassignment complete!');
}

reassign().catch(console.error);
