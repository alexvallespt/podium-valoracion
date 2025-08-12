import type { NextApiRequest, NextApiResponse } from 'next'
import { listStaffUsers } from '../../../../lib/store'

function isAdmin(req: NextApiRequest) {
  return (req.headers.cookie || '').includes('admin_session=')
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'No autorizado' })
  if (req.method !== 'GET') return res.status(405).json({ ok: false })

  const users = listStaffUsers().map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
  }))
  return res.status(200).json({ ok: true, users })
}
