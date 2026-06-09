import { prisma } from './api/utils/prisma.js';

async function seedAttendance() {
  const today = '2026-06-09';
  
  const checkIns = [
    { searchStr: 'Sasindu', time: '2026-06-09T03:45:00.000Z' }, // 9:15 SLT
    { searchStr: 'dinusha', time: '2026-06-09T04:30:00.000Z' }, // 10:00 SLT
    { searchStr: 'Janani', time: '2026-06-09T04:00:00.000Z' }, // 9:30 SLT
    { searchStr: 'Nisal', time: '2026-06-09T04:00:00.000Z' } // 9:30 SLT
  ];

  for (const ci of checkIns) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { contains: ci.searchStr } },
          { name: { contains: ci.searchStr } }
        ]
      }
    });

    if (user) {
      // Check if already checked in
      const existing = await prisma.attendanceRecord.findFirst({
        where: { userId: user.uid, date: today }
      });

      if (!existing) {
        await prisma.attendanceRecord.create({
          data: {
            userId: user.uid,
            userName: user.name,
            date: today,
            checkIn: ci.time,
            status: 'Present'
          }
        });
        console.log('Checked in', user.name, 'at', ci.time);
      } else {
        await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: { checkIn: ci.time }
        });
        console.log('Updated check-in for', user.name, 'at', ci.time);
      }
    } else {
      console.log('Could not find user matching', ci.searchStr);
    }
  }
}

seedAttendance().catch(console.error);
