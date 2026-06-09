import { Task, TaskComment, TaskStatus } from '../types';
import * as userService from './userService';

export async function getTasks(userId?: string): Promise<Task[]> {
  const url = userId ? `/api/tasks?userId=${userId}` : '/api/tasks';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const tasks: Task[] = await res.json();
  
  const emps = await userService.getEmployees();
  
  return tasks.map(t => {
    const assignedUser = emps.find(e => e.uid === t.assignedTo);
    const assignerUser = emps.find(e => e.uid === t.assignedBy);
    return {
      ...t,
      assignedToName: assignedUser?.name || 'Unknown',
      assignedByName: assignerUser?.name || 'Unknown',
      attachments: typeof t.attachments === 'string' ? JSON.parse(t.attachments) : (t.attachments || []),
      comments: typeof t.comments === 'string' ? JSON.parse(t.comments) : (t.comments || [])
    };
  });
}

export async function saveTask(task: Partial<Task>): Promise<void> {
  const newTask = {
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
    comments: task.comments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const url = task.id ? `/api/tasks/${task.id}` : '/api/tasks';
  const method = task.id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask)
  });
  if (!res.ok) throw new Error('Failed to save task');
}

export async function updateTaskStatus(id: string, status: TaskStatus, progressPercent?: number): Promise<boolean> {
  let awardedPoints = false;
  
  // Need to fetch current task first to check deadline
  const tasks = await getTasks();
  const task = tasks.find(t => t.id === id);

  if (task) {
    if (status === 'Completed' && task.status !== 'Completed') {
      const today = new Date().toISOString().split('T')[0];
      if (today <= task.deadline) {
        await userService.addPerformancePoints(task.assignedTo, 3);
        awardedPoints = true;
      }
    }

    const updates: any = { status, updatedAt: new Date().toISOString() };
    if (progressPercent !== undefined) {
      updates.progressPercent = progressPercent;
    }

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update task status');
  }

  return awardedPoints;
}

export async function addComment(taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>): Promise<void> {
  const tasks = await getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (task) {
    const newComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const comments = [...(task.comments || []), newComment];
    
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments, updatedAt: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('Failed to add comment');
  }
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}
