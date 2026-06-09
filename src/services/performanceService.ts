import { PerformanceRecord } from '../types';
import * as userService from './userService';

export async function getPerformance(userId?: string): Promise<PerformanceRecord[]> {
  const url = userId ? `/api/performance?userId=${userId}` : '/api/performance';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch performance');
  const records: PerformanceRecord[] = await res.json();
  
  const emps = await userService.getEmployees();
  
  return records.map(d => {
    const emp = emps.find(e => e.uid === d.userId);
    const evaluator = emps.find(e => e.uid === d.evaluatorId || e.name === d.evaluatorName);
    return {
      ...d,
      userName: emp?.name || 'Unknown',
      evaluatorName: evaluator?.name || d.evaluatorName || 'System',
      goals: typeof d.goals === 'string' ? JSON.parse(d.goals) : (d.goals || []),
      metrics: typeof d.metrics === 'string' ? JSON.parse(d.metrics) : d.metrics
    };
  });
}

export async function savePerformance(perf: Partial<PerformanceRecord>): Promise<void> {
  const payload = {
    userId: perf.userId || '',
    userName: perf.userName || '',
    month: perf.month || new Date().getMonth(),
    year: perf.year || new Date().getFullYear(),
    evaluatorId: perf.evaluatorId || '',
    evaluatorName: perf.evaluatorName || '',
    score: perf.score || 0,
    rating: perf.rating || 0,
    feedback: perf.feedback || '',
    hrFeedback: perf.hrFeedback || '',
    selfEvaluation: perf.selfEvaluation || '',
    goals: perf.goals || [],
    metrics: perf.metrics,
    status: perf.status || 'Draft',
    evaluator: perf.evaluator || perf.evaluatorId || '',
    createdAt: perf.createdAt || new Date().toISOString()
  };

  const url = perf.id ? `/api/performance/${perf.id}` : '/api/performance';
  const method = perf.id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save performance');
}
