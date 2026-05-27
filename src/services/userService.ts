import { UserProfile } from '../types';
import { MOCK_EMPLOYEES_DATA } from '../constants';

const KEY = 'hr_pulse_v8_employees';

function getStoredEmployees(): UserProfile[] {
  const data = localStorage.getItem(KEY);
  if (!data) {
    const initial: UserProfile[] = MOCK_EMPLOYEES_DATA.map((emp: any, i) => {
      const salaryA = emp.salaryA || 0;
      const intensive = emp.intensive || 0;
      const travelling = emp.travelling || 0;
      const epf = emp.epf || 0;
      const advances = emp.advances || 0;
      const cover = emp.cover || 0;
      const calculatedNet = salaryA + intensive + travelling - epf - advances - cover;

      return {
        uid: `emp-${i}`,
        name: emp.name || 'Unknown Employee',
        email: emp.email || `${(emp.name || 'unknown').toLowerCase().replace(/\s/g, '.')}@hrpulse.com`,
        username: emp.username || (emp.name || 'unknown').toLowerCase().replace(/\s/g, '.'),
        role: emp.role as any || 'employee',
        branch: emp.branch || 'General',
        joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
        salaryA,
        salaryB: 0,
        epf,
        advances,
        cover,
        intensive,
        travelling,
        net: emp.net || calculatedNet,
        performanceScore: Math.floor(Math.random() * 40) + 60,
        leaveQuotas: { annual: 14, sick: 7, casual: 7, short: 8 },
        usedLeaves: { annual: 0, sick: 0, casual: 0, short: 0 },
        sortOrder: i + 1,
        bankName: 'Demo Bank',
        bankBranch: 'Main Branch',
        accountNo: '123456789',
        accountHolderName: emp.name,
        nic: '123456789V',
        nickname: emp.name.split(' ')[0]
      };
    });
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveStoredEmployees(emps: UserProfile[]) {
  localStorage.setItem(KEY, JSON.stringify(emps));
}

export async function getEmployees(): Promise<UserProfile[]> {
  return getStoredEmployees();
}

export async function getEmployee(uid: string): Promise<UserProfile | null> {
  const emps = getStoredEmployees();
  const emp = emps.find(e => e.uid === uid);
  return emp || null;
}

export async function saveEmployee(emp: UserProfile): Promise<void> {
  const emps = getStoredEmployees();
  const index = emps.findIndex(e => e.uid === emp.uid);
  if (index > -1) {
    emps[index] = emp;
  } else {
    emps.push(emp);
  }
  saveStoredEmployees(emps);
}

export async function updateProfileStatus(uid: string, status: UserProfile['status']): Promise<void> {
  const emps = getStoredEmployees();
  const index = emps.findIndex(e => e.uid === uid);
  if (index > -1) {
    emps[index].status = status;
    saveStoredEmployees(emps);
  }
}

export async function deleteEmployee(uid: string): Promise<void> {
  const emps = getStoredEmployees();
  const filtered = emps.filter(e => e.uid !== uid);
  saveStoredEmployees(filtered);
}

export async function registerFullEmployee(emp: UserProfile, password?: string): Promise<void> {
  const emps = getStoredEmployees();
  const nextSortOrder = emps.reduce((max, e) => Math.max(max, e.sortOrder || 0), 0) + 1;
  const newEmp: UserProfile = {
    ...emp,
    uid: emp.uid || `emp-${Date.now()}`,
    sortOrder: nextSortOrder,
    leaveQuotas: emp.leaveQuotas || { annual: 14, sick: 7, casual: 7, short: 8 },
    usedLeaves: emp.usedLeaves || { annual: 0, sick: 0, casual: 0, short: 0 },
    bankName: emp.bankName || 'Demo Bank',
    bankBranch: emp.bankBranch || 'Main Branch',
    accountNo: emp.accountNo || '123456789',
    accountHolderName: emp.name,
    nic: emp.nic || '123456789V',
    nickname: emp.name.split(' ')[0]
  };
  emps.push(newEmp);
  saveStoredEmployees(emps);
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  // Return dummy local file URL or base64
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
