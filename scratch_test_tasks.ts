import fetch from 'node-fetch'; // assuming node 18+ has global fetch

async function main() {
  const url = 'http://localhost:3001/api/tasks?userId=5178cff2-60f3-4c6e-bd94-91eebb9da9e2';
  console.log('Fetching:', url);
  const res = await fetch(url);
  const tasks = await res.json();
  console.log('Returned tasks:', tasks.length);
  console.log(tasks.map((t: any) => t.title));
}
main();
