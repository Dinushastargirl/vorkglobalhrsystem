import { AdvanceRequest } from '../types';
import * as userService from './userService';

const KEY = 'hr_pulse_v8_advances';

function getStoredAdvances(): AdvanceRequest[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredAdvances(advances: AdvanceRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(advances));
}

export async function getAdvances(userId?: string): Promise<AdvanceRequest[]> {
  const advances = getStoredAdvances();
  const emps = await userService.getEmployees();

  const mapped = advances.map(d => {
    const emp = emps.find(e => e.uid === d.userId);
    const approver = emps.find(e => e.uid === d.approvedBy);
    return {
      ...d,
      userName: emp?.name || 'Unknown',
      userRole: emp?.role || 'employee',
      userPhoto: emp?.photoUrl || '',
      approvedBy: approver?.name || d.approvedBy
    };
  });

  if (userId) {
    return mapped.filter(d => d.userId === userId).sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }
  return mapped.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function submitAdvance(advance: Partial<AdvanceRequest>): Promise<void> {
  const advances = getStoredAdvances();
  const newAdvance: AdvanceRequest = {
    id: `adv-${Date.now()}`,
    userId: advance.userId || '',
    amount: Number(advance.amount) || 0,
    reason: advance.reason || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  advances.push(newAdvance);
  saveStoredAdvances(advances);
}

export async function updateAdvanceStatus(
  id: string,
  status: 'Approved' | 'Rejected',
  adminId: string,
  employeeId?: string,
  amount?: number
): Promise<void> {
  const advances = getStoredAdvances();
  const index = advances.findIndex(d => d.id === id);
  if (index > -1) {
    advances[index].status = status;
    advances[index].approvedBy = adminId;
    advances[index].updatedAt = new Date().toISOString();
    saveStoredAdvances(advances);
  }

  if (status === 'Approved' && employeeId && amount) {
    const emp = await userService.getEmployee(employeeId);
    if (emp) {
      const currentAdvances = Number(emp.advances) || 0;
      const newAdvances = currentAdvances + Number(amount);

      const salaryA = Number(emp.salaryA) || 0;
      const intensive = Number(emp.intensive) || 0;
      const travelling = Number(emp.travelling) || 0;
      const epf = Number(emp.epf) || 0;
      const cover = Number(emp.cover) || 0;
      const newNet = salaryA + intensive + travelling - epf - newAdvances - cover;

      emp.advances = newAdvances;
      emp.net = newNet;
      await userService.saveEmployee(emp);
    }
  }
}

export async function deleteAdvance(id: string): Promise<void> {
  const advances = getStoredAdvances();
  const filtered = advances.filter(d => d.id !== id);
  saveStoredAdvances(filtered);
}
