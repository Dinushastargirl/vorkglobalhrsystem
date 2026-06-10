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
  // Only send fields that exist in the Prisma schema — never send uid/email/username
  // as those are unique/immutable and will cause Prisma to reject the update
  const payload = {
    name: emp.name,
    role: emp.role,
    branch: emp.branch,
    department: emp.department,
    phone: emp.phone,
    photoUrl: emp.photoUrl,
    status: emp.status,
    joinDate: emp.joinDate,
    salaryA: emp.salaryA,
    salaryB: emp.salaryB,
    epf: emp.epf,
    advances: emp.advances,
    cover: emp.cover,
    intensive: emp.intensive,
    travelling: emp.travelling,
    net: emp.net,
    performanceScore: emp.performanceScore,
    leaveQuotas: emp.leaveQuotas,
    usedLeaves: emp.usedLeaves,
    sortOrder: emp.sortOrder,
    bankName: emp.bankName,
    bankBranch: emp.bankBranch,
    accountNo: emp.accountNo,
    accountHolderName: emp.accountHolderName,
    nic: emp.nic,
    address: emp.address,
    nickname: emp.nickname,
    extraDays: emp.extraDays,
    employmentHistory: emp.employmentHistory,
    skills: emp.skills,
    techEquipment: emp.techEquipment,
  };

  const res = await fetch(`/api/users/${emp.uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.details || errData?.error || 'Failed to save employee');
  }
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
