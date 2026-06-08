import { Task } from '../types';

async function getStoredTasks(): Promise<Task[]> {
  try {
    const res = await fetch('/api/tasks');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Failed to fetch tasks:', e);
  }
  return [];
}

async function saveStoredTasks(tasks: Task[]): Promise<void> {
  try {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks)
    });
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export async function getTasks(userId: string): Promise<Task[]> {
  const tasks = await getStoredTasks();
  return tasks
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function getAllTasks(): Promise<Task[]> {
  const tasks = await getStoredTasks();
  return tasks.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function addTask(userId: string, title: string): Promise<void> {
  const tasks = await getStoredTasks();
  tasks.push({
    id: `task-${Date.now()}`,
    userId,
    title,
    completed: false,
    createdAt: new Date().toISOString()
  });
  await saveStoredTasks(tasks);
}

export async function toggleTask(id: string, completed: boolean): Promise<void> {
  const tasks = await getStoredTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index > -1) {
    tasks[index].completed = completed;
    await saveStoredTasks(tasks);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getStoredTasks();
  const filtered = tasks.filter(t => t.id !== id);
  await saveStoredTasks(filtered);
}
