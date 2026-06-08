import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

import * as userService from '../services/userService';
import * as taskService from '../services/taskService';
import * as qualificationService from '../services/qualificationService';

interface LeaderboardEntry extends UserProfile {
  score: number;
  tasksCompleted: number;
  qualsCompleted: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [employees, tasks, quals] = await Promise.all([
          userService.getEmployees(),
          taskService.getAllTasks(),
          qualificationService.getAllQualifications()
        ]);

        const entries: LeaderboardEntry[] = employees.filter(e => e.role !== 'super' && e.role !== 'owner').map(emp => {
          const empTasks = tasks.filter(t => t.userId === emp.uid && t.completed);
          const empQuals = quals.filter(q => q.userId === emp.uid && q.completed);
          
          const score = (empTasks.length * 10) + (empQuals.length * 20);

          return {
            ...emp,
            tasksCompleted: empTasks.length,
            qualsCompleted: empQuals.length,
            score
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
          <h1 className="text-3xl font-black text-zinc-900">Leaderboard</h1>
          <p className="text-zinc-500 font-medium">Top performers based on task completion and qualifications</p>
        </div>
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
          <Trophy size={24} />
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
                  <div className="w-12 h-12 rounded-xl bg-white border-2 border-white shadow-sm flex items-center justify-center font-black text-zinc-400 overflow-hidden">
                     {leader.photoUrl ? <img src={leader.photoUrl} alt="" className="w-full h-full object-cover"/> : leader.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{leader.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{leader.branch}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-zinc-500">
                    <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-lg">
                      <Star size={12} className="text-yellow-500"/> {leader.tasksCompleted} Tasks
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-lg">
                      <Award size={12} className="text-blue-500"/> {leader.qualsCompleted} Quals
                    </div>
                  </div>
                  <div className="text-lg font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-2xl">
                    {leader.score} pts
                  </div>
                </div>
              </motion.div>
            ))}
            {leaders.length <= 3 && (
              <div className="text-center py-8 text-zinc-400 font-medium">No other employees ranked yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
