import type { NextApiRequest, NextApiResponse } from 'next';
import { getPatientById } from '../../../lib/store';
import { requireRole } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const me = requireRole(req, res, ['ADMIN', 'STAFF']);
  if (!me) return;

  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ ok: false, error: 'Falta id' });

  const p = getPatientById(id);
  if (!p) return res.status(404).json({ ok: false, error: 'Paciente no encontrado' });

  const result: any = {
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    visitIds: p.visitIds,
    intakes: p.intakes, // histórico
  };
  if (me.role === 'ADMIN') {
    result.email = p.email;
    result.phone = p.phone;
  }
  res.status(200).json({ ok: true, patient: result });
}
