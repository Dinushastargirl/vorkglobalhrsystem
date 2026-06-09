import { PayrollRecord } from '../types';
import * as userService from './userService';

export async function getPayroll(userId?: string): Promise<PayrollRecord[]> {
  const url = userId ? `/api/payroll?userId=${userId}` : '/api/payroll';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch payroll');
  const payroll: PayrollRecord[] = await res.json();
  
  const emps = await userService.getEmployees();
  
  return payroll.map(p => {
    const emp = emps.find(e => e.uid === p.userId);
    return {
      ...p,
      userName: emp?.name || p.userName || 'Unknown',
      branch: emp?.branch || p.branch || 'General',
      sortOrder: emp?.sortOrder ?? 999
    };
  });
}

export async function generatePayroll(month: number, year: number): Promise<void> {
  const employees = await userService.getEmployees();
  const payroll = await getPayroll();

  for (const emp of employees) {
    if (emp.role === 'owner' || emp.role === 'super' || emp.name === 'Super Admin') continue;

    const exists = payroll.find(p => p.userId === emp.uid && p.month === month && p.year === year);
    if (!exists) {
      const netSalary = (emp.salaryA || 0) + (emp.intensive || 0) + (emp.travelling || 0) - (emp.epf || 0) - (emp.advances || 0) - (emp.cover || 0);
      const newRecord = {
        userId: emp.uid,
        userName: emp.name,
        month,
        year,
        salaryA: emp.salaryA || 0,
        salaryB: 0,
        epf: emp.epf || 0,
        advances: emp.advances || 0,
        cover: emp.cover || 0,
        intensive: emp.intensive || 0,
        travelling: emp.travelling || 0,
        extraDays: emp.extraDays || 0,
        netSalary,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        branch: emp.branch
      };
      
      await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
    }
  }
}

export async function savePayroll(record: Partial<PayrollRecord>): Promise<void> {
  const newRecord = {
    userId: record.userId || '',
    userName: record.userName || '',
    month: record.month || new Date().getMonth(),
    year: record.year || new Date().getFullYear(),
    salaryA: record.salaryA || 0,
    salaryB: record.salaryB || 0,
    epf: record.epf || 0,
    advances: record.advances || 0,
    cover: record.cover || 0,
    intensive: record.intensive || 0,
    travelling: record.travelling || 0,
    extraDays: record.extraDays || 0,
    netSalary: record.netSalary || 0,
    status: record.status || 'Pending',
    createdAt: new Date().toISOString(),
    branch: record.branch || ''
  };

  const url = record.id ? `/api/payroll/${record.id}` : '/api/payroll';
  const method = record.id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRecord)
  });
  if (!res.ok) throw new Error('Failed to save payroll');
}

export async function updatePayroll(id: string, updates: Partial<PayrollRecord>): Promise<void> {
  const res = await fetch(`/api/payroll/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update payroll');
}
