import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    
    console.log('Updating user:', user.uid);
    const body = {
      ...user,
      name: user.name + ' Updated',
    };
    
    const updated = await prisma.user.upsert({
      where: { uid: user.uid },
      update: body,
      create: { ...body, uid: user.uid }
    });
    console.log('Success:', updated.uid);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
