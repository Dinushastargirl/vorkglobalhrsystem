import { AttendanceRecord } from '../types';
import * as userService from './userService';

const KEY = 'hr_pulse_v8_attendance';

function getStoredAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
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
  
  // Prevent duplicate check-in for the same day
  const exists = records.find(r => r.userId === userId && r.date === dateStr);
  if (exists) return;

  const newRecord: AttendanceRecord = {
    id: `att-${Date.now()}`,
    userId,
    date: dateStr,
    checkIn: now.toISOString(),
    isLate,
    isEarlyOut: false
  };

  records.push(newRecord);
  saveStoredAttendance(records);

  // Sunday reward
  if (colomboNow.getDay() === 0) {
    try {
      const emp = await userService.getEmployee(userId);
      if (emp) {
        const quotas = emp.leaveQuotas || { annual: 14, sick: 7, casual: 7, short: 8 };
        quotas.annual = (Number(quotas.annual) || 14) + 1;
        emp.extraDays = (Number(emp.extraDays) || 0) + 1;
        emp.leaveQuotas = quotas;
        await userService.saveEmployee(emp);
      }
    } catch (err) {
      console.error('Failed to reward Sunday leave quota on check in:', err);
    }
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
    saveStoredAttendance(records);
  }
}
