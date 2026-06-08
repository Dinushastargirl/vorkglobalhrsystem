import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, Info, Gift, PartyPopper, Moon,
  ListTodo, BookOpen, Target
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { LeaveRequest, Holiday, Task, Course } from '../types';
import * as leaveService from '../services/leaveService';
import * as taskService from '../services/taskService';
import * as lmsService from '../services/lmsService';

export default function Calendar() {
  const { user, uid } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadData = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [leavesData, tasksData, coursesData] = await Promise.all([
        leaveService.getLeaves(uid),
        taskService.getTasks(uid),
        lmsService.getCourses(uid)
      ]);
      setRequests(leavesData || []);
      setTasks(tasksData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid]);

  const SRI_LANKA_HOLIDAYS_2026: Holiday[] = [
    { id: 'sl-1', date: '2026-01-03', title: 'Duruthu Full Moon Poya Day', type: 'Public' },
    { id: 'sl-2', date: '2026-01-15', title: 'Tamil Thai Pongal Day', type: 'Public' },
    { id: 'sl-3', date: '2026-02-01', title: 'Navam Full Moon Poya Day', type: 'Public' },
    { id: 'sl-4', date: '2026-02-04', title: 'National Day', type: 'Public' },
    { id: 'sl-5', date: '2026-02-15', title: 'Mahasivarathri Day', type: 'Public' },
    { id: 'sl-6', date: '2026-03-02', title: 'Madin Full Moon Poya Day', type: 'Public' },
    { id: 'sl-7', date: '2026-03-21', title: 'Eid al-Fitr', type: 'Public' },
    { id: 'sl-8', date: '2026-04-01', title: 'Bak Full Moon Poya Day', type: 'Public' },
    { id: 'sl-9', date: '2026-04-03', title: 'Good Friday', type: 'Public' },
    { id: 'sl-10', date: '2026-04-13', title: 'Day prior to Sinhala and Tamil New Year', type: 'Public' },
    { id: 'sl-11', date: '2026-04-14', title: 'Sinhala and Tamil New Year Day', type: 'Public' },
    { id: 'sl-12', date: '2026-05-01', title: 'May Day & Vesak Poya', type: 'Public' },
    { id: 'sl-13', date: '2026-05-02', title: 'Day after Vesak Poya', type: 'Public' },
    { id: 'sl-14', date: '2026-05-28', title: 'Eid al-Adha', type: 'Public' },
    { id: 'sl-15', date: '2026-05-30', title: 'Adhi Poson Full Moon Poya Day', type: 'Public' },
    { id: 'sl-16', date: '2026-06-29', title: 'Poson Full Moon Poya Day', type: 'Public' },
    { id: 'sl-17', date: '2026-07-29', title: 'Esala Full Moon Poya Day', type: 'Public' },
    { id: 'sl-18', date: '2026-08-26', title: 'Milad-Un-Nabi', type: 'Public' },
    { id: 'sl-19', date: '2026-08-27', title: 'Nikini Full Moon Poya Day', type: 'Public' },
    { id: 'sl-20', date: '2026-09-26', title: 'Binara Full Moon Poya Day', type: 'Public' },
    { id: 'sl-21', date: '2026-10-25', title: 'Vap Full Moon Poya Day', type: 'Public' },
    { id: 'sl-22', date: '2026-12-25', title: 'Christmas Day', type: 'Public' },
  ];

  useEffect(() => {
    const fetchHolidays = async () => {
      if (year === 2026) {
        setHolidays(SRI_LANKA_HOLIDAYS_2026);
        return;
      }
      try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/LK`);
        if (response.ok) {
          const data = await response.json();
          setHolidays(data.map((h: any, i: number) => ({
            id: `h-${i}`,
            date: h.date,
            title: h.localName || h.name,
            type: h.types.includes('Public') ? 'Public' : 'Other'
          })));
        }
      } catch (err) {
        console.error('Holiday fetch error:', err);
      }
    };
    fetchHolidays();
  }, [year]);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth(year, month) }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDayInfo = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const holiday = holidays.find(h => h.date === dateStr);
    const userLeave = requests.find(r => dateStr >= r.startDate && dateStr <= r.endDate);
    const dayTasks = tasks.filter(t => t.deadline === dateStr);
    const dayCourses = courses.filter(c => c.deadline === dateStr);

    return { holiday, userLeave, dayTasks, dayCourses };
  };

  const nextMonth = () => {
    if (month === 11) return;
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const prevMonth = () => {
    if (month === 0) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date())
    .slice(0, 3);

  const upcomingTasks = tasks
    .filter(t => new Date(t.deadline) >= new Date() && t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Personal Calendar</h1>
          <p className="text-zinc-500 font-medium">Holidays, Leaves, Tasks, and Deadlines</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
          <button 
            onClick={prevMonth} 
            disabled={month === 0}
            className="p-2 hover:bg-zinc-50 rounded-xl transition-all text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black text-zinc-900 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={nextMonth} 
            disabled={month === 11}
            className="p-2 hover:bg-zinc-50 rounded-xl transition-all text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {blanks.map(b => <div key={`blank-${b}`} className="aspect-square" />)}
            {days.map(day => {
              const { holiday, userLeave, dayTasks, dayCourses } = getDayInfo(day);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              
              const hasActivity = holiday || userLeave || dayTasks.length > 0 || dayCourses.length > 0;
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group cursor-default border border-transparent",
                    isToday ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" : "hover:bg-zinc-50",
                    holiday ? "bg-blue-50/50 border-blue-100" : "",
                    userLeave ? (userLeave.status === 'Approved' ? "bg-green-50/50 border-green-100" : "bg-amber-50/50 border-amber-100") : ""
                  )}
                >
                  <span className={cn(
                    "text-sm font-black", 
                    holiday && !isToday ? "text-blue-700" : "",
                    userLeave && !isToday ? (userLeave.status === 'Approved' ? "text-green-600" : "text-amber-600") : ""
                  )}>
                    {day}
                  </span>
                  
                  <div className="absolute bottom-1.5 flex gap-1 items-center flex-wrap justify-center px-1">
                    {holiday && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />}
                    {userLeave && <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", userLeave.status === 'Approved' ? "bg-green-500" : "bg-amber-500")} />}
                    {dayTasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm" title="Tasks Due" />}
                    {dayCourses.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm" title="Course Deadlines" />}
                  </div>

                  {hasActivity && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-48 p-3 bg-zinc-900 text-white text-[10px] font-bold rounded-xl text-left shadow-xl leading-snug">
                      {holiday && <p className="text-blue-400 mb-1 flex items-center gap-1"><Moon size={10}/> {holiday.title}</p>}
                      {userLeave && (
                        <p className={cn("mb-1", userLeave.status === 'Approved' ? "text-green-400" : "text-amber-400")}>
                          {userLeave.status === 'Approved' ? '✅' : '⏳'} {userLeave.leaveType} Leave
                        </p>
                      )}
                      {dayTasks.map((t, i) => (
                        <p key={`t-${i}`} className="text-indigo-300 mb-0.5 flex items-center gap-1 truncate"><ListTodo size={10} className="shrink-0"/> {t.title}</p>
                      ))}
                      {dayCourses.map((c, i) => (
                        <p key={`c-${i}`} className="text-purple-300 flex items-center gap-1 truncate"><BookOpen size={10} className="shrink-0"/> {c.title}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
            <div className="flex items-center gap-3 mb-6">
              <ListTodo className="text-indigo-400" size={24} />
              <h3 className="font-black text-lg">Upcoming Tasks</h3>
            </div>
            <div className="space-y-4">
              {upcomingTasks.length === 0 ? (
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest text-center py-2">No upcoming tasks</p>
              ) : (
                upcomingTasks.map((t, i) => (
                  <div key={i} className="flex flex-col gap-1 pb-3 border-b border-white/10 last:border-0 last:pb-0">
                    <h4 className="font-bold text-sm leading-tight truncate">{t.title}</h4>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Due: {formatDate(t.deadline)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-zinc-400" size={20} />
              <h3 className="font-black text-zinc-900">Legend</h3>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-green-50 border border-green-100">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Approved Leave</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Pending Leave</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Public Holiday</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Task Deadline</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-50 border border-purple-100">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Course Deadline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
