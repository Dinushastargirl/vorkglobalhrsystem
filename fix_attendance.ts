import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAttendance() {
  const today = new Date().toISOString().split('T')[0]; // e.g. 2026-06-10

  try {
    // 1. Fix Jayaminda's check-in: update existing record to 10:00 AM
    const jayamindaUser = await prisma.user.findFirst({ where: { username: 'jayaminda' } });
    if (jayamindaUser) {
      const jayRecord = await prisma.attendanceRecord.findFirst({
        where: { userId: jayamindaUser.uid, date: today }
      });
      if (jayRecord) {
        await prisma.attendanceRecord.update({
          where: { id: jayRecord.id },
          data: { checkIn: '10:00 AM', isLate: false }
        });
        console.log('✅ Fixed Jayaminda check-in to 10:00 AM');
      } else {
        await prisma.attendanceRecord.create({
          data: {
            userId: jayamindaUser.uid,
            userName: jayamindaUser.name,
            date: today,
            checkIn: '10:00 AM',
            isLate: false,
            status: 'Working'
          }
        });
        console.log('✅ Created Jayaminda check-in at 10:00 AM');
      }
    } else {
      console.log('❌ Jayaminda user not found');
    }

    // 2. Add/fix Dinusha's check-in at 10:00 AM
    const dinushaUser = await prisma.user.findFirst({ where: { username: 'dinusha' } });
    if (dinushaUser) {
      const dinushaRecord = await prisma.attendanceRecord.findFirst({
        where: { userId: dinushaUser.uid, date: today }
      });
      if (dinushaRecord) {
        await prisma.attendanceRecord.update({
          where: { id: dinushaRecord.id },
          data: { checkIn: '10:00 AM', isLate: false }
        });
        console.log('✅ Updated Dinusha check-in to 10:00 AM');
      } else {
        await prisma.attendanceRecord.create({
          data: {
            userId: dinushaUser.uid,
            userName: dinushaUser.name,
            date: today,
            checkIn: '10:00 AM',
            isLate: false,
            status: 'Working'
          }
        });
        console.log('✅ Created Dinusha check-in at 10:00 AM');
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
