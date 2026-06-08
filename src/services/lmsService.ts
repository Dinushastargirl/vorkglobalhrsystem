import { Course, CourseStatus } from '../types';

const KEY = 'vorkca_hr_lms_v1';

function getStoredCourses(): Course[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredCourses(courses: Course[]) {
  localStorage.setItem(KEY, JSON.stringify(courses));
}

export async function getCourses(userId?: string): Promise<Course[]> {
  const courses = getStoredCourses();
  if (userId) {
    return courses.filter(c => c.assignedTo === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveCourse(course: Partial<Course>): Promise<void> {
  const courses = getStoredCourses();
  
  if (course.id) {
    const index = courses.findIndex(c => c.id === course.id);
    if (index > -1) {
      courses[index] = { ...courses[index], ...course };
    }
  } else {
    courses.push({
      id: `course-${Date.now()}`,
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
    });
  }
  
  saveStoredCourses(courses);
}

export async function updateCourseStatus(id: string, status: CourseStatus, progressPercent?: number, proofUrl?: string): Promise<void> {
  const courses = getStoredCourses();
  const index = courses.findIndex(c => c.id === id);
  if (index > -1) {
    courses[index].status = status;
    if (progressPercent !== undefined) {
      courses[index].progressPercent = progressPercent;
    }
    if (proofUrl !== undefined) {
      courses[index].proofUrl = proofUrl;
    }
    saveStoredCourses(courses);
  }
}

export async function deleteCourse(id: string): Promise<void> {
  const courses = getStoredCourses();
  const filtered = courses.filter(c => c.id !== id);
  saveStoredCourses(filtered);
}
