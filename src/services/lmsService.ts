import { Course, CourseStatus } from '../types';

export async function getCourses(userId?: string): Promise<Course[]> {
  const url = userId ? `/api/courses?userId=${userId}` : '/api/courses';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch courses');
  const courses: Course[] = await res.json();
  
  if (userId) {
    return courses.filter(c => c.assignedTo === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveCourse(course: Partial<Course>): Promise<void> {
  const newCourse = {
    title: course.title || '',
    description: course.description || '',
    type: course.type || 'Course',
    durationHours: course.durationHours || 0,
    deadline: course.deadline || new Date().toISOString().split('T')[0],
    assignedTo: course.assignedTo || '',
    assignedBy: course.assignedBy || '',
    status: course.status || 'Not Started',
    progressPercent: course.progressPercent || 0,
    createdAt: new Date().toISOString()
  };

  const url = course.id ? `/api/courses/${course.id}` : '/api/courses';
  const method = course.id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCourse)
  });
  if (!res.ok) throw new Error('Failed to save course');
}

export async function updateCourseStatus(id: string, status: CourseStatus, progressPercent?: number, proofUrl?: string): Promise<void> {
  const updates: any = { status };
  if (progressPercent !== undefined) {
    updates.progressPercent = progressPercent;
  }
  if (proofUrl !== undefined) {
    updates.proofUrl = proofUrl;
  }

  const res = await fetch(`/api/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update course status');
}

export async function deleteCourse(id: string): Promise<void> {
  const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete course');
}
