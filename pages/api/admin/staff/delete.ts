import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteStaff } from '../../../../lib/store'

function isAdmin(req: NextApiRequest) {
  return (req.headers.cookie || '').includes('admin_session=')
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'No autorizado' })
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const { id } = req.body as { id?: string }
  if (!id) return res.status(400).json({ ok: false, error: 'Falta id' })

  deleteStaff(id)
  return res.status(200).json({ ok: true })
}
