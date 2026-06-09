import { AdvanceRequest } from '../types';
import * as userService from './userService';

export async function getAdvances(userId?: string): Promise<AdvanceRequest[]> {
  const url = userId ? `/api/advances?userId=${userId}` : '/api/advances';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch advances');
  const advances: AdvanceRequest[] = await res.json();
  
  const emps = await userService.getEmployees();
  
  return advances.map(d => {
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
}

export async function submitAdvance(advance: Partial<AdvanceRequest>): Promise<void> {
  const newAdvance = {
    userId: advance.userId || '',
    amount: Number(advance.amount) || 0,
    reason: advance.reason || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  const res = await fetch('/api/advances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAdvance)
  });
  if (!res.ok) throw new Error('Failed to submit advance');
}

export async function updateAdvanceStatus(
  id: string,
  status: 'Approved' | 'Rejected',
  adminId: string,
  employeeId?: string,
  amount?: number
): Promise<void> {
  const res = await fetch(`/api/advances/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, approvedBy: adminId, updatedAt: new Date().toISOString() })
  });
  if (!res.ok) throw new Error('Failed to update advance');

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
  const res = await fetch(`/api/advances/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete advance');
}
