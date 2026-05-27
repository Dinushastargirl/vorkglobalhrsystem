import { UserProfile, Holiday } from './types';

export const MOCK_EMPLOYEES_DATA = [
  { branch: 'Headquarters', name: 'Super Admin', email: 'superadmin@hrpulse.com', username: 'superadmin', role: 'super', salaryA: 150000, salaryB: 0, epf: 12000, advances: 0, cover: 0, intensive: 0, travelling: 0, net: 138000, joinDate: '2026-01-01' },
  { branch: 'Colombo', name: 'Dinusha Pushparajah', email: 'dinushapushparajah@gmail.com', username: 'dinusha', role: 'employee', salaryA: 45000, salaryB: 0, epf: 3600, advances: 0, cover: 0, intensive: 0, travelling: 0, net: 41400, joinDate: '2026-02-15' },
  { branch: 'Kandy', name: 'Janani Saijanani', email: 'jananisaijanani9@gmail.com', username: 'janani', role: 'employee', salaryA: 40000, salaryB: 0, epf: 3200, advances: 0, cover: 0, intensive: 0, travelling: 0, net: 36800, joinDate: '2026-03-10' },
  { branch: 'Galle', name: 'Nisal Sayuranga', email: 'nisalsayuranga0710@gmail.com', username: 'nisal', role: 'employee', salaryA: 48000, salaryB: 0, epf: 3840, advances: 0, cover: 0, intensive: 0, travelling: 0, net: 44160, joinDate: '2026-04-01' },
  { branch: 'Headquarters', name: 'Jayaminda', email: 'msjayaminda@gmail.com', username: 'jayaminda', role: 'employee', salaryA: 42000, salaryB: 0, epf: 3360, advances: 0, cover: 0, intensive: 0, travelling: 0, net: 38640, joinDate: '2026-01-20' }
];

export const HOLIDAYS: Holiday[] = [
  { id: '1', date: '2026-01-01', title: 'New Year\'s Day', type: 'Public' },
  { id: '2', date: '2026-01-14', title: 'Tamil Thai Pongal Day', type: 'Public' },
  { id: '3', date: '2026-02-04', title: 'Independence Day', type: 'Public' },
  { id: '4', date: '2026-04-13', title: 'Sinhala & Tamil New Year Eve', type: 'Public' },
  { id: '5', date: '2026-04-14', title: 'Sinhala & Tamil New Year Day', type: 'Public' },
  { id: '6', date: '2026-05-01', title: 'May Day', type: 'Public' },
  { id: '7', date: '2026-12-25', title: 'Christmas Day', type: 'Public' },
];
