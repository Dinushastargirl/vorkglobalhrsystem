import { AttendanceRecord, AttendanceSupportRequest } from '../types';
import * as userService from './userService';

const KEY = 'vorkca_hr_attendance_v9';
const SUPPORT_KEY = 'vorkca_hr_attendance_support_v9';

function getStoredAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getStoredSupport(): AttendanceSupportRequest[] {
  const data = localStorage.getItem(SUPPORT_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveStoredSupport(reqs: AttendanceSupportRequest[]) {
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(reqs));
}

export function getColomboTime(date: Date = new Date()): string {
  return date.toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
}

export async function getAttendance(userId?: string): Promise<AttendanceRecord[]> {
  const records = getStoredAttendance();
  let filtered = records;
  if (userId) {
    filtered = records.filter(r => r.userId === userId);
  }
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function checkIn(userId: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const colomboNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const isLate = colomboNow.getHours() > 9 || (colomboNow.getHours() === 9 && colomboNow.getMinutes() > 10);

  const records = getStoredAttendance();
  const emp = await userService.getEmployee(userId);
  
  const exists = records.find(r => r.userId === userId && r.date === dateStr);
  if (exists) return;

  const newRecord: AttendanceRecord = {
    id: `att-${Date.now()}`,
    userId,
    userName: emp?.name || 'Unknown',
    date: dateStr,
    checkIn: now.toISOString(),
    isLate,
    isEarlyOut: false,
    status: 'Working'
  };

  records.push(newRecord);
  saveStoredAttendance(records);

  if (colomboNow.getDay() === 0 && emp) {
    try {
      const quotas = emp.leaveQuotas || { annual: 14, sick: 7, casual: 7, short: 8 };
      quotas.annual = (Number(quotas.annual) || 14) + 1;
      emp.extraDays = (Number(emp.extraDays) || 0) + 1;
      emp.leaveQuotas = quotas;
      await userService.saveEmployee(emp);
    } catch (err) {
      console.error('Failed to reward Sunday leave quota on check in:', err);
    }
  }
}

export async function startBreak(userId: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const records = getStoredAttendance();
  const record = records.find(r => r.userId === userId && r.date === dateStr);
  
  if (record) {
    record.breakStart = now.toISOString();
    record.status = 'On Break';
    saveStoredAttendance(records);
  }
}

export async function endBreak(userId: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const records = getStoredAttendance();
  const record = records.find(r => r.userId === userId && r.date === dateStr);
  
  if (record) {
    record.breakEnd = now.toISOString();
    record.status = 'Working';
    saveStoredAttendance(records);
  }
}

export async function checkOut(userId: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const colomboNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const isEarlyOut = colomboNow.getHours() < 17 || (colomboNow.getHours() === 17 && colomboNow.getMinutes() < 30);

  const records = getStoredAttendance();
  const record = records.find(r => r.userId === userId && r.date === dateStr);
  
  if (record) {
    record.checkOut = now.toISOString();
    record.isEarlyOut = isEarlyOut;
    record.status = 'Checked Out';
    saveStoredAttendance(records);
  }
}

export async function submitSupportRequest(data: Partial<AttendanceSupportRequest>): Promise<void> {
  const reqs = getStoredSupport();
  reqs.push({
    id: `supp-${Date.now()}`,
    userId: data.userId!,
    userName: data.userName!,
    date: data.date!,
    reason: data.reason!,
    type: data.type as any,
    status: 'Pending',
    createdAt: new Date().toISOString()
  });
  saveStoredSupport(reqs);
}

export async function updateSupportRequest(id: string, status: 'Approved' | 'Rejected'): Promise<void> {
  const reqs = getStoredSupport();
  const index = reqs.findIndex(r => r.id === id);
  if (index > -1) {
    reqs[index].status = status;
    saveStoredSupport(reqs);
  }
}

export async function getSupportRequests(userId?: string): Promise<AttendanceSupportRequest[]> {
  const reqs = getStoredSupport();
  if (userId) {
    return reqs.filter(r => r.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
