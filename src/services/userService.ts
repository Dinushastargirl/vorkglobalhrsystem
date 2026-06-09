import { UserProfile } from '../types';

export async function getEmployees(): Promise<UserProfile[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch employees');
  const data = await res.json();
  // Parse JSON fields
  return data.map((e: any) => ({
    ...e,
    leaveQuotas: typeof e.leaveQuotas === 'string' ? JSON.parse(e.leaveQuotas) : e.leaveQuotas,
    usedLeaves: typeof e.usedLeaves === 'string' ? JSON.parse(e.usedLeaves) : e.usedLeaves,
    employmentHistory: typeof e.employmentHistory === 'string' ? JSON.parse(e.employmentHistory) : e.employmentHistory,
    skills: typeof e.skills === 'string' ? JSON.parse(e.skills) : e.skills,
    techEquipment: typeof e.techEquipment === 'string' ? JSON.parse(e.techEquipment) : e.techEquipment,
  }));
}

export async function getEmployee(uid: string): Promise<UserProfile | null> {
  const emps = await getEmployees();
  return emps.find(e => e.uid === uid) || null;
}

export async function saveEmployee(emp: UserProfile): Promise<void> {
  // If it has an ID, update it, otherwise create it
  // Wait, our API endpoints: PUT /api/users/:uid
  const res = await fetch(`/api/users/${emp.uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emp)
  });
  if (!res.ok) throw new Error('Failed to save employee');
}

export async function updateProfileStatus(uid: string, status: UserProfile['status']): Promise<void> {
  const res = await fetch(`/api/users/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
}

export async function deleteEmployee(uid: string): Promise<void> {
  const res = await fetch(`/api/users/${uid}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete employee');
}

export async function registerFullEmployee(emp: UserProfile, password?: string): Promise<void> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emp)
  });
  if (!res.ok) throw new Error('Failed to register employee');
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export async function addPerformancePoints(uid: string, points: number): Promise<void> {
  const emp = await getEmployee(uid);
  if (emp) {
    emp.performanceScore = (emp.performanceScore || 0) + points;
    await saveEmployee(emp);
  }
}
