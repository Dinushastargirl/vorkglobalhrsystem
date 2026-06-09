import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Search, Filter, User, Calendar, Clock, 
  MessageSquare, Paperclip, ChevronRight, CheckCircle2, 
  MoreVertical, Edit3, MessageCircle 
} from 'lucide-react';
import { Task, UserProfile, TaskPriority, TaskStatus } from '../types';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';
import * as userService from '../services/userService';

export default function Tasks() {
  const { user, uid } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'super' || user?.role === 'owner' || user?.role === 'hr';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | TaskStatus>('All');
  const [activeTab, setActiveTab] = useState<'my_tasks' | 'all_tasks'>(isAdmin ? 'all_tasks' : 'my_tasks');
  const [tempProgress, setTempProgress] = useState(0);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  
  // View task modal
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');


  const loadData = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [allTasks, allEmployees] = await Promise.all([
        taskService.getTasks(isAdmin ? undefined : uid),
        userService.getEmployees()
      ]);
      setTasks(allTasks);
      setEmployees(allEmployees);
    } catch (err) {
      console.error('Error loading tasks:', err);
      toast.error('Failed to sync tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid, isAdmin]);

  useEffect(() => {
    if (viewTask) {
      setTempProgress(viewTask.progressPercent || 0);
    }
  }, [viewTask?.id, viewTask?.progressPercent]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask?.title?.trim() || !uid) return;

    try {
      await taskService.saveTask({
        ...editingTask,
        assignedBy: editingTask.assignedBy || uid
      });
      setIsModalOpen(false);
      setEditingTask(null);
      toast.success(editingTask.id ? 'Task updated' : 'Task created successfully');
      loadData();
    } catch (e: any) {
      console.error('Save task error:', e);
      toast.error('Failed to save task');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !viewTask || !uid || !user) return;
    
    try {
      await taskService.addComment(viewTask.id!, {
        userId: uid,
        userName: user.name,
        text: commentText
      });
      setCommentText('');
      // Reload specific task if needed, or global
      await loadData();
      // Update local viewTask state
      const updatedTasks = await taskService.getTasks(isAdmin ? undefined : uid);
      const updatedCurrentTask = updatedTasks.find(t => t.id === viewTask.id);
      if (updatedCurrentTask) setViewTask(updatedCurrentTask);
    } catch (e: any) {
      toast.error('Failed to add comment');
    }
  };

  const deleteTask = async (id: string) => {
    if(!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted');
      loadData();
      if(viewTask?.id === id) setViewTask(null);
    } catch (e: any) {
      toast.error('Failed to delete task');
    }
  };

  const updateStatus = async (id: string, status: TaskStatus, progress?: number) => {
    try {
      const awardedPoints = await taskService.updateTaskStatus(id, status, progress);
      loadData();
      if (awardedPoints) {
        toast.success('🎉 Task completed! You earned 3 Performance Points!');
      } else {
        toast.success(`Task status updated to ${status}`);
      }
      if(viewTask?.id === id) {
        setViewTask(prev => prev ? {...prev, status, progressPercent: progress ?? prev.progressPercent} : null);
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateProgress = async () => {
    if (!viewTask?.id) return;
    try {
      await taskService.updateTaskStatus(viewTask.id, viewTask.status, tempProgress);
      toast.success('Progress updated!');
      loadData();
      setViewTask(prev => prev ? {...prev, progressPercent: tempProgress} : null);
    } catch (e) {
      toast.error('Failed to update progress');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (isAdmin && activeTab === 'my_tasks' && task.assignedTo !== uid) return false;
    if (!isAdmin && task.assignedTo !== uid) return false;

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: TaskStatus) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending Review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch(priority) {
      case 'Urgent': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-zinc-600 bg-zinc-50';
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading your tasks...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Task Management</h1>
          <p className="text-zinc-500 font-medium">Professional project and task tracking</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingTask({
                title: '', description: '', assignedTo: uid || '', assignedBy: uid || '',
                priority: 'Medium', status: 'Not Started', progressPercent: 0,
                startDate: new Date().toISOString().split('T')[0],
                deadline: new Date().toISOString().split('T')[0],
                estimatedHours: 0
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Plus size={20} />
            Create Task
          </button>
        )}
      </div>

      {/* Tabs for Admins */}
      {isAdmin && (
        <div className="flex gap-4 border-b border-zinc-100 pb-px">
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={cn(
              "px-6 py-3 font-bold text-sm border-b-2 transition-all",
              activeTab === 'my_tasks' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab('all_tasks')}
            className={cn(
              "px-6 py-3 font-bold text-sm border-b-2 transition-all",
              activeTab === 'all_tasks' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            All Employees Tasks
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-4xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Not Started', 'In Progress', 'Pending Review', 'Completed', 'Overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f as any)}
              className={cn(
                "px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                filterStatus === f
                  ? "bg-zinc-900 text-white shadow-md"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task Table View */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Task</th>
                <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Priority</th>
                <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Assigned By</th>
                <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dates</th>
                <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Progress</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-400 font-medium">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group cursor-pointer" onClick={() => setViewTask(task)}>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", task.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500')} />
                        <div>
                          <p className={cn("font-bold text-zinc-900 line-clamp-1", task.status === 'Completed' && "line-through text-zinc-400")}>{task.title}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                            <User size={12} /> {task.assignedToName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-medium text-zinc-600">{task.assignedByName}</span>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-zinc-900">{formatDate(task.deadline)}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">From {formatDate(task.startDate)}</p>
                    </td>
                    <td className="p-6">
                      <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border", getStatusColor(task.status))}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden w-24">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.progressPercent}%` }} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 w-8">{task.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {isAdmin && activeTab === 'all_tasks' && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsModalOpen(true); }}
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.id!); }}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-4xl shadow-2xl border border-zinc-100"
            >
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-100 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-zinc-900">{editingTask.id ? 'Edit Task' : 'Create New Task'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors">
                  <Trash2 size={20} className="opacity-0" /> {/* Spacer */}
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">✕</span>
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Task Title</label>
                      <input
                        type="text" required
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                        placeholder="Enter task name..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                      <textarea
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium h-48 resize-none"
                        placeholder="Enter task details..."
                      />
                    </div>
                  </div>

                  {/* Sidebar Meta */}
                  <div className="space-y-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Assigned To</label>
                      <select
                        value={editingTask.assignedTo}
                        onChange={(e) => setEditingTask({...editingTask, assignedTo: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold appearance-none"
                      >
                        {employees.map(emp => (
                          <option key={emp.uid} value={emp.uid}>{emp.name} ({emp.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
                      <select
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as TaskPriority})}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold appearance-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Status</label>
                      <select
                        value={editingTask.status}
                        onChange={(e) => setEditingTask({...editingTask, status: e.target.value as TaskStatus})}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold appearance-none"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                        <input
                          type="date" required
                          value={editingTask.startDate}
                          onChange={(e) => setEditingTask({...editingTask, startDate: e.target.value})}
                          className="w-full px-3 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Deadline</label>
                        <input
                          type="date" required
                          value={editingTask.deadline}
                          onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})}
                          className="w-full px-3 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Est. Hours</label>
                        <input
                          type="number" min="0" step="0.5"
                          value={editingTask.estimatedHours}
                          onChange={(e) => setEditingTask({...editingTask, estimatedHours: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Progress %</label>
                        <input
                          type="number" min="0" max="100"
                          value={editingTask.progressPercent}
                          onChange={(e) => setEditingTask({...editingTask, progressPercent: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-6 border-t border-zinc-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 rounded-2xl font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                    {editingTask.id ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Task / Details / Comments Modal */}
      <AnimatePresence>
        {viewTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewTask(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full md:h-[95vh] flex flex-col bg-white md:rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border", getStatusColor(viewTask.status))}>
                    {viewTask.status}
                  </span>
                  <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest", getPriorityColor(viewTask.priority))}>
                    {viewTask.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button onClick={() => { setViewTask(null); setEditingTask(viewTask); setIsModalOpen(true); }} className="p-2 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                      <Edit3 size={18} />
                    </button>
                  )}
                  <button onClick={() => setViewTask(null)} className="p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 rounded-xl transition-all">
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 mb-4">{viewTask.title}</h2>
                  <div className="flex items-center gap-6 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-6">
                    <span className="flex items-center gap-1.5"><User size={14} /> Assignee: <strong className="text-zinc-900">{viewTask.assignedToName}</strong></span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> Due: <strong className="text-zinc-900">{formatDate(viewTask.deadline)}</strong></span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> Est: <strong className="text-zinc-900">{viewTask.estimatedHours}h</strong></span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-500" />
                    Description
                  </h3>
                  <div 
                    className="prose prose-sm max-w-none text-zinc-700 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100"
                    dangerouslySetInnerHTML={{ __html: viewTask.description || '<p className="italic text-zinc-400">No description provided.</p>' }} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewTask.status !== 'Completed' && (
                    <button onClick={() => updateStatus(viewTask.id!, 'Completed', 100)} className="p-4 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                      <CheckCircle2 size={18} /> Mark as Completed
                    </button>
                  )}
                  {viewTask.status === 'Not Started' && viewTask.assignedTo === uid && (
                    <button onClick={() => updateStatus(viewTask.id!, 'In Progress', 10)} className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                      <Clock size={18} /> Start Progress
                    </button>
                  )}
                  {viewTask.status === 'In Progress' && viewTask.assignedTo === uid && (
                    <button onClick={() => updateStatus(viewTask.id!, 'Pending Review', viewTask.progressPercent)} className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                      <MoreVertical size={18} /> Request Review
                    </button>
                  )}
                </div>

                {viewTask.status === 'In Progress' && viewTask.assignedTo === uid && (
                  <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100 mt-4">
                    <div className="flex-1">
                      <label className="text-xs font-black text-blue-800 uppercase tracking-widest mb-3 block">Daily Progress Update (%)</label>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={tempProgress} 
                        onChange={e => setTempProgress(Number(e.target.value))} 
                        className="w-full accent-blue-600 h-2 bg-blue-200 rounded-full appearance-none outline-none" 
                      />
                    </div>
                    <div className="text-3xl font-black text-blue-900 w-20 text-center">{tempProgress}%</div>
                    <button 
                      onClick={handleUpdateProgress} 
                      disabled={tempProgress === viewTask.progressPercent}
                      className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100 shrink-0"
                    >
                      Update
                    </button>
                  </div>
                )}

                <div className="pt-8 border-t border-zinc-100">
                  <h3 className="text-sm font-black text-zinc-900 mb-6 flex items-center gap-2">
                    <MessageCircle size={16} className="text-blue-500" />
                    Activity & Comments ({viewTask.comments.length})
                  </h3>
                  
                  <div className="space-y-6 mb-8">
                    {viewTask.comments.map(comment => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                          {comment.userName.charAt(0)}
                        </div>
                        <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-zinc-900 text-sm">{comment.userName}</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    {viewTask.comments.length === 0 && (
                      <p className="text-center text-zinc-400 text-sm font-medium italic">No comments yet. Start the conversation!</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white border-t border-zinc-100 shrink-0">
                <form onSubmit={handleAddComment} className="flex gap-4">
                  <div className="flex-1 relative">
                    <textarea 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Ask a question or add an update..."
                      className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none font-medium h-[52px]"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-600 transition-colors">
                      <Paperclip size={18} />
                    </button>
                  </div>
                  <button type="submit" disabled={!commentText.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md flex items-center gap-2 h-[52px]">
                    Post
                  </button>
                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
