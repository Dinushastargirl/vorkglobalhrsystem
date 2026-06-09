import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Star, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

import * as userService from '../services/userService';
import * as taskService from '../services/taskService';
import * as lmsService from '../services/lmsService';
import * as attendanceService from '../services/attendanceService';

interface LeaderboardEntry extends UserProfile {
  score: number;
  level: number;
  tasksCompleted: number;
  coursesCompleted: number;
  attendanceScore: number;
}

const LEVEL_THRESHOLDS = [
  0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750, 3300, 3900, 4550, 5250
];

function getLevel(score: number) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [employees, tasks, courses, attendance] = await Promise.all([
          userService.getEmployees(),
          taskService.getTasks(),
          lmsService.getCourses(),
          attendanceService.getAttendance()
        ]);

        const entries: LeaderboardEntry[] = employees.filter(e => e.role !== 'super' && e.role !== 'owner').map(emp => {
          const empTasks = tasks.filter(t => t.assignedTo === emp.uid && t.status === 'Completed');
          const empCourses = courses.filter(c => c.assignedTo === emp.uid && c.status === 'Completed');
          const empAttendance = attendance.filter(a => a.userId === emp.uid && a.checkIn && !a.isLate);
          
          const score = emp.performanceScore || 0;

          return {
            ...emp,
            tasksCompleted: empTasks.length,
            coursesCompleted: empCourses.length,
            attendanceScore: attendanceScore,
            score,
            level: getLevel(score)
          };
        });

        entries.sort((a, b) => b.score - a.score);
        setLeaders(entries);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading leaderboard...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Company Leaderboard</h1>
          <p className="text-zinc-500 font-medium">15-Level Gamification & Performance Ranking</p>
        </div>
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center gap-3 pr-5">
          <Trophy size={24} />
          <span className="font-black tracking-widest uppercase text-sm">Season 1</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top 3 Podium */}
        <div className="lg:col-span-3 flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 min-h-[300px] mb-8">
          {/* 2nd Place */}
          {leaders[1] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-40 order-2 md:order-1">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-zinc-200 shadow-md flex items-center justify-center text-xl font-black text-zinc-400 mb-2 overflow-hidden z-10 relative">
                {leaders[1].photoUrl ? <img src={leaders[1].photoUrl} alt="" className="w-full h-full object-cover"/> : leaders[1].name.charAt(0)}
                <div className="absolute -bottom-2 -right-2 bg-zinc-200 w-8 h-8 rounded-full flex items-center justify-center"><Medal size={14} className="text-zinc-500"/></div>
              </div>
              <div className="bg-gradient-to-t from-zinc-200 to-zinc-100 w-full h-32 rounded-t-3xl border-t border-x border-zinc-200/50 flex flex-col items-center pt-4">
                <span className="text-2xl font-black text-zinc-400">2</span>
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2 truncate w-full text-center px-2">{leaders[1].name}</span>
                <span className="text-sm font-black text-zinc-800 mt-1">{leaders[1].score} pts</span>
                <span className="text-[10px] font-black bg-zinc-300 text-zinc-700 px-2 py-0.5 rounded-full mt-2">LVL {leaders[1].level}</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {leaders[0] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-48 order-1 md:order-2 z-20">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-yellow-400 shadow-xl flex items-center justify-center text-3xl font-black text-yellow-500 mb-2 overflow-hidden relative">
                {leaders[0].photoUrl ? <img src={leaders[0].photoUrl} alt="" className="w-full h-full object-cover"/> : leaders[0].name.charAt(0)}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"><Trophy size={14} /></div>
              </div>
              <div className="bg-gradient-to-t from-yellow-200 to-yellow-50 w-full h-40 rounded-t-3xl border-t border-x border-yellow-300/50 flex flex-col items-center pt-4 shadow-2xl">
                <span className="text-3xl font-black text-yellow-600">1</span>
                <span className="text-sm font-bold text-yellow-800 uppercase tracking-widest mt-2 truncate w-full text-center px-2">{leaders[0].name}</span>
                <span className="text-lg font-black text-yellow-900 mt-1">{leaders[0].score} pts</span>
                <span className="text-xs font-black bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full mt-2">LVL {leaders[0].level}</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {leaders[2] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center w-40 order-3 md:order-3">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-orange-300 shadow-md flex items-center justify-center text-xl font-black text-orange-400 mb-2 overflow-hidden relative z-10">
                {leaders[2].photoUrl ? <img src={leaders[2].photoUrl} alt="" className="w-full h-full object-cover"/> : leaders[2].name.charAt(0)}
                <div className="absolute -bottom-2 -right-2 bg-orange-200 w-8 h-8 rounded-full flex items-center justify-center"><Medal size={14} className="text-orange-600"/></div>
              </div>
              <div className="bg-gradient-to-t from-orange-200 to-orange-50 w-full h-24 rounded-t-3xl border-t border-x border-orange-200/50 flex flex-col items-center pt-2">
                <span className="text-2xl font-black text-orange-500">3</span>
                <span className="text-xs font-bold text-orange-800 uppercase tracking-widest mt-1 truncate w-full text-center px-2">{leaders[2].name}</span>
                <span className="text-sm font-black text-orange-900 mt-0.5">{leaders[2].score} pts</span>
                <span className="text-[10px] font-black bg-orange-300 text-orange-800 px-2 py-0.5 rounded-full mt-2">LVL {leaders[2].level}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* List of remaining players */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] border border-zinc-100 shadow-sm p-8">
          <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Complete Rankings
          </h3>
          <div className="space-y-4">
            {leaders.slice(3).map((leader, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                key={leader.uid} 
                className="flex items-center justify-between p-4 rounded-3xl border border-zinc-100 hover:border-blue-200 transition-all bg-zinc-50 hover:bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-black text-zinc-500">
                    {idx + 4}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white border-2 border-white shadow-sm flex items-center justify-center font-black text-zinc-400 overflow-hidden relative">
                     {leader.photoUrl ? <img src={leader.photoUrl} alt="" className="w-full h-full object-cover"/> : leader.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 flex items-center gap-2">
                      {leader.name}
                      <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Shield size={10} /> LVL {leader.level}
                      </span>
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{leader.branch || 'Headquarters'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-zinc-500">
                    <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-lg">
                      <Star size={14} className="text-yellow-500"/> {leader.tasksCompleted} Tasks
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-lg">
                      <Award size={14} className="text-blue-500"/> {leader.coursesCompleted} Courses
                    </div>
                  </div>
                  <div className="text-lg font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl shadow-sm">
                    {leader.score} pts
                  </div>
                </div>
              </motion.div>
            ))}
            {leaders.length <= 3 && (
              <div className="text-center py-8 text-zinc-400 font-medium bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed">
                Keep participating to appear on the leaderboard!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
