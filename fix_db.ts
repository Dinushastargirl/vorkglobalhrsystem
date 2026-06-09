import { prisma } from './api/utils/prisma.js';

async function fixDB() {
  console.log('Fixing Janani name...');
  await prisma.user.updateMany({
    where: { username: 'janani' },
    data: { name: 'Sai Janani' }
  });
  
  // also update name in attendance logs just in case it's cached there
  await prisma.attendanceRecord.updateMany({
    where: { userName: 'Janani Rashmika' },
    data: { userName: 'Sai Janani' }
  });

  console.log('Fixing Historical Times...');
  // Since we inserted the wrong UTC time, let's just find and replace the time string in the DB.
  
  const records = await prisma.attendanceRecord.findMany();
  
  console.log(`Found ${records.length} records. Modifying checkIn/checkOut times...`);

  for(const r of records) {
    let newCheckIn = r.checkIn;
    let newCheckOut = r.checkOut;

    // We inserted `T09:30:00.000Z` and `T10:00:00.000Z` and `T09:15:00.000Z` for checkIn.
    // 09:30 SLT -> 04:00 UTC
    // 10:00 SLT -> 04:30 UTC
    // 09:15 SLT -> 03:45 UTC
    if (newCheckIn && newCheckIn.includes('T09:30:00.000Z')) newCheckIn = newCheckIn.replace('T09:30:00.000Z', 'T04:00:00.000Z');
    if (newCheckIn && newCheckIn.includes('T10:00:00.000Z')) newCheckIn = newCheckIn.replace('T10:00:00.000Z', 'T04:30:00.000Z');
    if (newCheckIn && newCheckIn.includes('T09:15:00.000Z')) newCheckIn = newCheckIn.replace('T09:15:00.000Z', 'T03:45:00.000Z');
    
    // We inserted `T17:30:00.000Z` for checkout.
    // 17:30 SLT -> 12:00 UTC
    if (newCheckOut && newCheckOut.includes('T17:30:00.000Z')) newCheckOut = newCheckOut.replace('T17:30:00.000Z', 'T12:00:00.000Z');

    if(newCheckIn !== r.checkIn || newCheckOut !== r.checkOut) {
       await prisma.attendanceRecord.update({
          where: { id: r.id },
          data: { checkIn: newCheckIn, checkOut: newCheckOut }
       });
    }
  }

  console.log('DB Fixed successfully!');
}

fixDB().catch(console.error);
