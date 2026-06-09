import { prisma } from './api/utils/prisma.js';

async function perfectSeed() {
  console.log('Clearing all existing tasks...');
  await prisma.task.deleteMany();

  const users = await prisma.user.findMany();
  const dinusha = users.find(u => u.username === 'dinusha');
  const nisal = users.find(u => u.username === 'nisal');
  const janani = users.find(u => u.username === 'janani');
  const jayaminda = users.find(u => u.username === 'jayaminda');

  const superUid = dinusha?.uid || '';
  const today = new Date().toISOString().split('T')[0];

  const getNextFriday = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((5 + 7 - d.getDay()) % 7));
    if (d.getDate() === new Date().getDate()) d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const fThisFriday = getNextFriday();
  const dNextFriday = new Date(new Date(fThisFriday).getTime() + 7 * 24 * 60 * 60 * 1000);
  const fNextFriday = dNextFriday.toISOString().split('T')[0];
  const fWednesday = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const tasksToCreate: any[] = [];

  if (dinusha) {
    tasksToCreate.push({
      title: 'AI Business Insights Platform',
      description: 'Research and design an AI-powered Business Insights Platform for SMEs. Define key features such as sales analytics, customer behavior tracking, inventory insights, predictive reporting, pricing strategy, target industries, and prepare the complete demo presentation with business value explanation.',
      assignedTo: dinusha.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fThisFriday, category: 'Research',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – Business Growth & Acquisition Strategy',
      description: 'Research and develop a complete growth and acquisition strategy for Pickher. Define how to acquire drivers and passengers, design referral systems, identify marketing channels, propose partnerships, and outline operational workflows and monetization strategy.',
      assignedTo: dinusha.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fThisFriday, category: 'Strategy',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
  }

  if (janani) {
    tasksToCreate.push({
      title: 'Queue Management System',
      description: 'Design and develop a Queue Management System for clinics, pharmacies, banks, service centers, and government offices. Define token flow, waiting system logic, display system, admin control, and prepare full demo presentation.',
      assignedTo: janani.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fThisFriday, category: 'Development',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – Content Strategy',
      description: 'Create a full content strategy for Pickher including onboarding content, driver communication content, passenger communication content, launch campaign plan, social media content plan, and user engagement messaging.',
      assignedTo: janani.uid, assignedBy: superUid, priority: 'Medium', status: 'Not Started',
      startDate: today, deadline: fThisFriday, category: 'Content',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
  }

  if (nisal) {
    tasksToCreate.push({
      title: 'POS System',
      description: 'Design and develop a Point of Sale (POS) System including product management, billing, receipt generation, inventory tracking, sales reports, and demo scenarios for retail and pharmacy use cases.',
      assignedTo: nisal.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fThisFriday, category: 'Development',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – Passenger Application & Dashboard',
      description: 'Develop the Pickher Passenger Application and Admin Dashboard including user registration, ride booking flow, trip tracking, booking history, and dashboard analytics.',
      assignedTo: nisal.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fNextFriday, category: 'Development',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
  }

  if (jayaminda) {
    tasksToCreate.push({
      title: 'CRM & Lead Management System',
      description: 'Design and develop a CRM & Lead Management System including lead tracking, customer management, sales pipeline, follow-ups, task tracking, and reporting dashboard. Prepare architecture, database design, UI flow, and demo scenario.',
      assignedTo: jayaminda.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fThisFriday, category: 'Development',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – UI/UX + Driver Application (Design Review)',
      description: 'Review and refine Pickher UI/UX designs, improve user flows, and finalize design system.',
      assignedTo: jayaminda.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fWednesday, category: 'Design',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – UI/UX + Driver Application (Development)',
      description: 'Develop the Pickher Driver Application including driver onboarding, ride acceptance, trip management, earnings tracking, and profile management.',
      assignedTo: jayaminda.uid, assignedBy: superUid, priority: 'High', status: 'Not Started',
      startDate: today, deadline: fNextFriday, category: 'Development',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
  }

  for (const t of tasksToCreate) {
    await prisma.task.create({ data: t });
  }

  console.log('Perfect seed complete!');
}

perfectSeed().catch(console.error);
