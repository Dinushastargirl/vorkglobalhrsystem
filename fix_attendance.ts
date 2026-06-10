import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAttendance() {
  // Build ISO timestamp for 10:00 AM Sri Lanka time (UTC+5:30 → 04:30 UTC)
  const today = new Date().toISOString().split('T')[0]; // e.g. 2026-06-10
  const checkInISO = `${today}T04:30:00.000Z`; // 10:00 AM Sri Lanka = 04:30 UTC

  console.log(`Setting check-in to: ${checkInISO} (10:00 AM SL time)`);

  try {
    // 1. Fix Jayaminda's check-in
    const jayamindaUser = await prisma.user.findFirst({ where: { username: 'jayaminda' } });
    if (jayamindaUser) {
      const jayRecord = await prisma.attendanceRecord.findFirst({
        where: { userId: jayamindaUser.uid, date: today }
      });
      if (jayRecord) {
        await prisma.attendanceRecord.update({
          where: { id: jayRecord.id },
          data: { checkIn: checkInISO, isLate: false }
        });
        console.log('✅ Fixed Jayaminda check-in to 10:00 AM ISO');
      } else {
        await prisma.attendanceRecord.create({
          data: {
            userId: jayamindaUser.uid,
            userName: jayamindaUser.name,
            date: today,
            checkIn: checkInISO,
            isLate: false,
            status: 'Working'
          }
        });
        console.log('✅ Created Jayaminda check-in at 10:00 AM ISO');
      }
    } else {
      console.log('❌ Jayaminda user not found');
    }

    // 2. Fix/Create Dinusha's check-in
    const dinushaUser = await prisma.user.findFirst({ where: { username: 'dinusha' } });
    if (dinushaUser) {
      const dinushaRecord = await prisma.attendanceRecord.findFirst({
        where: { userId: dinushaUser.uid, date: today }
      });
      if (dinushaRecord) {
        await prisma.attendanceRecord.update({
          where: { id: dinushaRecord.id },
          data: { checkIn: checkInISO, isLate: false }
        });
        console.log('✅ Fixed Dinusha check-in to 10:00 AM ISO');
      } else {
        await prisma.attendanceRecord.create({
          data: {
            userId: dinushaUser.uid,
            userName: dinushaUser.name,
            date: today,
            checkIn: checkInISO,
            isLate: false,
            status: 'Working'
          }
        });
        console.log('✅ Created Dinusha check-in at 10:00 AM ISO');
      }

      // Also fix Dinusha's name back if it was changed to "Updated"
      if (dinushaUser.name.includes('Updated')) {
        await prisma.user.update({
          where: { uid: dinushaUser.uid },
          data: { name: 'Dinusha Pushparajah' }
        });
        console.log('✅ Fixed Dinusha name back to Dinusha Pushparajah');
      }
    } else {
      console.log('❌ Dinusha user not found');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixAttendance();
