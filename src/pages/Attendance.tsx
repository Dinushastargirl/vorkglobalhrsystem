import React, { useState, useEffect } from 'react';
import { 
  Clock, ArrowUpRight, ArrowDownRight, MapPin, Search, Plus, X,
  Coffee, AlertCircle, CheckCircle2, LifeBuoy, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { AttendanceRecord, AttendanceSupportRequest } from '../types';
import { cn, formatDate } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import * as attendanceService from '../services/attendanceService';

export default function Attendance() {
  const { user, uid } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [supportReqs, setSupportReqs] = useState<AttendanceSupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportData, setSupportData] = useState({ date: '', type: 'Missed Check In', reason: '' });

  const isAdmin = user?.role === 'super' || user?.role === 'owner' || user?.role === 'hr';

  const loadData = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [attData, suppData] = await Promise.all([
        attendanceService.getAttendance(isAdmin ? undefined : uid),
        attendanceService.getSupportRequests(isAdmin ? undefined : uid)
      ]);
      setAttendance(attData);
      setSupportReqs(suppData);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [uid, isAdmin]);

  const handleAction = async (action: 'checkIn' | 'startBreak' | 'endBreak' | 'checkOut') => {
    if (!uid) return;
    try {
      if (action === 'checkIn') await attendanceService.checkIn(uid);
      if (action === 'startBreak') await attendanceService.startBreak(uid);
      if (action === 'endBreak') await attendanceService.endBreak(uid);
      if (action === 'checkOut') await attendanceService.checkOut(uid);
      
      toast.success('Attendance logged successfully');
      loadData();
    } catch (e) {
      toast.error('Failed to log attendance');
    }
  };

  const submitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !user || !supportData.date || !supportData.reason) return;

    try {
      await attendanceService.submitSupportRequest({
        userId: uid,
        userName: user.name,
        date: supportData.date,
        type: supportData.type as any,
        reason: supportData.reason
      });
      setIsSupportModalOpen(false);
      setSupportData({ date: '', type: 'Missed Check In', reason: '' });
      toast.success('Support ticket submitted successfully!');
      loadData();
    } catch (e) {
      toast.error('Failed to submit ticket');
    }
  };

  const handleSupportAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await attendanceService.updateSupportRequest(id, status);
      toast.success(`Request ${status}`);
      loadData();
    } catch (e) {
      toast.error('Failed to process request');
    }
  };

  const formatTimeOnly = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLocalToday = () => {
    return new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Colombo', 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    }).format(new Date());
  };

  const todayStr = getLocalToday();
  const myTodayRecord = attendance.find(r => r.userId === uid && r.date === todayStr);

  const filteredAttendance = attendance.filter(r => 
    r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.date.includes(searchQuery)
  );

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading attendance...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Attendance & Shifts</h1>
          <p className="text-zinc-500 font-medium">Manage daily logs, breaks, and support requests</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-4xl font-black tracking-tighter tabular-nums text-zinc-900">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Action Bar (For Employees) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {!myTodayRecord ? (
          <button onClick={() => handleAction('checkIn')} className="col-span-1 md:col-span-2 bg-blue-600 text-white p-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
            <ArrowUpRight size={24} /> Log Check In
          </button>
        ) : !myTodayRecord.checkOut ? (
          <>
            {!myTodayRecord.breakStart ? (
              <button onClick={() => handleAction('startBreak')} className="col-span-1 bg-amber-500 text-white p-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-amber-100">
                <Coffee size={24} /> Start Break
              </button>
            ) : !myTodayRecord.breakEnd ? (
              <button onClick={() => handleAction('endBreak')} className="col-span-1 bg-green-500 text-white p-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-100">
                <Coffee size={24} /> End Break
              </button>
            ) : (
              <button disabled className="col-span-1 bg-zinc-100 text-zinc-400 p-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 cursor-not-allowed border border-zinc-200">
                <Coffee size={24} /> Break Taken
              </button>
            )}
            
            <button onClick={() => handleAction('checkOut')} className="col-span-1 bg-zinc-900 text-white p-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
              <ArrowDownRight size={24} /> Check Out
            </button>
          </>
        ) : (
          <div className="col-span-1 md:col-span-2 bg-green-50 border border-green-100 text-green-700 p-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 cursor-default">
            <CheckCircle2 size={24} /> Shift Completed
          </div>
        )}
        
        <button onClick={() => setIsSupportModalOpen(true)} className="col-span-1 md:col-span-2 bg-white border border-zinc-200 text-zinc-700 p-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all shadow-sm">
          <LifeBuoy size={24} className="text-purple-500" /> Support Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Logs Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-50/50">
            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
              <Clock size={20} className="text-blue-500" /> Daily Logs
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search name or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/30">
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Date / Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center whitespace-nowrap">Check In</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center whitespace-nowrap">Break Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center whitespace-nowrap">Check Out</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium">No attendance records found.</td>
                  </tr>
                ) : (
                  filteredAttendance.map(log => (
                    <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900">{formatDate(log.date)}</p>
                        {isAdmin && <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">{log.userName}</p>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-black text-zinc-900">{formatTimeOnly(log.checkIn)}</span>
                          {log.isLate && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-0.5">Late</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.breakStart ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-sm font-bold text-zinc-600">{formatTimeOnly(log.breakStart)}</span>
                            <span className="text-[10px] font-bold text-zinc-400">to {formatTimeOnly(log.breakEnd)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-zinc-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.checkOut ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-sm font-black text-zinc-900">{formatTimeOnly(log.checkOut)}</span>
                            {log.isEarlyOut && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Early</span>}
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-zinc-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          log.status === 'Working' ? "bg-blue-50 text-blue-700 border-blue-100" :
                          log.status === 'On Break' ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-zinc-100 text-zinc-700 border-zinc-200"
                        )}>
                          {log.status || (log.checkOut ? 'Completed' : 'Active')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Tickets Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-purple-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <LifeBuoy size={24} className="text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white leading-tight">Support Tickets</h3>
                <p className="text-sm text-purple-200 mt-1">Need to fix a log? Submit a request to HR for approval.</p>
              </div>
            </div>
            <div className="absolute top-[-50%] right-[-20%] w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"></div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {supportReqs.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-[2rem] bg-zinc-50/50">
                <p className="text-sm font-bold text-zinc-500">No support tickets.</p>
              </div>
            ) : (
              supportReqs.map(req => (
                <div key={req.id} className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                      req.status === 'Approved' ? "bg-green-100 text-green-700" :
                      req.status === 'Rejected' ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {req.status}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">{formatDate(req.date)}</span>
                  </div>
                  <h4 className="text-sm font-black text-zinc-900 mb-1">{req.type}</h4>
                  <p className="text-xs text-zinc-500 mb-4">{req.reason}</p>
                  
                  {isAdmin && req.status === 'Pending' && (
                    <div className="flex gap-2 pt-4 border-t border-zinc-100">
                      <button onClick={() => handleSupportAction(req.id, 'Approved')} className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition-colors">Approve</button>
                      <button onClick={() => handleSupportAction(req.id, 'Rejected')} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors">Reject</button>
                    </div>
                  )}
                  {isAdmin && <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">By: {req.userName}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Support Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSupportModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white rounded-4xl shadow-2xl border border-zinc-100 overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                  <LifeBuoy size={20} className="text-purple-600" />
                  New Support Ticket
                </h2>
                <button onClick={() => setIsSupportModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl">✕</button>
              </div>
              <form onSubmit={submitSupport} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Issue Date</label>
                  <input type="date" required value={supportData.date} onChange={e => setSupportData({...supportData, date: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-purple-600 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Issue Type</label>
                  <select value={supportData.type} onChange={e => setSupportData({...supportData, type: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-purple-600 outline-none font-bold appearance-none">
                    <option value="Missed Check In">Missed Check In</option>
                    <option value="Missed Check Out">Missed Check Out</option>
                    <option value="System Error">System Error</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Reason / Description</label>
                  <textarea required rows={3} value={supportData.reason} onChange={e => setSupportData({...supportData, reason: e.target.value})} placeholder="Please explain what happened..." className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-purple-600 outline-none font-medium resize-none" />
                </div>
                <button type="submit" className="w-full py-4 rounded-2xl font-black text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xl shadow-purple-100">
                  Submit Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
