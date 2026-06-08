import { Task, TaskComment, TaskStatus } from '../types';
import * as userService from './userService';

const KEY = 'vorkca_hr_tasks_v9';

function getStoredTasks(): Task[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredTasks(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export async function getTasks(userId?: string): Promise<Task[]> {
  const tasks = getStoredTasks();
  const emps = await userService.getEmployees();

  const mapped = tasks.map(t => {
    const assignedUser = emps.find(e => e.uid === t.assignedTo);
    const assignerUser = emps.find(e => e.uid === t.assignedBy);
    return {
      ...t,
      assignedToName: assignedUser?.name || 'Unknown',
      assignedByName: assignerUser?.name || 'Unknown',
    };
  });

  if (userId) {
    return mapped
      .filter(t => t.assignedTo === userId || t.assignedBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveTask(task: Partial<Task>): Promise<void> {
  const tasks = getStoredTasks();
  
  if (task.id) {
    const index = tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      tasks[index] = { ...tasks[index], ...task, updatedAt: new Date().toISOString() };
    }
  } else {
    tasks.push({
      id: `task-${Date.now()}`,
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      assignedBy: task.assignedBy || '',
      priority: task.priority || 'Medium',
      startDate: task.startDate || new Date().toISOString().split('T')[0],
      deadline: task.deadline || new Date().toISOString().split('T')[0],
      estimatedHours: task.estimatedHours || 0,
      progressPercent: task.progressPercent || 0,
      status: task.status || 'Not Started',
      category: task.category || '',
      attachments: task.attachments || [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  saveStoredTasks(tasks);
}

export async function updateTaskStatus(id: string, status: TaskStatus, progressPercent?: number): Promise<void> {
  const tasks = getStoredTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index > -1) {
    tasks[index].status = status;
    if (progressPercent !== undefined) {
      tasks[index].progressPercent = progressPercent;
    }
    tasks[index].updatedAt = new Date().toISOString();
    saveStoredTasks(tasks);
  }
}

export async function addComment(taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>): Promise<void> {
  const tasks = getStoredTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index > -1) {
    tasks[index].comments.push({
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    });
    tasks[index].updatedAt = new Date().toISOString();
    saveStoredTasks(tasks);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = getStoredTasks();
  const filtered = tasks.filter(t => t.id !== id);
  saveStoredTasks(filtered);
}
