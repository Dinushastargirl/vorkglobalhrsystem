import { PerformanceRecord } from '../types';
import * as userService from './userService';

const KEY = 'hr_pulse_v8_performance';

function getStoredPerformance(): PerformanceRecord[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredPerformance(perf: PerformanceRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(perf));
}

export async function getPerformance(userId?: string): Promise<PerformanceRecord[]> {
  const records = getStoredPerformance();
  const emps = await userService.getEmployees();

  const mapped = records.map(d => {
    const emp = emps.find(e => e.uid === d.userId);
    const evaluator = emps.find(e => e.uid === d.evaluatorId);
    return {
      ...d,
      userName: emp?.name || 'Unknown',
      evaluatorName: evaluator?.name || d.evaluatorName || 'System'
    };
  });

  if (userId) {
    return mapped.filter(r => r.userId === userId).sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }
  return mapped.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

export async function savePerformance(perf: Partial<PerformanceRecord>): Promise<void> {
  const records = getStoredPerformance();
  const id = perf.id;

  const payload: PerformanceRecord = {
    id: id || `perf-${Date.now()}`,
    userId: perf.userId || '',
    userName: perf.userName || '',
    evaluatorId: perf.evaluatorId || '',
    evaluatorName: perf.evaluatorName || '',
    score: perf.score || 0,
    rating: perf.rating || 0,
    feedback: perf.feedback || '',
    hrFeedback: perf.hrFeedback || '',
    selfEvaluation: perf.selfEvaluation || '',
    goals: perf.goals || [],
    status: perf.status || 'Draft',
    createdAt: perf.createdAt || new Date().toISOString()
  };

  if (id) {
    const index = records.findIndex(r => r.id === id);
    if (index > -1) {
      records[index] = payload;
    }
  } else {
    records.push(payload);
  }
  saveStoredPerformance(records);
}
