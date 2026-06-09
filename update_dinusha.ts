import { prisma } from './api/utils/prisma.js';

async function updateDinusha() {
  console.log('Updating Dinusha bank details...');
  await prisma.user.updateMany({
    where: { username: 'dinusha' },
    data: {
      accountHolderName: 'dinushap'
    }
  });

  console.log('Dinusha details updated successfully!');
}

updateDinusha().catch(console.error);
