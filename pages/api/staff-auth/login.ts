// pages/api/staff-auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import crypto from 'crypto'

type Data = { ok: true } | { ok: false; error: string }
const TTL = 60 * 60 * 12 // 12h

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const { email, password } = (req.body || {}) as { email?: string; password?: string }
  const allowed = (process.env.STAFF_ALLOWED_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)

  const master = process.env.STAFF_PASSWORD || ''
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Falta email o contraseña' })
  if (!allowed.includes(email.toLowerCase()) || password !== master) {
    return res.status(401).json({ ok: false, error: 'Credenciales no válidas' })
  }

  const secret = process.env.STAFF_SESSION_SECRET || 'dev-secret'
  const payload = JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + TTL })
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  const token = Buffer.from(payload).toString('base64url') + '.' + sig

  res.setHeader(
    'Set-Cookie',
    serialize('staff_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: TTL,
    })
  )

  return res.status(200).json({ ok: true })
}
