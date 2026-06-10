async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/users');
    const users = await res.json();
    const dinusha = users.find((u: any) => u.username === 'dinusha');
    if (!dinusha) {
      console.log('User not found');
      return;
    }
    
    console.log('Found user:', dinusha.name);
    
    // Simulate what Profile.tsx does
    const updatedUser = {
      ...dinusha,
      name: 'Dinusha Pushparajah Updated',
      nickname: 'Dinu',
      skills: ['React', 'NodeJS', 'TypeScript']
    };
    
    const putRes = await fetch(`http://localhost:3001/api/users/${updatedUser.uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    
    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error('Update failed:', putRes.status, errText);
    } else {
      console.log('Update successful!');
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
