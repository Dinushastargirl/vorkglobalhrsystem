import { prisma } from './api/utils/prisma.js';

async function fixDuplicates() {
  console.log('Fixing user duplicates...');

  const users = await prisma.user.findMany();

  // Find all Sasindu users
  const sasindus = users.filter(u => u.name?.includes('Sasindu') || u.username?.includes('jayaminda') || u.email?.includes('msjayaminda'));
  console.log('Found Sasindus:', sasindus.length);

  if (sasindus.length > 0) {
    // Keep the most recently created one (likely the one the UI is using, 'emp-...')
    // OR keep the one that is currently logged in.
    // The easiest is to merge them into one!
    const target = sasindus.find(u => u.uid.startsWith('emp-')) || sasindus[0];
    
    // Update target email/username to be exactly what useAuth expects
    await prisma.user.update({
      where: { uid: target.uid },
      data: { email: 'msjayaminda@gmail.com', username: 'jayaminda', name: 'Sasindu Jayaminda Mohotti' }
    });

    for (const dup of sasindus) {
      if (dup.uid !== target.uid) {
        // Move all tasks and attendance
        await prisma.task.updateMany({ where: { assignedTo: dup.uid }, data: { assignedTo: target.uid } });
        await prisma.attendanceRecord.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        await prisma.attendanceSupportRequest.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        
        // Delete duplicate
        await prisma.user.delete({ where: { uid: dup.uid } });
      }
    }
    console.log('Merged Sasindu to', target.uid);
  }

  // Same for Dinusha
  const dinushas = users.filter(u => u.name?.includes('Dinusha') || u.username?.includes('dinusha') || u.email?.includes('dinusha'));
  if (dinushas.length > 0) {
    const target = dinushas.find(u => u.uid.startsWith('emp-')) || dinushas[0];
    await prisma.user.update({
      where: { uid: target.uid },
      data: { email: 'dinushapushparajah@gmail.com', username: 'dinusha', name: 'Dinusha Pushparajah' }
    });
    for (const dup of dinushas) {
      if (dup.uid !== target.uid) {
        await prisma.task.updateMany({ where: { assignedTo: dup.uid }, data: { assignedTo: target.uid } });
        await prisma.attendanceRecord.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        await prisma.attendanceSupportRequest.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        await prisma.user.delete({ where: { uid: dup.uid } });
      }
    }
    console.log('Merged Dinusha to', target.uid);
  }

  // Same for Janani
  const jananis = users.filter(u => u.name?.includes('Janani') || u.username?.includes('janani') || u.email?.includes('janani'));
  if (jananis.length > 0) {
    const target = jananis.find(u => u.uid.startsWith('emp-')) || jananis[0];
    await prisma.user.update({
      where: { uid: target.uid },
      data: { email: 'jananisaijanani9@gmail.com', username: 'janani', name: 'Sai Janani' }
    });
    for (const dup of jananis) {
      if (dup.uid !== target.uid) {
        await prisma.task.updateMany({ where: { assignedTo: dup.uid }, data: { assignedTo: target.uid } });
        await prisma.attendanceRecord.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        await prisma.attendanceSupportRequest.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        await prisma.user.delete({ where: { uid: dup.uid } });
      }
    }
    console.log('Merged Janani to', target.uid);
  }

  // Same for Nisal
  const nisals = users.filter(u => u.name?.includes('Nisal') || u.username?.includes('nisal') || u.email?.includes('nisal'));
  if (nisals.length > 0) {
    const target = nisals.find(u => u.uid.startsWith('emp-')) || nisals[0];
    await prisma.user.update({
      where: { uid: target.uid },
      data: { email: 'nisalsayuranga0710@gmail.com', username: 'nisal', name: 'Nisal Sathsara' }
    });
    for (const dup of nisals) {
      if (dup.uid !== target.uid) {
        await prisma.task.updateMany({ where: { assignedTo: dup.uid }, data: { assignedTo: target.uid } });
        await prisma.attendanceRecord.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        await prisma.attendanceSupportRequest.updateMany({ where: { userId: dup.uid }, data: { userId: target.uid } });
        await prisma.user.delete({ where: { uid: dup.uid } });
      }
    }
    console.log('Merged Nisal to', target.uid);
  }
}

fixDuplicates().catch(console.error);
