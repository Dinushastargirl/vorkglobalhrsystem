import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "hr-pulse-secret-key-123";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "HR Pulse API is running" });
  });

  const getJsonFile = (filename: string) => {
    const filepath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filepath)) return [];
    try { return JSON.parse(fs.readFileSync(filepath, 'utf8')); } catch { return []; }
  };
  const saveJsonFile = (filename: string, data: any) => {
    fs.writeFileSync(path.join(process.cwd(), filename), JSON.stringify(data, null, 2));
  };

  app.get("/api/tasks", (req, res) => res.json(getJsonFile('tasks.json')));
  app.post("/api/tasks", (req, res) => { saveJsonFile('tasks.json', req.body); res.json({ success: true }); });

  app.get("/api/qualifications", (req, res) => res.json(getJsonFile('qualifications.json')));
  app.post("/api/qualifications", (req, res) => { saveJsonFile('qualifications.json', req.body); res.json({ success: true }); });

  app.get("/api/employees", (req, res) => res.json(getJsonFile('employees.json')));
  app.post("/api/employees", (req, res) => { saveJsonFile('employees.json', req.body); res.json({ success: true }); });

  // Mock Auth for demonstration of JWT requirement
  // In a real app, we'd use Firebase Auth tokens, but the user asked for JWT/Bcrypt
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    // This is a simplified mock. In the real app, we use Firebase Auth on the frontend.
    // We issue a backend JWT for any server-side protected routes.
    const token = jwt.sign({ email, role: 'employee' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
