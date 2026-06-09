import { getEmployees, saveEmployee } from './services/userService';
import { AttendanceRecord } from './types';

const KEY = 'hr_pulse_v8_attendance';

export async function seedAttendanceForMayJune() {
  const employees = await getEmployees();
  
  // Update salaries for existing employees in localStorage
  for (const emp of employees) {
    let updated = false;
    if (emp.username === 'dinusha') {
      emp.salaryA = 80000;
      emp.epf = 6400;
      emp.net = 73600;
      emp.role = 'super';
      updated = true;
    } else if (['janani', 'nisal', 'jayaminda'].includes(emp.username)) {
      emp.salaryA = 50000;
      emp.epf = 4000;
      emp.net = 46000;
      updated = true;
    }
    if (updated) {
      await saveEmployee(emp);
    }
  }

  
  const data = localStorage.getItem(KEY);
  let existingRecords: AttendanceRecord[] = data ? JSON.parse(data) : [];
  
  // Remove previously generated records for these dates to avoid duplicates when re-seeding
  existingRecords = existingRecords.filter(r => {
    const isMay = r.date.startsWith('2026-05-');
    const isJuneSeed = r.date.startsWith('2026-06-0') && parseInt(r.date.split('-')[2]) <= 7;
    return !(isMay || isJuneSeed);
  });
  
  const newRecords: AttendanceRecord[] = [];
  
  const addRecordsForDateRange = (start: Date, end: Date) => {
    let curr = new Date(start);
    while (curr <= end) {
      const day = curr.getDay();
      if (day !== 0 && day !== 6) { // skip weekends
        // format date as YYYY-MM-DD
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        // Set check-in at 09:30 Local time
        const checkInTime = new Date(curr);
        checkInTime.setHours(9, 30, 0, 0);
        
        // Set check-out at 17:30 Local time
        const checkOutTime = new Date(curr);
        checkOutTime.setHours(17, 30, 0, 0);
        
        for (const emp of employees) {
          newRecords.push({
            id: `att-${emp.uid}-${dateStr}`,
            userId: emp.uid,
            date: dateStr,
            checkIn: checkInTime.toISOString(),
            checkOut: checkOutTime.toISOString(),
            isLate: false,
            isEarlyOut: false
          });
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  };

  addRecordsForDateRange(new Date(2026, 4, 1), new Date(2026, 4, 31)); // Month is 0-indexed: 4 is May
  addRecordsForDateRange(new Date(2026, 5, 1), new Date(2026, 5, 7));  // Month is 0-indexed: 5 is June

  const today = '2026-06-09';
  existingRecords = existingRecords.filter(r => r.date !== today);

  for (const emp of employees) {
    if (emp.username === 'nisal' || emp.username === 'jayaminda') {
      const checkInTime = new Date(2026, 5, 9);
      checkInTime.setHours(9, 30, 0, 0);
      newRecords.push({
        id: `att-${emp.uid}-${today}`,
        userId: emp.uid,
        userName: emp.name,
        date: today,
        checkIn: checkInTime.toISOString(),
        isLate: false,
        isEarlyOut: false
      } as AttendanceRecord);
    } else if (emp.username === 'dinusha') {
      const checkInTime = new Date(2026, 5, 9);
      checkInTime.setHours(10, 0, 0, 0);
      newRecords.push({
        id: `att-${emp.uid}-${today}`,
        userId: emp.uid,
        userName: emp.name,
        date: today,
        checkIn: checkInTime.toISOString(),
        isLate: true,
        isEarlyOut: false
      } as AttendanceRecord);
    }
  }

  const updated = [...existingRecords, ...newRecords];
  localStorage.setItem(KEY, JSON.stringify(updated));
  console.log(`Seeded ${newRecords.length} attendance records.`);
}
