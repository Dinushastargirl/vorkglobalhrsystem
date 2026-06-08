import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  BookOpen, Plus, Trash2, CheckCircle2, Search, Award,
  Clock, Calendar, User, FileCheck, CheckSquare, Upload,
  Briefcase
} from 'lucide-react';
import { Course, UserProfile, CourseType, CourseStatus } from '../types';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from '../hooks/useAuth';
import * as lmsService from '../services/lmsService';
import * as userService from '../services/userService';

export default function LMS() {
  const { user, uid } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  const isAdmin = user?.role === 'super' || user?.role === 'owner' || user?.role === 'hr';

  const loadData = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [allCourses, allEmployees] = await Promise.all([
        lmsService.getCourses(isAdmin ? undefined : uid),
        userService.getEmployees()
      ]);
      setCourses(allCourses);
      setEmployees(allEmployees);
    } catch (err) {
      console.error('Error loading LMS:', err);
      toast.error('Failed to sync courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid, isAdmin]);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.title?.trim() || !uid) return;

    try {
      await lmsService.saveCourse({
        ...editingCourse,
        assignedBy: editingCourse.assignedBy || uid
      });
      setIsModalOpen(false);
      setEditingCourse(null);
      toast.success(editingCourse.id ? 'Course updated' : 'Course assigned successfully');
      loadData();
    } catch (e: any) {
      toast.error('Failed to save course');
    }
  };

  const updateStatus = async (id: string, status: CourseStatus, progress: number) => {
    try {
      await lmsService.updateCourseStatus(id, status, progress);
      loadData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const deleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this learning item?')) return;
    try {
      await lmsService.deleteCourse(id);
      toast.success('Course deleted');
      loadData();
    } catch (e) {
      toast.error('Failed to delete course');
    }
  };

  const handleFileUpload = (id: string, file: File) => {
    // Mock upload proof
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await lmsService.updateCourseStatus(id, 'Completed', 100, reader.result as string);
        toast.success('Proof submitted and course marked as complete!');
        loadData();
      } catch (err) {
        toast.error('Failed to submit proof');
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading learning center...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Learning Center</h1>
          <p className="text-zinc-500 font-medium">Manage training, courses, and certifications</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingCourse({
                title: '', description: '', type: 'Course', 
                durationHours: 1, assignedTo: uid || '', assignedBy: uid || '',
                deadline: new Date().toISOString().split('T')[0],
                status: 'Not Started', progressPercent: 0
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Plus size={20} />
            Assign Learning
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-4xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="lg:col-span-3 text-center py-20 bg-white rounded-4xl border border-zinc-100 shadow-sm">
            <BookOpen size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-medium">No learning programs assigned yet.</p>
          </div>
        ) : (
          filteredCourses.map(course => {
            const assigneeName = employees.find(e => e.uid === course.assignedTo)?.name || 'Unknown';
            return (
              <div key={course.id} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col hover:border-blue-200 transition-all">
                <div className="p-6 border-b border-zinc-50 relative">
                  {isAdmin && (
                    <button onClick={() => deleteCourse(course.id)} className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 bg-zinc-50 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      {course.type === 'Certification' ? <Award size={20} /> : <BookOpen size={20} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{course.type}</span>
                      <h3 className="text-lg font-black text-zinc-900 pr-8 line-clamp-1">{course.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2">{course.description}</p>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Duration</span>
                      <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5"><Clock size={14} className="text-zinc-400"/> {course.durationHours} Hours</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Deadline</span>
                      <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5"><Calendar size={14} className="text-zinc-400"/> {formatDate(course.deadline)}</span>
                    </div>
                    {isAdmin && (
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Assigned To</span>
                        <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5"><User size={14} className="text-zinc-400"/> {assigneeName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
                      <span className="text-xs font-black text-blue-600">{course.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${course.progressPercent}%` }} />
                    </div>
                    
                    <div className="flex gap-2">
                      {course.status === 'Not Started' && (
                        <button onClick={() => updateStatus(course.id, 'In Progress', 10)} className="flex-1 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold transition-all hover:bg-zinc-800 shadow-md">
                          Start Learning
                        </button>
                      )}
                      {course.status === 'In Progress' && (
                        <>
                          <button onClick={() => updateStatus(course.id, 'In Progress', Math.min(99, course.progressPercent + 25))} className="flex-1 py-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-sm font-bold transition-all hover:bg-blue-100">
                            Update Progress
                          </button>
                          <label className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-green-600 transition-all shadow-md">
                            <Upload size={16} /> Complete
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => {
                              if(e.target.files?.[0]) handleFileUpload(course.id, e.target.files[0]);
                            }} />
                          </label>
                        </>
                      )}
                      {course.status === 'Completed' && (
                        <div className="flex-1 py-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-default">
                          <CheckCircle2 size={16} /> Completed
                        </div>
                      )}
                    </div>
                    {course.proofUrl && (
                      <a href={course.proofUrl} target="_blank" rel="noreferrer" className="block mt-3 text-center text-xs font-bold text-blue-600 hover:underline">
                        View Submitted Proof
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-white rounded-4xl shadow-2xl border border-zinc-100">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-2xl font-black text-zinc-900">Assign Program</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl">✕</button>
              </div>
              <form onSubmit={handleSaveCourse} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Program Title</label>
                  <input type="text" required value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea required value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} rows={3} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Type</label>
                    <select value={editingCourse.type} onChange={e => setEditingCourse({...editingCourse, type: e.target.value as CourseType})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold appearance-none">
                      <option value="Course">Course</option>
                      <option value="Certification">Certification</option>
                      <option value="Training Program">Training Program</option>
                      <option value="Learning Material">Learning Material</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Assign To</label>
                    <select value={editingCourse.assignedTo} onChange={e => setEditingCourse({...editingCourse, assignedTo: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold appearance-none">
                      {employees.map(emp => (
                        <option key={emp.uid} value={emp.uid}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Est. Duration (Hrs)</label>
                    <input type="number" min="1" value={editingCourse.durationHours} onChange={e => setEditingCourse({...editingCourse, durationHours: Number(e.target.value)})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Deadline</label>
                    <input type="date" required value={editingCourse.deadline} onChange={e => setEditingCourse({...editingCourse, deadline: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                  Assign Program
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
