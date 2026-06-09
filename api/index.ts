import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    const appModule = await import('../src/server/app');
    const app = appModule.default;
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Cold Start Error:", err);
    res.status(500).json({
      error: "Vercel Cold Start Error",
      message: err.message,
      stack: err.stack,
      name: err.name
    });
  }
}
