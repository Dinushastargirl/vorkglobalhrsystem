import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    const appModule = await import('../src/server/app');
    const app = appModule.default;
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
      name: err.name,
      stack: err.stack,
      code: err.code
    });
  }
}
