import { Task } from '../types';

const KEY = 'hr_pulse_v8_tasks';

function getStoredTasks(): Task[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredTasks(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export async function getTasks(userId: string): Promise<Task[]> {
  const tasks = getStoredTasks();
  return tasks
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function addTask(userId: string, title: string): Promise<void> {
  const tasks = getStoredTasks();
  tasks.push({
    id: `task-${Date.now()}`,
    userId,
    title,
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveStoredTasks(tasks);
}

export async function toggleTask(id: string, completed: boolean): Promise<void> {
  const tasks = getStoredTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index > -1) {
    tasks[index].completed = completed;
    saveStoredTasks(tasks);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = getStoredTasks();
  const filtered = tasks.filter(t => t.id !== id);
  saveStoredTasks(filtered);
}
