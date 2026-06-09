import { prisma } from './api/utils/prisma.js';

async function updateUsers() {
  console.log('Updating Jayaminda...');
  await prisma.user.updateMany({
    where: { username: 'jayaminda' },
    data: {
      name: 'Sasindu Jayaminda Mohotti',
      address: '"Sasindu"Galagama,North, Nakulugamuwa.',
      nic: '200132803902'
    }
  });

  console.log('Updating Nisal...');
  await prisma.user.updateMany({
    where: { username: 'nisal' },
    data: {
      accountHolderName: 'F P N S DIAS',
      bankName: 'COMMERCIAL BANK',
      accountNo: '8010517853',
      bankBranch: 'WADDUWA'
    }
  });

  console.log('Updating Dinusha...');
  await prisma.user.updateMany({
    where: { username: 'dinusha' },
    data: {
      bankName: 'hnb',
      accountNo: '007020110442',
      bankBranch: 'pettah'
    }
  });

  console.log('Updating Janani...');
  await prisma.user.updateMany({
    where: { username: 'janani' },
    data: {
      accountHolderName: 'K S Janani',
      bankName: 'DFCC Bank',
      accountNo: '102003085136',
      bankBranch: 'Kegalle - 049'
    }
  });

  console.log('User details updated successfully!');
}

updateUsers().catch(console.error);
