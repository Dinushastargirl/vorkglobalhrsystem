import { prisma } from './api/utils/prisma.js';

function getWeekdays(startDate: Date, endDate: Date) {
  const dates = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Skip Sunday(0) and Saturday(6)
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

async function seed() {
  const users = await prisma.user.findMany();
  const dinusha = users.find(u => u.username === 'dinusha');
  const nisal = users.find(u => u.username === 'nisal');
  const janani = users.find(u => u.username === 'janani');
  const jayaminda = users.find(u => u.username === 'jayaminda');

  const recordsToInsert = [];

  // Dinusha: Feb 1 to June 8
  if (dinusha) {
    const dates = getWeekdays(new Date('2026-02-01'), new Date('2026-06-08'));
    for (const d of dates) {
      recordsToInsert.push({
        userId: dinusha.uid,
        userName: dinusha.name,
        date: formatDate(d),
        checkIn: `${formatDate(d)}T09:30:00.000Z`,
        checkOut: `${formatDate(d)}T17:30:00.000Z`
      });
    }
    // June 9
    recordsToInsert.push({
        userId: dinusha.uid,
        userName: dinusha.name,
        date: '2026-06-09',
        checkIn: `2026-06-09T10:00:00.000Z`,
        checkOut: null
    });
  }

  // Nisal & Janani: May 1 to May 31
  const mayDates = getWeekdays(new Date('2026-05-01'), new Date('2026-05-31'));
  for (const emp of [nisal, janani]) {
    if (emp) {
      for (const d of mayDates) {
        recordsToInsert.push({
          userId: emp.uid,
          userName: emp.name,
          date: formatDate(d),
          checkIn: `${formatDate(d)}T09:30:00.000Z`,
          checkOut: `${formatDate(d)}T17:30:00.000Z`
        });
      }
      // June 9
      recordsToInsert.push({
          userId: emp.uid,
          userName: emp.name,
          date: '2026-06-09',
          checkIn: `2026-06-09T09:30:00.000Z`,
          checkOut: null
      });
    }
  }

  // Jayaminda: April 1 to May 31
  if (jayaminda) {
    const aprilMayDates = getWeekdays(new Date('2026-04-01'), new Date('2026-05-31'));
    for (const d of aprilMayDates) {
      recordsToInsert.push({
        userId: jayaminda.uid,
        userName: jayaminda.name,
        date: formatDate(d),
        checkIn: `${formatDate(d)}T09:30:00.000Z`,
        checkOut: `${formatDate(d)}T17:30:00.000Z`
      });
    }
    // June 9
    recordsToInsert.push({
        userId: jayaminda.uid,
        userName: jayaminda.name,
        date: '2026-06-09',
        checkIn: `2026-06-09T09:15:00.000Z`,
        checkOut: null
    });
  }

  // Delete existing records to avoid duplicates for June 9 (from my earlier seed)
  await prisma.attendanceRecord.deleteMany();

  console.log(`Inserting ${recordsToInsert.length} records...`);
  
  for(const r of recordsToInsert) {
      await prisma.attendanceRecord.create({ data: r });
  }

  console.log('Seed completed!');
}

seed().catch(console.error);
