import { 
  UserProfile, AttendanceRecord, LeaveRequest, 
  Task, PayrollRecord, PerformanceRecord 
} from './types';
import { MOCK_EMPLOYEES_DATA } from './constants';
import bcrypt from 'bcryptjs';

// Initial data setup
const INITIAL_EMPLOYEES: UserProfile[] = (MOCK_EMPLOYEES_DATA as any[]).map((emp, i) => {
  const salaryA = emp.salaryA || 0;
  const salaryB = emp.salaryB || 0;
  const intensive = emp.intensive || 0;
  const travelling = emp.travelling || 0;
  const epf = emp.epf || 0;
  const advances = emp.advances || 0;
  const cover = emp.cover || 0;
  
  // Recalculate Net: Salary A + Salary B + Intensive + Travelling - EPF - Advances - Cover
  const calculatedNet = salaryA + salaryB + intensive + travelling - epf - advances - cover;
  const net = emp.net !== undefined && emp.net !== 0 ? emp.net : calculatedNet;

  return {
    uid: emp.uid || `emp-${i}`,
    name: emp.name || 'Unknown Employee',
    email: emp.email || `${(emp.name || 'unknown').toLowerCase().replace(/\s/g, '.')}@hrpulse.com`,
    username: emp.username || (emp.name || 'unknown').toLowerCase().replace(/\s/g, '.'),
    password: bcrypt.hashSync(emp.password || `${(emp.name || 'unknown').toLowerCase().split(' ')[0]}123`, 10),
    role: (emp.role as any) || 'employee',
    branch: emp.branch || 'General',
    joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
    salaryA,
    salaryB,
    epf,
    advances,
    cover,
    intensive,
    travelling,
    net,
    performanceScore: Math.floor(Math.random() * 40) + 60,
    leaveQuotas: { annual: 20, sick: 10, casual: 7, short: 2 },
    usedLeaves: { annual: 0, sick: 0, casual: 0, short: 0 },
  };
});

// Helper to get from localStorage
const get = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(`hr_pulse_v5_${key}`);
  return data ? JSON.parse(data) : fallback;
};

// Helper to save to localStorage
const save = <T>(key: string, data: T) => {
  localStorage.setItem(`hr_pulse_v5_${key}`, JSON.stringify(data));
};

export const mockService = {
  // Employees
  getEmployees: () => get<UserProfile[]>('employees', INITIAL_EMPLOYEES),
  saveEmployee: (emp: UserProfile) => {
    const emps = mockService.getEmployees();
    const index = emps.findIndex(e => e.uid === emp.uid);
    
    // Hash password if it's new or changed (mock logic: if it's not already hashed)
    if (emp.password && !emp.password.startsWith('$2a$')) {
      emp.password = bcrypt.hashSync(emp.password, 10);
    }

    if (index > -1) {
      // Preserve password if not provided in update
      if (!emp.password) emp.password = emps[index].password;
      emps[index] = emp;
    } else {
      if (!emp.password) emp.password = bcrypt.hashSync('employee123', 10);
      emps.push(emp);
    }
    save('employees', emps);
  },
  addIncentiveDeduction: (uid: string, amount: number, type: 'incentive' | 'deduction') => {
    const emps = mockService.getEmployees();
    const index = emps.findIndex(e => e.uid === uid);
    if (index > -1) {
      if (type === 'incentive') {
        emps[index].intensive += amount;
      } else {
        emps[index].advances += amount;
      }
      // Recalculate Net: Salary A + Salary B + Intensive + Travelling - EPF - Advances - Cover
      emps[index].net = emps[index].salaryA + emps[index].salaryB + emps[index].intensive + emps[index].travelling - emps[index].epf - emps[index].advances - emps[index].cover;
      save('employees', emps);
      return true;
    }
    return false;
  },
  deleteEmployee: (uid: string) => {
    const emps = mockService.getEmployees().filter(e => e.uid !== uid);
    save('employees', emps);
  },

  // Attendance
  getAttendance: (uid?: string) => {
    const all = get<AttendanceRecord[]>('attendance', []);
    return uid ? all.filter(a => a.userId === uid) : all;
  },
  saveAttendance: (record: AttendanceRecord) => {
    const all = mockService.getAttendance();
    all.push({ ...record, id: `att-${Date.now()}` });
    save('attendance', all);
  },
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => {
    const all = mockService.getAttendance();
    const index = all.findIndex(a => a.id === id);
    if (index > -1) {
      all[index] = { ...all[index], ...updates };
      save('attendance', all);
    }
  },
  checkIn: (uid: string) => {
    const today = new Date().toISOString().split('T')[0];
    const all = mockService.getAttendance(uid);
    const existing = all.find(a => a.date === today);
    if (existing) return false;

    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
    
    mockService.saveAttendance({
      userId: uid,
      date: today,
      checkIn: now.toISOString(),
      isLate,
      isEarlyOut: false
    });
    return true;
  },
  checkOut: (uid: string) => {
    const today = new Date().toISOString().split('T')[0];
    const all = mockService.getAttendance(uid);
    const existing = all.find(a => a.date === today && !a.checkOut);
    if (!existing || !existing.id) return false;

    const now = new Date();
    const isEarlyOut = now.getHours() < 17;
    
    mockService.updateAttendance(existing.id, {
      checkOut: now.toISOString(),
      isEarlyOut
    });
    return true;
  },

  // Leave Requests
  getLeaves: (uid?: string) => {
    const all = get<LeaveRequest[]>('leaves', []);
    return uid ? all.filter(l => l.userId === uid) : all;
  },
  saveLeave: (req: LeaveRequest) => {
    const all = mockService.getLeaves();
    all.push({ ...req, id: `leave-${Date.now()}` });
    save('leaves', all);
  },
  updateLeave: (id: string, status: 'Approved' | 'Rejected', approvedBy: string) => {
    const all = mockService.getLeaves();
    const index = all.findIndex(l => l.id === id);
    if (index > -1) {
      all[index].status = status;
      all[index].approvedBy = approvedBy;
      save('leaves', all);
      
      // If approved, update user's used leaves
      if (status === 'Approved') {
        const emps = mockService.getEmployees();
        const empIndex = emps.findIndex(e => e.uid === all[index].userId);
        if (empIndex > -1) {
          const type = all[index].leaveType.toLowerCase() as keyof UserProfile['usedLeaves'];
          const start = new Date(all[index].startDate);
          const end = new Date(all[index].endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          emps[empIndex].usedLeaves[type] += days;
          save('employees', emps);
        }
      }
    }
  },

  // Tasks
  getTasks: (uid: string) => {
    const all = get<Task[]>('tasks', []);
    return all.filter(t => t.userId === uid);
  },
  saveTask: (task: Task) => {
    const all = get<Task[]>('tasks', []);
    all.push({ ...task, id: `task-${Date.now()}` });
    save('tasks', all);
  },
  toggleTask: (id: string) => {
    const all = get<Task[]>('tasks', []);
    const index = all.findIndex(t => t.id === id);
    if (index > -1) {
      all[index].completed = !all[index].completed;
      save('tasks', all);
    }
  },
  deleteTask: (id: string) => {
    const all = get<Task[]>('tasks', []);
    const filtered = all.filter(t => t.id !== id);
    save('tasks', filtered);
  },

  // Payroll
  getPayroll: (uid?: string) => {
    let all = get<PayrollRecord[]>('payroll', []);
    if (all.length === 0) {
      // Auto-generate for current month on first load
      mockService.generatePayroll(new Date().getMonth(), new Date().getFullYear());
      all = get<PayrollRecord[]>('payroll', []);
    }
    return uid ? all.filter(p => p.userId === uid) : all;
  },
  generatePayroll: (month: number, year: number) => {
    const emps = mockService.getEmployees();
    const payrolls = get<PayrollRecord[]>('payroll', []);
    
    emps.forEach(emp => {
      const exists = payrolls.find(p => p.userId === emp.uid && p.month === month && p.year === year);
      if (!exists) {
        payrolls.push({
          id: `pay-${emp.uid}-${month}-${year}`,
          userId: emp.uid,
          userName: emp.name,
          month,
          year,
          salaryA: emp.salaryA,
          salaryB: emp.salaryB,
          epf: emp.epf,
          advances: emp.advances,
          cover: emp.cover,
          intensive: emp.intensive,
          travelling: emp.travelling,
          netSalary: emp.net,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          branch: emp.branch
        });
      }
    });
    save('payroll', payrolls);
  },
  updatePayroll: (id: string, updates: Partial<PayrollRecord>) => {
    const all = mockService.getPayroll();
    const index = all.findIndex(p => p.id === id);
    if (index > -1) {
      all[index] = { ...all[index], ...updates };
      save('payroll', all);
    }
  }
};
