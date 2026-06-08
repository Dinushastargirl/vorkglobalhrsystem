import { Task as Qualification } from '../types'; // Reusing Task interface for simplicity

const KEY = 'hr_pulse_v8_qualifications';

function getStored(): Qualification[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStored(items: Qualification[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export async function getQualifications(userId: string): Promise<Qualification[]> {
  const items = getStored();
  return items
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function getAllQualifications(): Promise<Qualification[]> {
  const items = getStored();
  return items.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function addQualification(userId: string, title: string): Promise<void> {
  const items = getStored();
  items.push({
    id: `qual-${Date.now()}`,
    userId,
    title,
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveStored(items);
}

export async function toggleQualification(id: string, completed: boolean): Promise<void> {
  const items = getStored();
  const index = items.findIndex(t => t.id === id);
  if (index > -1) {
    items[index].completed = completed;
    saveStored(items);
  }
}

export async function deleteQualification(id: string): Promise<void> {
  const items = getStored();
  const filtered = items.filter(t => t.id !== id);
  saveStored(filtered);
}
