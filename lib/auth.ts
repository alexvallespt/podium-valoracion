// lib/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getStore,
  getStaffByUsername,
  listStaffUsers,
  type StaffRole,
  type StaffUser,
} from './store'

type SessionData = {
  username: string
  role: StaffRole
  login: number
}

function getSessionFromCookie(
  req: NextApiRequest,
  cookieName: 'admin_session' | 'staff_session'
): SessionData | null {
  const sid = req.cookies?.[cookieName]
  if (!sid) return null
  const store = getStore()
  const s = (store.sessions || {})[sid]
  return s || null
}

function getUserBySession(s: SessionData | null): StaffUser | null {
  if (!s) return null
  const u = getStaffByUsername(s.username)
  return u || null
}

/** Prioriza admin si existen ambas cookies */
export function getUserFromRequest(req: NextApiRequest): StaffUser | null {
  const adminSess = getSessionFromCookie(req, 'admin_session')
  const staffSess = getSessionFromCookie(req, 'staff_session')

  // Primero admin válido
  if (adminSess?.role === 'admin') {
    const u = getUserBySession(adminSess)
    if (u && u.role === 'admin' && u.active) return u
  }

  // Luego staff (incluye admin si sólo tuviera cookie de staff)
  if (staffSess) {
    const u = getUserBySession(staffSess)
    if (u && u.active) return u
  }

  return null
}

export function getAdminFromRequest(req: NextApiRequest): StaffUser | null {
  const adminSess = getSessionFromCookie(req, 'admin_session')
  if (!adminSess || adminSess.role !== 'admin') return null
  const u = getUserBySession(adminSess)
  return u && u.role === 'admin' && u.active ? u : null
}

export function getStaffFromRequest(req: NextApiRequest): StaffUser | null {
  const u = getUserFromRequest(req)
  if (!u) return null
  // Cualquier rol del staff (admin, fisio, aux) sirve como “logueado”
  return u.active ? u : null
}

/** Middleware sencillo para APIs que requieren admin */
export function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): StaffUser | null {
  const u = getAdminFromRequest(req)
  if (!u) {
    res.status(401).json({ ok: false, error: 'Necesitas sesión de administrador' })
    return null
  }
  return u
}

/** Middleware para APIs que requieren staff (o admin) */
export function requireStaff(
  req: NextApiRequest,
  res: NextApiResponse
): StaffUser | null {
  const u = getStaffFromRequest(req)
  if (!u) {
    res.status(401).json({ ok: false, error: 'Necesitas iniciar sesión' })
    return null
  }
  return u
}

/** Utilidad: ¿hay al menos un admin activo? */
export function hasActiveAdmin(): boolean {
  return listStaffUsers().some(u => u.role === 'admin' && u.active)
}
