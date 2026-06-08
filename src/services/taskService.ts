import { Task, TaskComment, TaskStatus } from '../types';
import * as userService from './userService';

const KEY = 'vorkca_hr_tasks_v9';

function getStoredTasks(): Task[] {
  const data = localStorage.getItem(KEY);
  let tasks: Task[] = data ? JSON.parse(data) : [];

  const seeded = tasks.some(t => t.title === 'AI Business Insights Platform');
  if (!seeded) {
    const thisFriday = '2026-06-12';
    const thisWednesday = '2026-06-10';
    const nextFriday = '2026-06-19';
    
    const newTasks: Task[] = [
      {
        id: `task-seed-1`,
        title: 'AI Business Insights Platform',
        description: 'Research and design an AI-powered Business Insights Platform for SMEs. Define key features such as sales analytics, customer behavior tracking, inventory insights, predictive reporting, pricing strategy, target industries, and prepare the complete demo presentation with business value explanation.',
        assignedTo: 'emp-1',
        assignedBy: 'emp-0',
        priority: 'High',
        startDate: new Date().toISOString().split('T')[0],
        deadline: thisFriday,
        estimatedHours: 40,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Research & Design',
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-seed-2`,
        title: 'Pickher – Business Growth & Acquisition Strategy',
        description: 'Research and develop a complete growth and acquisition strategy for Pickher. Define how to acquire drivers and passengers, design referral systems, identify marketing channels, propose partnerships, and outline operational workflows and monetization strategy.',
        assignedTo: 'emp-1',
        assignedBy: 'emp-0',
        priority: 'High',
        startDate: new Date().toISOString().split('T')[0],
        deadline: thisFriday,
        estimatedHours: 40,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Strategy',
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-seed-3`,
        title: 'Queue Management System',
        description: 'Design and develop a Queue Management System for clinics, pharmacies, banks, service centers, and government offices. Define token flow, waiting system logic, display system, admin control, and prepare full demo presentation.',
        assignedTo: 'emp-2',
        assignedBy: 'emp-0',
        priority: 'High',
        startDate: new Date().toISOString().split('T')[0],
        deadline: thisFriday,
        estimatedHours: 40,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Development',
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-seed-4`,
        title: 'Pickher – Content Strategy',
        description: 'Create a full content strategy for Pickher including onboarding content, driver communication content, passenger communication content, launch campaign plan, social media content plan, and user engagement messaging.',
        assignedTo: 'emp-2',
        assignedBy: 'emp-0',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        deadline: thisFriday,
        estimatedHours: 20,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Content',
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-seed-5`,
        title: 'POS System',
        description: 'Design and develop a Point of Sale (POS) System including product management, billing, receipt generation, inventory tracking, sales reports, and demo scenarios for retail and pharmacy use cases.',
        assignedTo: 'emp-3',
        assignedBy: 'emp-0',
        priority: 'High',
        startDate: new Date().toISOString().split('T')[0],
        deadline: thisFriday,
        estimatedHours: 40,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Development',
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-seed-6`,
        title: 'Pickher – Passenger Application & Dashboard',
        description: 'Develop the Pickher Passenger Application and Admin Dashboard including user registration, ride booking flow, trip tracking, booking history, and dashboard analytics.',
        assignedTo: 'emp-3',
        assignedBy: 'emp-0',
        priority: 'Urgent',
        startDate: new Date().toISOString().split('T')[0],
        deadline: nextFriday,
        estimatedHours: 80,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Development',
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-seed-7`,
        title: 'CRM & Lead Management System',
        description: 'Design and develop a CRM & Lead Management System including lead tracking, customer management, sales pipeline, follow-ups, task tracking, and reporting dashboard. Prepare architecture, database design, UI flow, and demo scenario.',
        assignedTo: 'emp-4',
        assignedBy: 'emp-0',
        priority: 'High',
        startDate: new Date().toISOString().split('T')[0],
        deadline: thisFriday,
        estimatedHours: 40,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Development',
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `task-seed-8`,
        title: 'Pickher – UI/UX + Driver Application',
        description: 'Review and refine Pickher UI/UX designs, improve user flows, and finalize design system. Develop the Pickher Driver Application including driver onboarding, ride acceptance, trip management, earnings tracking, and profile management.',
        assignedTo: 'emp-4',
        assignedBy: 'emp-0',
        priority: 'Urgent',
        startDate: new Date().toISOString().split('T')[0],
        deadline: nextFriday,
        estimatedHours: 80,
        progressPercent: 0,
        status: 'Not Started',
        category: 'Design & Dev',
        attachments: [],
        comments: [{
           id: 'c1',
           userId: 'emp-0',
           userName: 'Super Admin',
           text: 'Design Review Deadline: This Wednesday (2026-06-10)',
           createdAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    tasks = [...tasks, ...newTasks];
    localStorage.setItem(KEY, JSON.stringify(tasks));
  }

  return tasks;
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

export async function updateTaskStatus(id: string, status: TaskStatus, progressPercent?: number): Promise<boolean> {
  const tasks = getStoredTasks();
  const index = tasks.findIndex(t => t.id === id);
  let awardedPoints = false;

  if (index > -1) {
    const task = tasks[index];
    
    // Gamification: if completing before or on deadline
    if (status === 'Completed' && task.status !== 'Completed') {
      const today = new Date().toISOString().split('T')[0];
      if (today <= task.deadline) {
        await userService.addPerformancePoints(task.assignedTo, 3);
        awardedPoints = true;
      }
    }

    task.status = status;
    if (progressPercent !== undefined) {
      task.progressPercent = progressPercent;
    }
    task.updatedAt = new Date().toISOString();
    saveStoredTasks(tasks);
  }
  return awardedPoints;
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
