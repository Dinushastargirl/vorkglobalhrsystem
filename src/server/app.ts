import express from 'express';
import { prisma } from '../../api/utils/prisma.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "hr-pulse-secret-key-123";

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// --- Seed ---
app.post('/api/seed', async (req, res) => {
  try {
    const existing = await prisma.user.count();
    if (existing > 0) {
      return res.status(400).json({ error: 'Database already seeded' });
    }

    const dinusha = await prisma.user.create({
      data: {
        name: 'Dinusha Pushparajah', email: 'dinushapushparajah@gmail.com', username: 'dinusha', role: 'super',
        salaryA: 80000, epf: 6400, net: 73600, joinDate: '2026-03-01'
      }
    });

    const nisal = await prisma.user.create({
      data: {
        name: 'Nisal Sathsara', email: 'nisalsathsara@gmail.com', username: 'nisal', role: 'employee',
        salaryA: 50000, epf: 4000, net: 46000, joinDate: '2026-05-01'
      }
    });

    const jayaminda = await prisma.user.create({
      data: {
        name: 'Sasindu Jayaminda Mohotti', email: 'msjayaminda@gmail.com', username: 'jayaminda', role: 'employee',
        salaryA: 50000, epf: 4000, net: 46000, joinDate: '2026-05-01'
      }
    });

    const janani = await prisma.user.create({
      data: {
        name: 'Janani Rashmika', email: 'jananirashmika@gmail.com', username: 'janani', role: 'employee',
        salaryA: 50000, epf: 4000, net: 46000, joinDate: '2026-05-01'
      }
    });

    res.json({ success: true, count: 4 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// --- Mock Auth ---
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const token = jwt.sign({ email, role: 'employee' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// --- Users ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:uid', async (req, res) => {
  try {
    const user = await prisma.user.upsert({
      where: { uid: req.params.uid },
      update: req.body,
      create: { ...req.body, uid: req.params.uid }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// --- Attendance ---
app.get('/api/attendance', async (req, res) => {
  try {
    const { userId } = req.query;
    const records = await prisma.attendanceRecord.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { date: 'desc' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const record = await prisma.attendanceRecord.create({ data: req.body });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create attendance' });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const record = await prisma.attendanceRecord.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// --- Leaves ---
app.get('/api/leaves', async (req, res) => {
  try {
    const { userId } = req.query;
    const leaves = await prisma.leaveRequest.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaves' });
  }
});

app.post('/api/leaves', async (req, res) => {
  try {
    const leave = await prisma.leaveRequest.create({ data: req.body });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create leave' });
  }
});

app.put('/api/leaves/:id', async (req, res) => {
  try {
    const leave = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update leave' });
  }
});

app.delete('/api/leaves/:id', async (req, res) => {
  try {
    await prisma.leaveRequest.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete leave' });
  }
});

// --- Payroll ---
app.get('/api/payroll', async (req, res) => {
  try {
    const { userId } = req.query;
    const payrolls = await prisma.payrollRecord.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { sortOrder: 'asc' }
    });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

app.post('/api/payroll', async (req, res) => {
  try {
    const payroll = await prisma.payrollRecord.create({ data: req.body });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payroll' });
  }
});

app.put('/api/payroll/:id', async (req, res) => {
  try {
    const payroll = await prisma.payrollRecord.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payroll' });
  }
});

// --- Support Tickets ---
app.get('/api/support', async (req, res) => {
  try {
    const { userId } = req.query;
    const reqs = await prisma.attendanceSupportRequest.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(reqs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch support requests' });
  }
});

app.post('/api/support', async (req, res) => {
  try {
    const reqData = await prisma.attendanceSupportRequest.create({ data: req.body });
    res.json(reqData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create support request' });
  }
});

app.put('/api/support/:id', async (req, res) => {
  try {
    const reqData = await prisma.attendanceSupportRequest.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(reqData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update support request' });
  }
});

// --- Tasks ---
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = await prisma.task.create({ data: req.body });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// --- Courses ---
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const course = await prisma.course.create({ data: req.body });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// --- Advances ---
app.get('/api/advances', async (req, res) => {
  try {
    const { userId } = req.query;
    const advances = await prisma.advanceRequest.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(advances);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch advances' });
  }
});

app.post('/api/advances', async (req, res) => {
  try {
    const advance = await prisma.advanceRequest.create({ data: req.body });
    res.json(advance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create advance' });
  }
});

app.put('/api/advances/:id', async (req, res) => {
  try {
    const advance = await prisma.advanceRequest.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(advance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update advance' });
  }
});

app.delete('/api/advances/:id', async (req, res) => {
  try {
    await prisma.advanceRequest.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete advance' });
  }
});

// --- Performance ---
app.get('/api/performance', async (req, res) => {
  try {
    const { userId } = req.query;
    const records = await prisma.performanceRecord.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
});

app.post('/api/performance', async (req, res) => {
  try {
    const record = await prisma.performanceRecord.create({ data: req.body });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create performance' });
  }
});

app.put('/api/performance/:id', async (req, res) => {
  try {
    const record = await prisma.performanceRecord.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update performance' });
  }
});

app.delete('/api/performance/:id', async (req, res) => {
  try {
    await prisma.performanceRecord.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete performance' });
  }
});

export default app;
