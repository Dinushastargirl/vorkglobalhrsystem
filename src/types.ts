export type UserRole = 'super' | 'owner' | 'hr' | 'employee';

export interface EmploymentHistory {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface TechEquipment {
  id: string;
  type: string;
  model: string;
  serialNumber: string;
  issuedDate: string;
  status: 'Active' | 'Returned' | 'Repair';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  username: string;
  password?: string; // Hashed
  role: UserRole;
  branch: string;
  department?: string;
  phone?: string;
  photoUrl?: string;
  status?: 'Available' | 'Busy' | 'On Leave' | 'Remote' | 'Meeting';
  joinDate: string;
  salaryA: number;
  salaryB: number;
  epf: number;
  advances: number;
  cover: number;
  intensive: number;
  travelling: number;
  net: number;
  performanceScore?: number;
  leaveQuotas: {
    annual: number;
    sick: number;
    casual: number;
    short: number;
  };
  usedLeaves: {
    annual: number;
    sick: number;
    casual: number;
    short: number;
  };
  sortOrder?: number;
  bankName?: string;
  bankBranch?: string;
  accountNo?: string;
  accountHolderName?: string;
  nic?: string;
  address?: string;
  nickname?: string;
  extraDays?: number;
  employmentHistory?: EmploymentHistory[];
  skills?: string[];
  techEquipment?: TechEquipment[];
}

export interface AttendanceRecord {
  id?: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  isLate: boolean;
  isEarlyOut: boolean;
  status?: string;
}

export interface AttendanceSupportRequest {
  id: string;
  userId: string;
  userName: string;
  date: string;
  reason: string;
  type: 'Missed Check In' | 'Missed Check Out' | 'System Error' | 'Other';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Short';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  leaveType: LeaveType;
  startDate: any;
  endDate: any;
  startTime?: string;
  endTime?: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  createdAt: any;
  isQuotaExceeded?: boolean;
  imageUrl?: string;
  userPhoto?: string;
}

export interface Holiday {
  id: string;
  date: string;
  title: string;
  type: 'Public' | 'Bank' | 'Mercantile';
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Pending Review' | 'Completed' | 'Overdue';

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  assignedBy: string;
  assignedByName?: string;
  priority: TaskPriority;
  startDate: string;
  deadline: string;
  estimatedHours: number;
  progressPercent: number;
  status: TaskStatus;
  category?: string;
  attachments?: string[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export type CourseType = 'Course' | 'Certification' | 'Training Program' | 'Learning Material';
export type CourseStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Course {
  id: string;
  title: string;
  description: string;
  type: CourseType;
  durationHours: number;
  deadline: string;
  assignedTo: string;
  assignedBy: string;
  status: CourseStatus;
  progressPercent: number;
  proofUrl?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id?: string;
  userId: string;
  userName: string;
  month: number;
  year: number;
  salaryA: number;
  salaryB: number;
  epf: number;
  advances: number;
  cover: number;
  intensive: number;
  travelling: number;
  extraDays?: number;
  netSalary: number;
  status: 'Paid' | 'Pending';
  createdAt: any;
  branch: string;
  sortOrder?: number;
  // Additional fields for management
  incentives?: number;
  bonus?: number;
}

export interface PerformanceRecord {
  id: string;
  userId: string;
  userName: string;
  evaluatorId: string;
  evaluatorName: string;
  score: number;
  rating: number;
  feedback: string;
  hrFeedback?: string;
  selfEvaluation?: string;
  goals: string[];
  status: 'Draft' | 'Completed' | 'Self-Evaluated';
  createdAt: any;
}

export type AdvanceStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AdvanceRequest {
  id?: string;
  userId: string;
  userName?: string;
  userRole?: UserRole;
  userPhoto?: string;
  amount: number;
  reason: string;
  status: AdvanceStatus;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}
