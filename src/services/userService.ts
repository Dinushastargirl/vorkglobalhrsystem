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
        bankName: emp.bankName || 'Demo Bank',
        bankBranch: emp.bankBranch || 'Main Branch',
        accountNo: emp.accountNo || '123456789',
        accountHolderName: emp.accountHolderName || emp.name,
        nic: emp.nic || '123456789V',
        address: emp.address || '',
        nickname: (emp.name || '').split(' ')[0]
      };
    });
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  
  let emps: UserProfile[] = JSON.parse(data);
  let patched = false;

  const dinusha = emps.find(e => e.email === 'dinushapushparajah@gmail.com');
  if (dinusha && dinusha.accountNo !== '007020110442') {
    dinusha.bankName = 'HNB bank';
    dinusha.accountNo = '007020110442';
    dinusha.bankBranch = 'pettah';
    dinusha.accountHolderName = 'P Dinusha';
    patched = true;
  }

  const janani = emps.find(e => e.email === 'jananisaijanani9@gmail.com');
  if (janani && janani.accountNo !== '102003085136') {
    janani.bankName = 'DFCC Bank';
    janani.accountNo = '102003085136';
    janani.bankBranch = 'Kegalle - 049';
    janani.accountHolderName = 'K S Janani';
    patched = true;
  }

  const nisal = emps.find(e => e.email === 'nisalsayuranga0710@gmail.com');
  if (nisal && nisal.accountNo !== '8010517853') {
    nisal.name = 'F P N S DIAS(nisal)';
    nisal.bankName = 'COMMERCIAL BANK';
    nisal.accountNo = '8010517853';
    nisal.bankBranch = 'WADDUWA';
    nisal.accountHolderName = 'F P N S DIAS';
    patched = true;
  }

  const jaiminda = emps.find(e => e.email === 'msjaiminda@gmail.com');
  if (jaiminda && jaiminda.nic !== '200132803902') {
    jaiminda.name = 'Sasindu Jayaminda Mohotti';
    jaiminda.nic = '200132803902';
    jaiminda.address = '"Sasindu"Galagama,North, Nakulugamuwa.';
    patched = true;
  }

  if (patched) {
    localStorage.setItem(KEY, JSON.stringify(emps));
  }

  return emps;
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
