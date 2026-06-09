import { AttendanceRecord, AttendanceSupportRequest } from '../types';
import * as userService from './userService';

export function getColomboTime(date: Date = new Date()): string {
  return date.toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
}

export async function getAttendance(userId?: string): Promise<AttendanceRecord[]> {
  const url = userId ? `/api/attendance?userId=${userId}` : '/api/attendance';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function checkIn(userId: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const colomboNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const isLate = colomboNow.getHours() > 9 || (colomboNow.getHours() === 9 && colomboNow.getMinutes() > 10);

  const records = await getAttendance();
  const emp = await userService.getEmployee(userId);
  
  const exists = records.find(r => r.userId === userId && r.date === dateStr);
  if (exists) return;

  const newRecord = {
    userId,
    userName: emp?.name || 'Unknown',
    date: dateStr,
    checkIn: now.toISOString(),
    isLate,
    isEarlyOut: false,
    status: 'Working'
  };

  const res = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRecord)
  });
  if (!res.ok) throw new Error('Failed to check in');

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
  const records = await getAttendance(userId);
  const record = records.find(r => r.date === dateStr);
  
  if (record && record.id) {
    await fetch(`/api/attendance/${record.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ breakStart: now.toISOString(), status: 'On Break' })
    });
  }
}

export async function endBreak(userId: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const records = await getAttendance(userId);
  const record = records.find(r => r.date === dateStr);
  
  if (record && record.id) {
    await fetch(`/api/attendance/${record.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ breakEnd: now.toISOString(), status: 'Working' })
    });
  }
}

export async function checkOut(userId: string): Promise<void> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const colomboNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const isEarlyOut = colomboNow.getHours() < 17 || (colomboNow.getHours() === 17 && colomboNow.getMinutes() < 30);

  const records = await getAttendance(userId);
  const record = records.find(r => r.date === dateStr);
  
  if (record && record.id) {
    await fetch(`/api/attendance/${record.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkOut: now.toISOString(), isEarlyOut, status: 'Checked Out' })
    });
  }
}

export async function submitSupportRequest(data: Partial<AttendanceSupportRequest>): Promise<void> {
  const newReq = {
    userId: data.userId!,
    userName: data.userName!,
    date: data.date!,
    reason: data.reason!,
    type: data.type as string,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  const res = await fetch('/api/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newReq)
  });
  if (!res.ok) throw new Error('Failed to submit request');
}

export async function updateSupportRequest(id: string, status: 'Approved' | 'Rejected'): Promise<void> {
  const res = await fetch(`/api/support/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update request');
}

export async function getSupportRequests(userId?: string): Promise<AttendanceSupportRequest[]> {
  const url = userId ? `/api/support?userId=${userId}` : '/api/support';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch support requests');
  return res.json();
}
