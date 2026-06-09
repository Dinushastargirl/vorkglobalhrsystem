import { LeaveRequest } from '../types';
import { calculateLeaveDays } from '../lib/utils';
import * as userService from './userService';

export async function getLeaves(userId?: string): Promise<LeaveRequest[]> {
  const url = userId ? `/api/leaves?userId=${userId}` : '/api/leaves';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch leaves');
  const leaves: LeaveRequest[] = await res.json();
  
  const emps = await userService.getEmployees();
  
  return leaves.map(l => {
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
}

export async function submitLeave(leave: Partial<LeaveRequest>): Promise<void> {
  const newLeave = {
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

  const url = leave.id ? `/api/leaves/${leave.id}` : '/api/leaves';
  const method = leave.id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLeave)
  });
  if (!res.ok) throw new Error('Failed to submit leave');
}

export async function updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', adminId: string): Promise<void> {
  const res = await fetch(`/api/leaves/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, approvedBy: adminId })
  });
  if (!res.ok) throw new Error('Failed to update leave status');
}

export async function deleteLeave(id: string): Promise<void> {
  const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete leave');
}

export async function rejectExpiredLeaves(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const leaves = await getLeaves();
  
  for (const l of leaves) {
    if (l.status === 'Pending' && l.endDate < today && l.id) {
      await updateLeaveStatus(l.id, 'Rejected', 'system');
    }
  }
}

export async function getMonthlyLeaveTotal(userId: string, month: number, year: number): Promise<number> {
  const leaves = await getLeaves(userId);
  let totalDays = 0;
  for (const req of leaves) {
    if (['Pending', 'Approved'].includes(req.status)) {
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
  await updateLeaveStatus(req.id, 'Approved', adminId);

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
  await updateLeaveStatus(req.id, 'Cancelled', adminId);

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
