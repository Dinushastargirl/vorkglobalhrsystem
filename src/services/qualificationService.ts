import { Task as Qualification } from '../types'; // Reusing Task interface for simplicity

async function getStored(): Promise<Qualification[]> {
  try {
    const res = await fetch('/api/qualifications');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Failed to fetch qualifications:', e);
  }
  return [];
}

async function saveStored(items: Qualification[]): Promise<void> {
  try {
    await fetch('/api/qualifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items)
    });
  } catch (e) {
    console.error('Failed to save qualifications:', e);
  }
}

export async function getQualifications(userId: string): Promise<Qualification[]> {
  const items = await getStored();
  return items
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function getAllQualifications(): Promise<Qualification[]> {
  const items = await getStored();
  return items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function addQualification(userId: string, title: string): Promise<void> {
  const items = await getStored();
  items.push({
    id: `qual-${Date.now()}`,
    userId,
    title,
    completed: false,
    createdAt: new Date().toISOString()
  });
  await saveStored(items);
}

export async function toggleQualification(id: string, completed: boolean): Promise<void> {
  const items = await getStored();
  const index = items.findIndex(t => t.id === id);
  if (index > -1) {
    items[index].completed = completed;
    await saveStored(items);
  }
}

export async function deleteQualification(id: string): Promise<void> {
  const items = await getStored();
  const filtered = items.filter(t => t.id !== id);
  await saveStored(filtered);
}
