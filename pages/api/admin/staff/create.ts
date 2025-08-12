import type { NextApiRequest, NextApiResponse } from 'next'
import { createStaffUser, StaffRole } from '../../../../lib/store'

function isAdmin(req: NextApiRequest) {
  return (req.headers.cookie || '').includes('admin_session=')
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'No autorizado' })
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const { name, username, email, role, password } = req.body as {
    name?: string; username?: string; email?: string; role?: StaffRole; password?: string
  }

  if (!name || !username || !role || !password) {
    return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' })
  }

  try {
    const user = createStaffUser({ name, username, email, role, password })
    return res.status(200).json({ ok: true, user: { id: user.id } })
  } catch (e) {
    return res.status(400).json({ ok: false, error: (e as Error).message })
  }
}
