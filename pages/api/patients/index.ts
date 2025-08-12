import type { NextApiRequest, NextApiResponse } from 'next';
import { listPatients } from '../../../lib/store';
import { getUserFromRequest, requireRole } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const me = requireRole(req, res, ['ADMIN', 'STAFF']);
  if (!me) return;

  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const items = listPatients().map(p => {
    const base = {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      visits: p.visits,
      lastIntakeAt: p.lastIntakeAt,
    };
    // STAFF no ve PII
    if (me.role === 'STAFF') return base;
    return { ...base, email: p.email, phone: p.phone };
  });

  res.status(200).json({ ok: true, patients: items });
}
