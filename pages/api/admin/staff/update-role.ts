import type { NextApiRequest, NextApiResponse } from 'next'
import { setStaffRole, StaffRole } from '../../../../lib/store'

function isAdmin(req: NextApiRequest) {
  return (req.headers.cookie || '').includes('admin_session=')
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'No autorizado' })
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const { id, role } = req.body as { id?: string; role?: StaffRole }
  if (!id || !role) return res.status(400).json({ ok: false, error: 'Faltan id/role' })

  try {
    setStaffRole(id, role)
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(400).json({ ok: false, error: (e as Error).message })
  }
}
