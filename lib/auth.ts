import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getStore } from './store';
import type { Role } from './roles';

// Cookie helpers (sin dependencias externas)
function readCookie(req: NextApiRequest, name: string): string | null {
  const raw = req.headers.cookie || '';
  const parts = raw.split(';').map(s => s.trim());
  for (const p of parts) {
    const [k, ...rest] = p.split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function writeCookie(
  res: NextApiResponse,
  name: string,
  value: string,
  opts: { maxAgeSeconds?: number } = {}
) {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  if (opts.maxAgeSeconds) attrs.push(`Max-Age=${opts.maxAgeSeconds}`);
  res.setHeader('Set-Cookie', attrs.join('; '));
}

// Sesiones en memoria (staging). En producción migra a DB/Redis.
type Session = { userId: string; createdAt: number };
const SESSIONS: Map<string, Session> = new Map();

export function setSession(res: NextApiResponse, userId: string) {
  const sid = crypto.randomBytes(16).toString('hex');
  SESSIONS.set(sid, { userId, createdAt: Date.now() });
  writeCookie(res, 'sid', sid, { maxAgeSeconds: 60 * 60 * 24 * 7 }); // 7 días
}

export function clearSession(res: NextApiResponse) {
  writeCookie(res, 'sid', '', { maxAgeSeconds: 0 });
}

export function getUserFromRequest(req: NextApiRequest) {
  const sid = readCookie(req, 'sid');
  if (!sid) return null;
  const s = SESSIONS.get(sid);
  if (!s) return null;
  const store = getStore();
  const user = store.users.get(s.userId) || null;
  return user;
}

export function requireRole(
  req: NextApiRequest,
  res: NextApiResponse,
  roles: Role[]
) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'No autenticado' });
    return null;
  }
  if (!roles.includes(user.role)) {
    res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    return null;
  }
  return user;
}
