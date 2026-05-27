import React, { useState, useEffect, createContext, useContext } from 'react';
import { UserProfile } from '../types';
import { getEmployees, saveEmployee } from '../services/userService';
import { MOCK_EMPLOYEES_DATA } from '../constants';

interface AuthContextType {
  user: UserProfile | null;
  uid: string | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_CREDENTIALS: Record<string, { password: string; email: string }> = {
  'superadmin': { password: 'superadmin1234', email: 'superadmin@hrpulse.com' },
  'superadmin@hrpulse.com': { password: 'superadmin1234', email: 'superadmin@hrpulse.com' },
  'dinushapushparajah@gmail.com': { password: 'dinusha123', email: 'dinushapushparajah@gmail.com' },
  'dinushushapushparajah@gmail.com': { password: 'dinusha123', email: 'dinushapushparajah@gmail.com' },
  'dinusha': { password: 'dinusha123', email: 'dinushapushparajah@gmail.com' },
  'jananisaijanani9@gmail.com': { password: 'janani123', email: 'jananisaijanani9@gmail.com' },
  'janani': { password: 'janani123', email: 'jananisaijanani9@gmail.com' },
  'nisalsayuranga0710@gmail.com': { password: 'nisal123', email: 'nisalsayuranga0710@gmail.com' },
  'nisal': { password: 'nisal123', email: 'nisalsayuranga0710@gmail.com' },
  'msjayaminda@gmail.com': { password: 'jayaminda123', email: 'msjayaminda@gmail.com' },
  'jayaminda': { password: 'jayaminda123', email: 'msjayaminda@gmail.com' }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session from local storage on mount
    const savedSession = localStorage.getItem('hr_pulse_v8_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setUser(parsed);
      setUid(parsed.uid);
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const key = emailOrUsername.toLowerCase().trim();
    const creds = VALID_CREDENTIALS[key];

    if (!creds || creds.password !== password) {
      throw new Error('Invalid email/username or password');
    }

    const emps = await getEmployees();
    let matchedProfile = emps.find(e => e.email.toLowerCase() === creds.email.toLowerCase());

    if (!matchedProfile) {
      // Self-healing: create the profile from MOCK_EMPLOYEES_DATA or default
      const defaultEmp = MOCK_EMPLOYEES_DATA.find(e => e.email.toLowerCase() === creds.email.toLowerCase());
      if (defaultEmp) {
        const salaryA = defaultEmp.salaryA || 0;
        const intensive = defaultEmp.intensive || 0;
        const travelling = defaultEmp.travelling || 0;
        const epf = defaultEmp.epf || 0;
        const advances = defaultEmp.advances || 0;
        const cover = defaultEmp.cover || 0;
        const calculatedNet = salaryA + intensive + travelling - epf - advances - cover;

        matchedProfile = {
          uid: `emp-${emps.length}-${Date.now()}`,
          name: defaultEmp.name,
          email: defaultEmp.email,
          username: defaultEmp.username,
          role: defaultEmp.role as any,
          branch: defaultEmp.branch,
          joinDate: defaultEmp.joinDate,
          salaryA,
          salaryB: 0,
          epf,
          advances,
          cover,
          intensive,
          travelling,
          net: defaultEmp.net || calculatedNet,
          performanceScore: 90,
          leaveQuotas: { annual: 14, sick: 7, casual: 7, short: 8 },
          usedLeaves: { annual: 0, sick: 0, casual: 0, short: 0 },
          sortOrder: emps.length + 1,
          bankName: 'Demo Bank',
          bankBranch: 'Main Branch',
          accountNo: '123456789',
          accountHolderName: defaultEmp.name,
          nic: '123456789V',
          nickname: defaultEmp.name.split(' ')[0]
        };
        await saveEmployee(matchedProfile);
      } else {
        throw new Error('Employee profile not found in database');
      }
    }

    setUser(matchedProfile);
    setUid(matchedProfile.uid);
    localStorage.setItem('hr_pulse_v8_session', JSON.stringify(matchedProfile));
  };

  const logout = () => {
    setUser(null);
    setUid(null);
    localStorage.removeItem('hr_pulse_v8_session');
  };

  const updateUser = (userData: UserProfile) => {
    setUser(userData);
    setUid(userData.uid);
    localStorage.setItem('hr_pulse_v8_session', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, uid, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
