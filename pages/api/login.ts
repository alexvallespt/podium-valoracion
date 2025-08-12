import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../../../lib/store';
import { setSession, clearSession } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Faltan credenciales' });

  const user = findUserByEmail(String(email));
  if (!user) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });

  setSession(res, user.id);
  res.status(200).json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}

// Puedes crear otro endpoint /api/auth/logout si lo necesitas:
export async function logout(_req: NextApiRequest, res: NextApiResponse) {
  clearSession(res);
  res.status(200).json({ ok: true });
}
