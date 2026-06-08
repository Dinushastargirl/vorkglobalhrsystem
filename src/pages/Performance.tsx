import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Target, Zap, 
  Star, AlertCircle, CheckCircle2, BarChart3, MessageSquare, Plus, X
} from 'lucide-react';
import { PerformanceRecord, UserProfile, AttendanceRecord, Task } from '../types';
import * as userService from '../services/userService';
import * as attendanceService from '../services/attendanceService';
import * as taskService from '../services/taskService';
import * as performanceService from '../services/performanceService';
import { useAuth } from '../hooks/useAuth';
import { cn, formatDate } from '../lib/utils';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Performance() {
  const { user, uid } = useAuth();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<UserProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'analytics' | 'reviews'>('analytics');
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    score: 0, rating: 5, feedback: '', hrFeedback: '', goals: ''
  });

  const isAdmin = user?.role === 'super' || user?.role === 'owner' || user?.role === 'hr';

  useEffect(() => {
    const loadEmps = async () => {
      try {
        const emps = await userService.getEmployees();
        setEmployees(emps || []);
        if (!selectedEmp && emps && emps.length > 0) {
          const initial = user?.role === 'employee' ? emps.find(e => e.uid === user.uid) || emps[0] : emps[0];
          setSelectedEmp(initial);
        }
      } catch (err) {
        console.error('Error loading employees:', err);
      }
    };
    loadEmps();
  }, [user]);

  useEffect(() => {
    if (!selectedEmp) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [attData, taskData, reviewData] = await Promise.all([
          attendanceService.getAttendance(selectedEmp.uid),
          taskService.getTasks(selectedEmp.uid),
          performanceService.getPerformance(selectedEmp.uid)
        ]);
        setAttendance(attData || []);
        setTasks(taskData || []);
        setReviews(reviewData || []);
      } catch (err) {
        console.error('Error loading performance data:', err);
        toast.error('Failed to sync performance metrics');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedEmp]);

  // Dynamic Metrics Calculation
  const getMetrics = () => {
    const totalLogs = attendance.length;
    const lateLogs = attendance.filter(a => a.isLate).length;
    const punctualityScore = totalLogs > 0 ? Math.max(0, Math.round(((totalLogs - lateLogs) / totalLogs) * 100)) : 0;

    const totalTasks = tasks.length;
    const finishedTasks = tasks.filter(t => t.completed).length;
    const efficiencyScore = totalTasks > 0 ? Math.round((finishedTasks / totalTasks) * 100) : 0;

    const shiftsCompleted = attendance.filter(a => a.checkOut).length;
    const reliabilityScore = totalLogs > 0 ? Math.round((shiftsCompleted / totalLogs) * 100) : 0;

    const finalScore = Math.round((punctualityScore + efficiencyScore + reliabilityScore) / 3) || 0;

    return { 
      punctuality: punctualityScore, 
      efficiency: efficiencyScore, 
      reliability: reliabilityScore, 
      final: finalScore,
      totalLogs,
      finishedTasks,
      totalTasks
    };
  };

  const metrics = getMetrics();

  const getExtendedMetrics = () => {
    const m = getMetrics();
    
    const allScores = employees.map(e => {
      const empAttendance = attendance.filter(a => a.userId === e.uid);
      const empTasks = tasks.filter(t => t.userId === e.uid);
      const totalLogs = empAttendance.length;
      const finishedTasks = empTasks.filter(t => t.completed).length;
      const attScore = totalLogs > 0 ? Math.round((empAttendance.filter(a => !a.isLate).length / totalLogs) * 100) : 100;
      const tskScore = empTasks.length > 0 ? Math.round((finishedTasks / empTasks.length) * 100) : 100;
      return { uid: e.uid, score: Math.round((attScore + tskScore) / 2) };
    }).sort((a, b) => b.score - a.score);

    const rank = allScores.findIndex(s => s.uid === selectedEmp?.uid) + 1;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    
    if (m.totalLogs === 0 && m.totalTasks === 0) {
      return { ...m, rank, history: [] };
    }

    const history = [
      { month: months[currentMonthIdx], score: m.final }
    ];

    return { ...m, rank, history };
  };

  const xMetrics = getExtendedMetrics();

  const getAchievements = () => {
    const list = [];
    if (xMetrics.reliability === 100 && xMetrics.totalLogs > 0) {
      list.push({ text: "Perfect Attendance Streak", icon: CheckCircle2, color: "text-green-400" });
    }
    if (xMetrics.punctuality > 95 && xMetrics.totalLogs > 0) {
      list.push({ text: "Exceptional Punctuality", icon: Zap, color: "text-yellow-400" });
    }
    if (xMetrics.efficiency > 90 && xMetrics.totalTasks > 0) {
      list.push({ text: "High Efficiency Master", icon: Target, color: "text-blue-400" });
    }
    if (xMetrics.final > 90) {
      list.push({ text: "Top Tier Performance", icon: Award, color: "text-blue-400" });
    }
    if (list.length === 0) {
      list.push({ text: "Consistency in Progress", icon: TrendingUp, color: "text-zinc-400" });
    }
    return list;
  };

  const achievements = getAchievements();

  const performanceData = [
    { subject: 'Attendance', A: xMetrics.reliability, fullMark: 100 },
    { subject: 'Punctuality', A: xMetrics.punctuality, fullMark: 100 },
    { subject: 'Efficiency', A: xMetrics.efficiency, fullMark: 100 },
    { subject: 'Reliability', A: xMetrics.reliability, fullMark: 100 },
    { subject: 'Overall', A: xMetrics.final, fullMark: 100 },
  ];

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !uid || !user) return;

    try {
      await performanceService.savePerformance({
        userId: selectedEmp.uid,
        userName: selectedEmp.name,
        evaluatorId: uid,
        evaluatorName: user.name,
        score: xMetrics.final,
        rating: reviewForm.rating,
        feedback: reviewForm.feedback,
        hrFeedback: reviewForm.hrFeedback,
        goals: reviewForm.goals.split(',').map(s => s.trim()).filter(Boolean),
        status: 'Completed',
        createdAt: new Date().toISOString()
      });
      setIsReviewModalOpen(false);
      setReviewForm({ score: 0, rating: 5, feedback: '', hrFeedback: '', goals: '' });
      toast.success('Weekly review submitted!');
      
      const reviewData = await performanceService.getPerformance(selectedEmp.uid);
      setReviews(reviewData || []);
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Performance & KPIs</h1>
          <p className="text-zinc-500 font-medium tracking-tight">Weekly reviews, ranking and growth tracking</p>
        </div>
        {user?.role !== 'employee' && (
          <select 
            value={selectedEmp?.uid}
            onChange={(e) => setSelectedEmp(employees.find(emp => emp.uid === e.target.value) || null)}
            className="px-6 py-4 bg-white border border-zinc-100 rounded-2xl text-sm font-black text-zinc-800 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm min-w-[200px]"
          >
            {employees.map(e => <option key={e.uid} value={e.uid}>{e.name}</option>)}
          </select>
        )}
      </div>

      <div className="flex gap-2 p-2 bg-zinc-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", activeTab === 'analytics' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}
        >
          KPI Analytics
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", activeTab === 'reviews' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}
        >
          Weekly Reviews
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-zinc-50 shadow-xl shadow-zinc-100/50 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="w-24 h-24 rounded-4xl bg-linear-to-br from-zinc-50 to-zinc-100 mx-auto mb-6 flex items-center justify-center text-zinc-800 font-black text-3xl shadow-inner border border-zinc-200 overflow-hidden">
                {selectedEmp?.photoUrl ? <img src={selectedEmp.photoUrl} className="w-full h-full object-cover" /> : selectedEmp?.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-1">{selectedEmp?.name}</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8">{selectedEmp?.role} • {selectedEmp?.branch}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100/50">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Score</p>
                  <p className="text-3xl font-black text-zinc-900">{xMetrics.final}%</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100/50">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 text-center">Rank</p>
                  <p className="text-3xl font-black text-blue-700">#{xMetrics.rank}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-zinc-900/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                  <Award className="text-blue-400" size={20} />
                </div>
                <h3 className="font-black text-xl tracking-tight">Key Achievements</h3>
              </div>
              <ul className="space-y-6">
                {achievements.map((ach, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <div className={cn("p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", ach.color)}>
                      <ach.icon size={18} className="shrink-0" />
                    </div>
                    <p className="text-sm font-bold text-zinc-300">{ach.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[3rem] border border-zinc-50 shadow-xl shadow-zinc-100/50">
                <h3 className="font-black text-zinc-900 mb-8 flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Target size={20} className="text-blue-600" />
                  </div>
                  Skill Distribution
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                      <PolarGrid stroke="#1b1b1e" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900 }} />
                      <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-zinc-50 shadow-xl shadow-zinc-100/50">
                <h3 className="font-black text-zinc-900 mb-8 flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <TrendingUp size={20} className="text-green-500" />
                  </div>
                  Score History
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={xMetrics.history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1b1b1e" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900 }} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ fill: '#f4f4f5', radius: 10 }}
                        contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: '#18181b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                        labelStyle={{ fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}
                      />
                      <Bar dataKey="score" fill="#3b82f6" radius={[10, 10, 10, 10]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Efficiency', val: `${xMetrics.efficiency}%`, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                { label: 'Punctuality', val: `${xMetrics.punctuality}%`, icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Attendance', val: `${xMetrics.reliability}%`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Reliability', val: `${xMetrics.reliability}%`, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-4xl border border-zinc-50 shadow-lg shadow-zinc-100/50 hover:scale-[1.02] transition-transform">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", m.bg, m.color)}>
                    <m.icon size={24} />
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-2xl font-black text-zinc-900">{m.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm p-8 min-h-[500px]">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-100">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <MessageSquare className="text-blue-600" />
                Weekly Performance Reviews
              </h2>
              <p className="text-zinc-500 text-sm mt-1">Feedback and goal tracking for {selectedEmp?.name}</p>
            </div>
            {isAdmin && (
              <button onClick={() => setIsReviewModalOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                <Plus size={18} /> Add Review
              </button>
            )}
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-300">
                  <MessageSquare size={32} />
                </div>
                <p className="text-zinc-500 font-bold">No performance reviews found.</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 relative group hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-md">
                          Score: {review.score}%
                        </span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-zinc-300"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">{formatDate(review.createdAt)} • By {review.evaluatorName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-1">Feedback</h4>
                      <p className="text-sm text-zinc-600 bg-white p-4 rounded-xl border border-zinc-100 leading-relaxed">{review.feedback}</p>
                    </div>
                    {review.hrFeedback && (
                      <div>
                        <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-1">HR Comments</h4>
                        <p className="text-sm text-zinc-600 bg-white p-4 rounded-xl border border-zinc-100 leading-relaxed">{review.hrFeedback}</p>
                      </div>
                    )}
                    {review.goals && review.goals.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2">Goals & KPIs for Next Week</h4>
                        <div className="flex flex-wrap gap-2">
                          {review.goals.map((goal, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-1">
                              <Target size={12} /> {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-4xl shadow-2xl border border-zinc-100 overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-xl font-black text-zinc-900">Weekly Performance Review</h2>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl">✕</button>
              </div>
              <form onSubmit={submitReview} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-xl text-blue-600 shadow-sm">
                    {xMetrics.final}%
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">Current Computed KPI Score</p>
                    <p className="text-xs text-blue-700">Based on punctuality, efficiency, and attendance.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Overall Rating (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num} type="button" 
                        onClick={() => setReviewForm({...reviewForm, rating: num})}
                        className={cn("p-3 rounded-xl border flex-1 flex justify-center transition-all", reviewForm.rating >= num ? "bg-yellow-50 border-yellow-200 text-yellow-500" : "bg-white border-zinc-200 text-zinc-300")}
                      >
                        <Star className={reviewForm.rating >= num ? "fill-current" : ""} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Manager Feedback</label>
                  <textarea required rows={4} value={reviewForm.feedback} onChange={e => setReviewForm({...reviewForm, feedback: e.target.value})} placeholder="General feedback on this week's performance..." className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium resize-none" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">HR Comments (Optional)</label>
                  <textarea rows={2} value={reviewForm.hrFeedback} onChange={e => setReviewForm({...reviewForm, hrFeedback: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium resize-none" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Goals & KPIs for Next Week (Comma separated)</label>
                  <input type="text" value={reviewForm.goals} onChange={e => setReviewForm({...reviewForm, goals: e.target.value})} placeholder="e.g. Improve code quality, Finish Module A" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold" />
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-zinc-500 hover:bg-zinc-50 transition-all border border-zinc-200">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
