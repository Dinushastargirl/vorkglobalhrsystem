import { prisma } from './api/utils/prisma.js';

async function seed() {
  const users = await prisma.user.findMany();
  const dinusha = users.find(u => u.username === 'dinusha');
  const nisal = users.find(u => u.username === 'nisal');
  const janani = users.find(u => u.username === 'janani');
  const jayaminda = users.find(u => u.username === 'jayaminda');
  const superadmin = users.find(u => u.username === 'superadmin');

  const superUid = superadmin?.uid || 'superadmin-id';

  const nextFriday = new Date();
  nextFriday.setDate(nextFriday.getDate() + (5 - nextFriday.getDay() + 7) % 7 + 7);
  
  const thisFriday = new Date();
  thisFriday.setDate(thisFriday.getDate() + (5 - thisFriday.getDay() + 7) % 7);
  if (thisFriday < new Date()) {
    thisFriday.setDate(thisFriday.getDate() + 7);
  }

  const thisWednesday = new Date();
  thisWednesday.setDate(thisWednesday.getDate() + (3 - thisWednesday.getDay() + 7) % 7);
  if (thisWednesday < new Date()) {
    thisWednesday.setDate(thisWednesday.getDate() + 7);
  }

  const fThisFriday = thisFriday.toISOString().split('T')[0];
  const fNextFriday = nextFriday.toISOString().split('T')[0];
  const fThisWednesday = thisWednesday.toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const tasksToCreate = [];

  if (dinusha) {
    tasksToCreate.push({
      title: 'AI Business Insights Platform',
      description: 'Research and design an AI-powered Business Insights Platform for SMEs. Define key features such as sales analytics, customer behavior tracking, inventory insights, predictive reporting, pricing strategy, target industries, and prepare the complete demo presentation with business value explanation.',
      assignedTo: dinusha.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fThisFriday,
      estimatedHours: 20,
      progressPercent: 0,
      category: 'Design',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – Business Growth & Acquisition Strategy',
      description: 'Research and develop a complete growth and acquisition strategy for Pickher. Define how to acquire drivers and passengers, design referral systems, identify marketing channels, propose partnerships, and outline operational workflows and monetization strategy.',
      assignedTo: dinusha.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fThisFriday,
      estimatedHours: 20,
      progressPercent: 0,
      category: 'Research',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (janani) {
    tasksToCreate.push({
      title: 'Queue Management System',
      description: 'Design and develop a Queue Management System for clinics, pharmacies, banks, service centers, and government offices. Define token flow, waiting system logic, display system, admin control, and prepare full demo presentation.',
      assignedTo: janani.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fThisFriday,
      estimatedHours: 25,
      progressPercent: 0,
      category: 'Development',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – Content Strategy',
      description: 'Create a full content strategy for Pickher including onboarding content, driver communication content, passenger communication content, launch campaign plan, social media content plan, and user engagement messaging.',
      assignedTo: janani.uid,
      assignedBy: superUid,
      priority: 'Medium',
      status: 'Not Started',
      startDate: today,
      deadline: fThisFriday,
      estimatedHours: 15,
      progressPercent: 0,
      category: 'Marketing',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (nisal) {
    tasksToCreate.push({
      title: 'POS System',
      description: 'Design and develop a Point of Sale (POS) System including product management, billing, receipt generation, inventory tracking, sales reports, and demo scenarios for retail and pharmacy use cases.',
      assignedTo: nisal.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fThisFriday,
      estimatedHours: 25,
      progressPercent: 0,
      category: 'Development',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – Passenger Application & Dashboard',
      description: 'Develop the Pickher Passenger Application and Admin Dashboard including user registration, ride booking flow, trip tracking, booking history, and dashboard analytics.',
      assignedTo: nisal.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fNextFriday,
      estimatedHours: 40,
      progressPercent: 0,
      category: 'Development',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (jayaminda) {
    tasksToCreate.push({
      title: 'CRM & Lead Management System',
      description: 'Design and develop a CRM & Lead Management System including lead tracking, customer management, sales pipeline, follow-ups, task tracking, and reporting dashboard. Prepare architecture, database design, UI flow, and demo scenario.',
      assignedTo: jayaminda.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fThisFriday,
      estimatedHours: 25,
      progressPercent: 0,
      category: 'Development',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – UI/UX + Driver Application (Design)',
      description: 'Review and refine Pickher UI/UX designs, improve user flows, and finalize design system.',
      assignedTo: jayaminda.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fThisWednesday,
      estimatedHours: 15,
      progressPercent: 0,
      category: 'Design',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    tasksToCreate.push({
      title: 'Pickher – UI/UX + Driver Application (Dev)',
      description: 'Develop the Pickher Driver Application including driver onboarding, ride acceptance, trip management, earnings tracking, and profile management.',
      assignedTo: jayaminda.uid,
      assignedBy: superUid,
      priority: 'High',
      status: 'Not Started',
      startDate: today,
      deadline: fNextFriday,
      estimatedHours: 35,
      progressPercent: 0,
      category: 'Development',
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  console.log(`Inserting ${tasksToCreate.length} tasks...`);
  for (const t of tasksToCreate) {
    await prisma.task.create({ data: t });
  }
  console.log('Done!');
}

seed().catch(console.error);
