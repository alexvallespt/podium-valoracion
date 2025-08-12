import type { NextApiRequest, NextApiResponse } from 'next';

function parseCookie(header?: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  header.split(';').forEach(p => {
    const [k, ...rest] = p.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parseCookie(req.headers.cookie || '');
  const session = cookies['admin_session'];
  if (session) return res.status(200).json({ ok: true, role: 'admin' });
  return res.status(401).json({ ok: false });
}
