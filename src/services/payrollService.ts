import { PayrollRecord } from '../types';
import * as userService from './userService';

const KEY = 'hr_pulse_v8_payroll';

function getStoredPayroll(): PayrollRecord[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredPayroll(payroll: PayrollRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(payroll));
}

export async function getPayroll(userId?: string): Promise<PayrollRecord[]> {
  const payroll = getStoredPayroll();
  const emps = await userService.getEmployees();

  const mapped = payroll.map(p => {
    const emp = emps.find(e => e.uid === p.userId);
    return {
      ...p,
      userName: emp?.name || p.userName || 'Unknown',
      branch: emp?.branch || p.branch || 'General',
      sortOrder: emp?.sortOrder ?? 999
    };
  });

  let filtered = mapped;
  if (userId) {
    filtered = mapped.filter(p => p.userId === userId);
  }

  // Sort by sortOrder
  return filtered.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
}

export async function generatePayroll(month: number, year: number): Promise<void> {
  const employees = await userService.getEmployees();
  const payroll = getStoredPayroll();

  for (const emp of employees) {
    if (['super', 'owner'].includes(emp.role)) continue;

    const exists = payroll.find(p => p.userId === emp.uid && p.month === month && p.year === year);
    if (!exists) {
      const netSalary = (emp.salaryA || 0) + (emp.intensive || 0) + (emp.travelling || 0) - (emp.epf || 0) - (emp.advances || 0) - (emp.cover || 0);
      payroll.push({
        id: `pay-${emp.uid}-${month}-${year}`,
        userId: emp.uid,
        userName: emp.name,
        month,
        year,
        salaryA: emp.salaryA,
        salaryB: 0,
        epf: emp.epf,
        advances: emp.advances || 0,
        cover: emp.cover || 0,
        intensive: emp.intensive || 0,
        travelling: emp.travelling || 0,
        extraDays: emp.extraDays || 0,
        netSalary,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        branch: emp.branch
      });
    }
  }
  saveStoredPayroll(payroll);
}

export async function savePayroll(record: Partial<PayrollRecord>): Promise<void> {
  const payroll = getStoredPayroll();
  const newRecord: PayrollRecord = {
    id: record.id || `pay-${record.userId}-${record.month}-${record.year}`,
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

  payroll.push(newRecord);
  saveStoredPayroll(payroll);
}

export async function updatePayroll(id: string, updates: Partial<PayrollRecord>): Promise<void> {
  const payroll = getStoredPayroll();
  const index = payroll.findIndex(p => p.id === id);
  if (index > -1) {
    const record = payroll[index];
    if (updates.salaryA !== undefined) record.salaryA = updates.salaryA;
    if (updates.salaryB !== undefined) record.salaryB = updates.salaryB;
    if (updates.epf !== undefined) record.epf = updates.epf;
    if (updates.advances !== undefined) record.advances = updates.advances;
    if (updates.cover !== undefined) record.cover = updates.cover;
    if (updates.intensive !== undefined) record.intensive = updates.intensive;
    if (updates.travelling !== undefined) record.travelling = updates.travelling;
    if (updates.extraDays !== undefined) record.extraDays = updates.extraDays;
    if (updates.netSalary !== undefined) record.netSalary = updates.netSalary;
    if (updates.status !== undefined) record.status = updates.status;

    saveStoredPayroll(payroll);
  }
}
