import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    
    console.log('Trying to update user:', user.uid);
    const body = {
      ...user,
      name: 'Test Name Update',
      skills: ['React', 'Node']
    };

    const res = await prisma.user.upsert({
      where: { uid: user.uid },
      update: body,
      create: { ...body, uid: user.uid }
    });
    console.log('Update successful:', res.uid);
  } catch (err: any) {
    console.error('Update failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
