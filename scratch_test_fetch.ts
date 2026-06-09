import fetch from 'node-fetch'; // if available or just run a normal fetch

async function main() {
  const resGet = await fetch('http://localhost:3001/api/users');
  const users = await resGet.json();
  const user = users[0];
  
  // mimic frontend parsing
  const parsedUser = {
    ...user,
    leaveQuotas: typeof user.leaveQuotas === 'string' ? JSON.parse(user.leaveQuotas) : user.leaveQuotas,
    usedLeaves: typeof user.usedLeaves === 'string' ? JSON.parse(user.usedLeaves) : user.usedLeaves,
    employmentHistory: typeof user.employmentHistory === 'string' ? JSON.parse(user.employmentHistory) : user.employmentHistory,
    skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills,
    techEquipment: typeof user.techEquipment === 'string' ? JSON.parse(user.techEquipment) : user.techEquipment,
  };

  const updatedUser = {
    ...parsedUser,
    name: parsedUser.name + ' Test',
    nickname: 'TestNick',
    nic: '123456789V',
    phone: '0771234567',
    photoUrl: '',
    bankName: 'Test Bank',
    bankBranch: 'Test Branch',
    accountNo: '1234567890',
    accountHolderName: 'Test Name',
    skills: ['React', 'Node.js'],
  };

  console.log('Sending PUT to /api/users/' + updatedUser.uid);
  const resPut = await fetch(`http://localhost:3001/api/users/${updatedUser.uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedUser)
  });

  const responseText = await resPut.text();
  console.log('Status:', resPut.status);
  console.log('Response:', responseText);
}

main();
