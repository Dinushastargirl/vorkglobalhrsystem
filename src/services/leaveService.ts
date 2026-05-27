import { LeaveRequest } from '../types';
import { calculateLeaveDays } from '../lib/utils';
import * as userService from './userService';

const KEY = 'hr_pulse_v8_leaves';

function getStoredLeaves(): LeaveRequest[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredLeaves(leaves: LeaveRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(leaves));
}

export async function getLeaves(userId?: string): Promise<LeaveRequest[]> {
  const leaves = getStoredLeaves();
  const emps = await userService.getEmployees();

  const mapped = leaves.map(l => {
    const emp = emps.find(e => e.uid === l.userId);
    const approver = emps.find(e => e.uid === l.approvedBy);
    return {
      ...l,
      userName: emp?.name || 'Unknown',
      userRole: emp?.role || 'employee',
      userPhoto: emp?.photoUrl || '',
      approvedBy: approver?.name || l.approvedBy
    };
  });

  if (userId) {
    return mapped.filter(l => l.userId === userId).sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }
  return mapped.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function submitLeave(leave: Partial<LeaveRequest>): Promise<void> {
  const leaves = getStoredLeaves();
  const newLeave: LeaveRequest = {
    id: `leave-${Date.now()}`,
    userId: leave.userId || '',
    userName: leave.userName || '',
    userRole: leave.userRole || 'employee',
    leaveType: leave.leaveType || 'Annual',
    startDate: leave.startDate || '',
    endDate: leave.endDate || '',
    startTime: leave.startTime,
    endTime: leave.endTime,
    reason: leave.reason || '',
    status: 'Pending',
    isQuotaExceeded: leave.isQuotaExceeded || false,
    imageUrl: leave.imageUrl,
    createdAt: new Date().toISOString()
  };

  leaves.push(newLeave);
  saveStoredLeaves(leaves);
}

export async function updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', adminId: string): Promise<void> {
  const leaves = getStoredLeaves();
  const index = leaves.findIndex(l => l.id === id);
  if (index > -1) {
    leaves[index].status = status;
    leaves[index].approvedBy = adminId;
    saveStoredLeaves(leaves);
  }
}

export async function deleteLeave(id: string): Promise<void> {
  const leaves = getStoredLeaves();
  const filtered = leaves.filter(l => l.id !== id);
  saveStoredLeaves(filtered);
}

export async function rejectExpiredLeaves(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const leaves = getStoredLeaves();
  let updated = false;

  leaves.forEach(l => {
    if (l.status === 'Pending' && l.endDate < today) {
      l.status = 'Rejected';
      updated = true;
    }
  });

  if (updated) {
    saveStoredLeaves(leaves);
  }
}

export async function getMonthlyLeaveTotal(userId: string, month: number, year: number): Promise<number> {
  const leaves = getStoredLeaves();
  
  let totalDays = 0;
  for (const req of leaves) {
    if (req.userId === userId && ['Pending', 'Approved'].includes(req.status)) {
      const [reqYear, reqMonth] = req.startDate.split('-').map(Number);
      if (reqMonth - 1 === month && reqYear === year) {
        totalDays += calculateLeaveDays(req.leaveType, req.startDate, req.endDate, req.startTime, req.endTime);
      }
    }
  }
  return totalDays;
}

export async function approveLeaveRequest(req: LeaveRequest, adminId: string): Promise<void> {
  if (!req.id) throw new Error('Leave request ID is missing');

  // 1. Update status
  const leaves = getStoredLeaves();
  const index = leaves.findIndex(l => l.id === req.id);
  if (index > -1) {
    leaves[index].status = 'Approved';
    leaves[index].approvedBy = adminId;
    saveStoredLeaves(leaves);
  }

  // 2. Fetch profile & update used leaves
  const emp = await userService.getEmployee(req.userId);
  if (emp) {
    const usedLeaves = emp.usedLeaves || { annual: 0, sick: 0, casual: 0, short: 0 };
    const leaveTypeKey = req.leaveType.toLowerCase() as keyof typeof usedLeaves;
    const daysTaken = calculateLeaveDays(req.leaveType, req.startDate, req.endDate, req.startTime, req.endTime);

    usedLeaves[leaveTypeKey] = (usedLeaves[leaveTypeKey] || 0) + daysTaken;
    emp.usedLeaves = usedLeaves;
    await userService.saveEmployee(emp);
  }
}

export async function cancelApprovedLeave(req: LeaveRequest, adminId: string): Promise<void> {
  if (!req.id) throw new Error('Leave request ID is missing');

  // 1. Update status
  const leaves = getStoredLeaves();
  const index = leaves.findIndex(l => l.id === req.id);
  if (index > -1) {
    leaves[index].status = 'Cancelled';
    leaves[index].approvedBy = adminId;
    saveStoredLeaves(leaves);
  }

  // 2. Fetch profile & deduct used leaves
  const emp = await userService.getEmployee(req.userId);
  if (emp) {
    const usedLeaves = emp.usedLeaves || { annual: 0, sick: 0, casual: 0, short: 0 };
    const leaveTypeKey = req.leaveType.toLowerCase() as keyof typeof usedLeaves;
    const daysTaken = calculateLeaveDays(req.leaveType, req.startDate, req.endDate, req.startTime, req.endTime);

    usedLeaves[leaveTypeKey] = Math.max(0, (usedLeaves[leaveTypeKey] || 0) - daysTaken);
    emp.usedLeaves = usedLeaves;
    await userService.saveEmployee(emp);
  }
}
