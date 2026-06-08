import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Award, Plus, Trash2, CheckCircle2, Search, User } from 'lucide-react';
import { Task as Qualification, UserProfile } from '../types';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from '../hooks/useAuth';
import * as qualificationService from '../services/qualificationService';
import * as userService from '../services/userService';

export default function Qualifications() {
  const { user, uid } = useAuth();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');

  const isAdmin = user?.role === 'super' || user?.role === 'owner' || user?.role === 'hr';

  const loadData = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      if (isAdmin) {
        const [allQuals, allEmployees] = await Promise.all([
          qualificationService.getAllQualifications(),
          userService.getEmployees()
        ]);
        setQualifications(allQuals);
        setEmployees(allEmployees);
        if (!assigneeId) setAssigneeId(uid);
      } else {
        const data = await qualificationService.getQualifications(uid);
        setQualifications(data || []);
      }
    } catch (err) {
      console.error('Error loading qualifications:', err);
      toast.error('Failed to sync qualifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid, isAdmin]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !uid) return;

    try {
      const targetUserId = isAdmin ? assigneeId : uid;
      await qualificationService.addQualification(targetUserId, newTitle.trim());
      setNewTitle('');
      toast.success('Qualification assigned successfully');
      loadData();
    } catch (e: any) {
      toast.error('Failed to add qualification');
    }
  };

  const toggleStatus = async (id: string, completed: boolean) => {
    try {
      await qualificationService.toggleQualification(id, !completed);
      loadData();
    } catch (e: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await qualificationService.deleteQualification(id);
      toast.success('Deleted');
      loadData();
    } catch (e: any) {
      toast.error('Failed to delete');
    }
  };

  const filteredData = qualifications.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filter === 'all' ? true : filter === 'active' ? !q.completed : q.completed;
    let matchesEmployee = true;
    if (isAdmin && employeeFilter !== 'all') {
      matchesEmployee = q.userId === employeeFilter;
    }
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const getAssigneeName = (userId: string) => {
    return employees.find(e => e.uid === userId)?.name || 'Unknown';
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading qualifications...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Daily Qualifications</h1>
          <p className="text-zinc-500 font-medium">Track required daily checklists and qualifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm sticky top-24">
            <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              {isAdmin ? 'Assign Qualification' : 'Add Requirement'}
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              {isAdmin && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Assign To</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-sm appearance-none"
                    required
                  >
                    <option value={uid}>Myself</option>
                    {employees.filter(e => e.uid !== uid).map(emp => (
                      <option key={emp.uid} value={emp.uid}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <textarea
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all resize-none font-medium text-sm"
                  placeholder="e.g. Completed Daily Server Check"
                  rows={3}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                {isAdmin ? 'Assign' : 'Add'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm"
              />
            </div>
            {isAdmin && (
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="px-5 py-4 bg-white border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none shadow-sm appearance-none min-w-[200px]"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.uid} value={emp.uid}>{emp.name}</option>
                ))}
              </select>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {filteredData.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-4xl border border-zinc-100 shadow-sm">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 mx-auto mb-4">
                  <Award size={32} />
                </div>
                <p className="text-zinc-500 font-medium">No qualifications found</p>
              </motion.div>
            ) : (
              filteredData.map((q) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn("group flex items-center gap-4 p-6 bg-white rounded-4xl border transition-all shadow-sm", q.completed ? "border-zinc-100 opacity-60" : "border-zinc-100 hover:border-blue-200")}
                >
                  <button onClick={() => toggleStatus(q.id!, q.completed)} className={cn("w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all", q.completed ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-200 group-hover:border-blue-400")}>
                    {q.completed && <CheckCircle2 size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-base font-bold transition-all", q.completed ? "line-through text-zinc-400" : "text-zinc-900")}>{q.title}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <User size={12} />
                        {isAdmin ? getAssigneeName(q.userId) : 'Me'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(q.id!)} className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
