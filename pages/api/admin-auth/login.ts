import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { email, password } = req.body as { email?: string; password?: string };

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@podium.local';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'podium123';

  if (!email || !password) return res.status(400).json({ ok: false, error: 'Faltan credenciales' });

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const maxAge = 60 * 60 * 8; // 8h
    res.setHeader(
      'Set-Cookie',
      `admin_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
}
