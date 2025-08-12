// pages/api/whoami.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getStore } from '../../lib/store'

// Intentamos ser tolerantes con el shape del store
type Sess = { username: string; role: 'admin' | 'fisio' | 'aux' }
type StoreMaybe = ReturnType<typeof getStore> & {
  sessions?: Record<string, Sess>
  adminSessions?: Record<string, Sess>
  staff?: any
  staffByUsername?: Record<string, string>
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const s = getStore() as StoreMaybe
  const cookies = req.cookies || {}

  // ⚠️ Ajusta estos nombres si tus endpoints usan otros
  const adminSid = cookies['admin_sid']
  const staffSid = cookies['staff_sid'] || cookies['sid']

  // 1) Prioriza ADMIN si existe
  if (adminSid && s.adminSessions?.[adminSid]) {
    const sess = s.adminSessions[adminSid]
    return res.status(200).json({
      ok: true,
      user: { username: sess.username, role: 'admin', kind: 'admin' },
    })
  }

  // 2) Si no hay admin, mira staff
  if (staffSid && s.sessions?.[staffSid]) {
    const sess = s.sessions[staffSid]
    return res.status(200).json({
      ok: true,
      user: { username: sess.username, role: sess.role, kind: 'staff' },
    })
  }

  return res.status(401).json({ ok: false, error: 'No autenticado' })
}