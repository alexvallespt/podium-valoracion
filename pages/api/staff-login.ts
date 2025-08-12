import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyStaffCredentials } from '../../lib/store'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const { username, password } = req.body as { username?: string; password?: string }
  if (!username || !password) return res.status(400).json({ ok: false, error: 'Faltan credenciales' })

  const user = verifyStaffCredentials(username, password)
  if (!user) return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' })

  const maxAge = 60 * 60 * 8 // 8h
  res.setHeader(
    'Set-Cookie',
    `staff_session=${encodeURIComponent(user.id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
  )
  return res.status(200).json({ ok: true, user: { id: user.id, role: user.role, name: user.name } })
}

